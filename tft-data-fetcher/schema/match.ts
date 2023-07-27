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
export async function saveMatchAndUpdateStats(match: IMatch) {
    await db.runTransaction(async (transaction) => {
        const matchRef = db.collection('tftmatches').doc(match.metadata.match_id);

        transaction.set(matchRef, match);

        const participants = match.info.participants;
        for (const participant of participants) {
            for (let i = 0; i < participant.augments.length; i++) {
                const augment = participant.augments[i];
                const game_version = match.info.game_version;
                const augmentStatsCollection = db.collection('augmentStats');
                const augmentStatsSnapshot = await augmentStatsCollection.where('augment', '==', augment)
                    .where('augment_at_stage', '==', i + 2)
                    .where('game_version', '==', game_version)
                    .get();

                if (!augmentStatsSnapshot.empty) {
                    // Document exists, update it
                    const doc = augmentStatsSnapshot.docs[0];
                    const stats = doc.data() as IAugmentStats;
                    transaction.set(doc.ref, {
                        augment: stats.augment,
                        augment_at_stage: stats.augment_at_stage,
                        game_version: stats.game_version,
                        total_games: stats.total_games + 1,
                        wins: stats.wins + (participant.placement === 1 ? 1 : 0),
                        games_with_placement_1_to_4: stats.games_with_placement_1_to_4 +
                            (participant.placement >= 1 && participant.placement <= 4 ? 1 : 0),
                        total_placement: stats.total_placement + participant.placement,
                        average_placement_at_stage: (stats.total_placement + participant.placement) / (stats.total_games + 1)
                    });
                } else {
                    // Document does not exist, create it
                    const newStats: IAugmentStats = {
                        augment,
                        augment_at_stage: i + 2,
                        game_version,
                        total_games: 1,
                        wins: participant.placement === 1 ? 1 : 0,
                        games_with_placement_1_to_4: participant.placement >= 1 && participant.placement <= 4 ? 1 : 0,
                        total_placement: participant.placement,
                        average_placement_at_stage: participant.placement
                    };
                    const newDocRef = augmentStatsCollection.doc();
                    transaction.set(newDocRef, newStats);
                }
            }
        }
    });
}
