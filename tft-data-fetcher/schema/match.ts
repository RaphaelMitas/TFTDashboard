import { MatchTFTDTO, ParticipantDTO } from 'twisted/dist/models-dto';
import { db } from '../database';

export interface IParticipant extends ParticipantDTO {
    augments: string[];
    placement: number;
}

export interface IMatch extends Omit<MatchTFTDTO, 'info'> {
    info: {
        participants: IParticipant[];
        tft_game_type: string;
    } & Omit<MatchTFTDTO['info'], 'participants'>;
}

interface IAugmentStats {
    augment: string;
    augment_at_stage: number;
    game_version: string;
    total_games: number;
    wins: number;
    games_with_placement_1_to_4: number;
    average_placement_at_stage?: number;
    total_placement: number;
}

export function isIMatch(data: any): data is IMatch {
    return (
        data.info.participants.every((participant: any) =>
            Array.isArray(participant.augments) &&
            typeof participant.placement === 'number'
        )
    );
}


export async function getMatchById(id: string) {
    const matchRef = db.collection('tftmatches').doc(id);
    const doc = await matchRef.get();
    if (doc.exists) {
        return doc.data() as IMatch;
    } else {
        return null
    }
}

/**
 * Save match to firestore and update augment stats
 */
let matchBuffer: IMatch[] = [];
const augmentStatsBuffer: { [key: string]: IAugmentStats } = {};
let isWritingToFirestore = false;

export async function saveMatchAndUpdateStats(match: IMatch) {
    while (isWritingToFirestore) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Push the match to the buffer
    matchBuffer.push(match);


    // Update the augment stats in the buffer
    const participants = match.info.participants;
    for (const participant of participants) {
        for (let i = 0; i < participant.augments.length; i++) {
            const augment = participant.augments[i];
            const key = `${augment}-${i + 2}-${match.info.game_version}`;
            if (!augmentStatsBuffer[key]) {
                augmentStatsBuffer[key] = {
                    augment,
                    augment_at_stage: i + 2,
                    game_version: match.info.game_version,
                    total_games: 0,
                    wins: 0,
                    games_with_placement_1_to_4: 0,
                    total_placement: 0,
                    average_placement_at_stage: 0
                };
            }
            const stats = augmentStatsBuffer[key];
            stats.total_games++;
            stats.wins += participant.placement === 1 ? 1 : 0;
            stats.games_with_placement_1_to_4 += participant.placement >= 1 && participant.placement <= 4 ? 1 : 0;
            stats.total_placement += participant.placement;
            stats.average_placement_at_stage = stats.total_placement / stats.total_games;
        }
    }

    console.log(`Match buffer size: ${matchBuffer.length}, Augment stats buffer size: ${Object.keys(augmentStatsBuffer).length}`);
    // If buffer reaches 500, write to Firestore
    if (matchBuffer.length >= 250) {
        await writeToFirestore();
    }
}

function createBatches(operations: any[]) {
    const batches = [];
    for (let i = 0; i < operations.length; i += 500) {
        const batch = db.batch();
        const operationsChunk = operations.slice(i, i + 500);
        for (const operation of operationsChunk) {
            if (operation.type === 'set') {
                batch.set(operation.ref, operation.data);
            } else {
                batch.delete(operation.ref);
            }
        }
        batches.push(batch);
    }
    return batches;
}

async function writeToFirestoreBatches(batches: FirebaseFirestore.WriteBatch[]) {
    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 1000;
    let success = false;
    let retryCount = 0;
    let batchStart = 0;

    while (!success && retryCount < MAX_RETRIES) {
        try {
            for (let i = batchStart; i < batches.length; i++) {
                await batches[i].commit();
            }
            success = true;
        } catch (error) {
            console.error(`Error writing to Firestore at batch starting from ${batchStart}: ${error}`);
            retryCount++;
            batchStart++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }

    if (!success) {
        console.error(`Failed to write to Firestore after ${MAX_RETRIES} retries.`);
    }
}

async function writeToFirestore() {
    isWritingToFirestore = true;
    console.log('Starting to write to Firestore...');
    const allOperations = [];

    // Prepare match operations
    for (const match of matchBuffer) {
        const matchRef = db.collection('tftmatches').doc(match.metadata.match_id);
        allOperations.push({ type: 'set', ref: matchRef, data: match });
    }

    // Prepare augmentStats operations
    const augmentStatsCollection = db.collection('augmentStats');
    for (const statsKey in augmentStatsBuffer) {
        const stats = augmentStatsBuffer[statsKey];
        const augmentStatsSnapshot = await augmentStatsCollection.where('augment', '==', stats.augment)
            .where('augment_at_stage', '==', stats.augment_at_stage)
            .where('game_version', '==', stats.game_version)
            .get();

        let augmentStatsRef: FirebaseFirestore.DocumentReference;
        if (!augmentStatsSnapshot.empty) {
            // Merge the existing stats with the buffer
            const existingStats = augmentStatsSnapshot.docs[0].data() as IAugmentStats;
            stats.total_games += existingStats.total_games;
            stats.wins += existingStats.wins;
            stats.games_with_placement_1_to_4 += existingStats.games_with_placement_1_to_4;
            stats.total_placement += existingStats.total_placement;
            stats.average_placement_at_stage = stats.total_placement / stats.total_games;
            augmentStatsRef = augmentStatsSnapshot.docs[0].ref;
        } else {
            augmentStatsRef = augmentStatsCollection.doc();
        }
        allOperations.push({ type: 'set', ref: augmentStatsRef, data: stats });
    }

    const batches = createBatches(allOperations);
    await writeToFirestoreBatches(batches);

    matchBuffer = [];
    Object.keys(augmentStatsBuffer).forEach(key => delete augmentStatsBuffer[key]);

    console.log('Finished writing to Firestore.');
    isWritingToFirestore = false;
}




/**
 * delete old matches 
 * @param olderThanDays number of days
 */
export async function deleteOldMatches(olderThanDays: number) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - (olderThanDays * 24 * 60 * 60 * 1000));
    console.log(`Starting to delete matches older than ${cutoff} ...`)

    const Query = db.collection('tftmatches').orderBy('info.game_datetime');
    const snapshot = await Query.limit(1).get();
    let currentMatch = snapshot.docs[0].data() as IMatch;
    let countDeletions = 0;
    let countAugmentDeletions = 0;

    console.log(`currentMatch.info.game_datetime: ${currentMatch.info.game_datetime}, cutoff: ${cutoff.getTime()}`)

    while (currentMatch.info.game_datetime < cutoff.getTime()) {
        await db.runTransaction(async (transaction) => {
            const matchRef = db.collection('tftmatches').doc(currentMatch.metadata.match_id);
            transaction.delete(matchRef);
            countDeletions++;
            if (countDeletions % 100 === 0) {
                console.log(`Deleted ${countDeletions} matches so far...`);
            }

            const participants = currentMatch.info.participants;
            for (const participant of participants) {
                for (let i = 0; i < participant.augments.length; i++) {
                    const augment = participant.augments[i];
                    const game_version = currentMatch.info.game_version;
                    const augmentStatsCollection = db.collection('augmentStats');
                    const augmentStatsSnapshot = await augmentStatsCollection.where('augment', '==', augment)
                        .where('augment_at_stage', '==', i + 2)
                        .where('game_version', '==', game_version)
                        .get();

                    if (!augmentStatsSnapshot.empty) {
                        //if total_games is 1, delete the document
                        if (augmentStatsSnapshot.docs[0].data().total_games <= 1) {
                            transaction.delete(augmentStatsSnapshot.docs[0].ref);
                            countAugmentDeletions++;
                            if (countAugmentDeletions % 100 === 0) {
                                console.log(`Deleted ${countAugmentDeletions} augment stats so far...`);
                            }
                        } else {

                            // Document exists, update it
                            const doc = augmentStatsSnapshot.docs[0];
                            const stats = doc.data() as IAugmentStats;
                            transaction.set(doc.ref, {
                                augment: stats.augment,
                                augment_at_stage: stats.augment_at_stage,
                                game_version: stats.game_version,
                                total_games: stats.total_games - 1,
                                wins: stats.wins - (participant.placement === 1 ? 1 : 0),
                                games_with_placement_1_to_4: stats.games_with_placement_1_to_4 -
                                    (participant.placement >= 1 && participant.placement <= 4 ? 1 : 0),
                                total_placement: stats.total_placement - participant.placement,
                                average_placement_at_stage: (stats.total_placement - participant.placement) / (stats.total_games - 1)
                            });
                        }

                    }
                }
            }
        });
        currentMatch = (await Query.limit(1).get()).docs[0].data() as IMatch;
    }


    console.log(`Finished deleting matches older than ${cutoff} ...`)
    console.log(`Deleted ${countDeletions} matches and ${countAugmentDeletions} augment stats in total.`);


}

