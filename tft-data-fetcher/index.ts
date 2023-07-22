import express from 'express';
import dotenv from 'dotenv';
import { Constants } from 'twisted';
import { ISummoner, Summoner } from './schema/summoner';
import { getChallengerLeague, getGrandMasterLeague, getMatchList, getMatch, getPuuidByNames, getMasterLeague } from './utility';
import { TFTMatch } from './schema/match';
import mongoose from 'mongoose';
import { LeagueItemDTO } from 'twisted/dist/models-dto';
import schedule from 'node-schedule';
import { Regions } from 'twisted/dist/constants';
import e from 'express';



dotenv.config();

const app = express();
const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD as string; // Your Riot API key in a .env file

// Set up MongoDB connection
(async () => {
    try {
        await mongoose.connect(`mongodb+srv://admin:${MONGO_DB_PASSWORD}@ruffysfeuerstelle.jw6klif.mongodb.net/ruffys-feuerstelle`);
        console.log('MongoDB connected...');
    } catch (error) {
        console.log(error);
    }
})();

async function fetchAndSaveData(region: Regions) {
    console.log('Fetching data from Riot API...');

    console.log(`Start fetching data from Challenger League in ${region}...`);
    const challengerLeague = await getChallengerLeague(region);
    for (let i = 0; i < challengerLeague.length; i += 3) {
        await fetchPuuidFromLeagueItemDTO(challengerLeague[i], region);
    }
    console.log(`Done fetching Challenger data from Riot API in ${region}.`);

    console.log(`Start fetching data from Grandmaster League in ${region}...`);
    const grandmasterLeague = await getGrandMasterLeague(region);
    for (let i = 0; i < grandmasterLeague.length; i += 3) {
        await fetchPuuidFromLeagueItemDTO(grandmasterLeague[i], region);
    }
    console.log(`Done fetching Grandmaster data from Riot API in ${region}.`);

    console.log(`Start fetching data from Master League in ${region}...`);
    const masterLeague = await getMasterLeague(region);
    for (let i = 0; i < masterLeague.length; i += 3) {
        await fetchPuuidFromLeagueItemDTO(masterLeague[i], region);
    }
    console.log(`Done fetching Master data from Riot API in ${region}.`);
}

async function fetchPuuidFromLeagueItemDTO(summoner: LeagueItemDTO, region: Regions) {
    try {
        // Check if summoner exists in MongoDB
        const existingSummoner: ISummoner | null = await Summoner.findOne({ id: summoner.summonerId }); // Replace 'summonerName' with the appropriate field in your Summoner schema

        if (!existingSummoner) {
            // Summoner does not exist in MongoDB, fetch and update data
            const summonerObject = await getPuuidByNames({ summoner: summoner, region: region });

            await Summoner.findOneAndUpdate({ id: summonerObject.id }, summonerObject, {
                new: true,
                upsert: true
            });

            fetchDataForSummoner(summonerObject, region);
        } else {
            fetchDataForSummoner(existingSummoner, region);
        }
    } catch (error) {
        console.log('Error while fetching PUUID from LeagueItemDTO:', error);
    }
}


async function fetchDataForSummoner(summoner: ISummoner, region: Regions) {
    const matchIdList = await getMatchList(summoner.puuid, region, 2)

    for (const matchId of matchIdList) {
        const existingMatch = await TFTMatch.findOne({ "metadata.match_id": matchId });

        if (!existingMatch) {
            console.log('Fetching match with ID ' + matchId + ' from Riot API...');
            const match = await getMatch(matchId, region);
            const matchObject = new TFTMatch({ _id: new mongoose.Types.ObjectId(), ...match });
            await matchObject.save();
        }
    }
}

// Call fetchAndSaveData function for each region
// fetchAndSaveData(Constants.Regions.EU_WEST);
// fetchAndSaveData(Constants.Regions.AMERICA_NORTH);


/**
 * As per RIOT Api:
 * - The AMERICAS routing value serves NA, BR, LAN and LAS.
 * - The ASIA routing value serves KR and JP
 * - The EUROPE routing value serves EUNE, EUW, TR, and RU.
 * - The SEA routing value serves OCE
 * 
 * Because api limits are per region group, we need to fetch data from each region group separately.
 * 
 */
// Fetch and save data from Riot API every day
schedule.scheduleJob('0 * * * *', () => fetchAndSaveData(Constants.Regions.EU_WEST));
schedule.scheduleJob('15 * * * *', () => fetchAndSaveData(Constants.Regions.KOREA));
schedule.scheduleJob('30 * * * *', () => fetchAndSaveData(Constants.Regions.AMERICA_NORTH));
schedule.scheduleJob('45 * * * *', () => fetchAndSaveData(Constants.Regions.OCEANIA));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
