import { db } from '../database';


export interface ISummoner {
    id: string,
    name: string,
    accountId: string,
    puuid: string,
    region: string,
    tier: string,
}

// A function to save a summoner
export async function saveSummoner(summoner: ISummoner) {
    const summonerRef = db.collection('summoners').doc(summoner.id);
    await summonerRef.set(summoner);
}


// A function to get a summoner by id
export async function getSummonerById(id: string) {
    const summonerRef = db.collection('summoners').doc(id);
    const doc = await summonerRef.get();
    if (doc.exists) {
        return doc.data() as ISummoner;
    } else {
        return null
    }
}

