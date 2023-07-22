import express from 'express';
import dotenv from 'dotenv';
import { Constants } from 'twisted';
import { ISummoner, Summoner } from './schema/summoner';
import { getChallengerLeague, getGrandMasterLeague, getMatchList, getMatch, getPuuidByNames, getMasterLeague } from './utility';
import { TFTMatch } from './schema/match';
import mongoose from 'mongoose';
import { LeagueItemDTO } from 'twisted/dist/models-dto';
import schedule from 'node-schedule';



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


async function fetchAndSaveData() {
    console.log('Fetching data from Riot API...');

    // Fetch all summoner names in Grandmaster and Challenger
    // const entry = await api.League.getChallengerLeague(Constants.Regions.EU_WEST);

    console.log('Start fetching data from Challenger League...');
    const challengerLeague = await getChallengerLeague(Constants.Regions.EU_WEST);
    for (let i = 0; i < challengerLeague.length; i += 3) {
        await fetchPuuidFromLeagueItemDTO(challengerLeague[i]);
    }
    console.log('Done fetching Challenger data from Riot API.');

    console.log('Start fetching data from Grandmaster League...');
    const grandmasterLeague = await getGrandMasterLeague(Constants.Regions.EU_WEST);
    for (let i = 0; i < grandmasterLeague.length; i += 3) {
        await fetchPuuidFromLeagueItemDTO(grandmasterLeague[i]);
    }
    console.log('Done fetching Grandmaster data from Riot API.');

    console.log('Start fetching data from Master League...');
    const masterLeague = await getMasterLeague(Constants.Regions.EU_WEST);  // This line had an error, it should be getMasterLeague not getGrandMasterLeague.
    for (let i = 0; i < masterLeague.length; i += 3) {
        await fetchPuuidFromLeagueItemDTO(masterLeague[i]);
    }
    console.log('Done fetching Master data from Riot API.');


}

async function fetchPuuidFromLeagueItemDTO(summoner: LeagueItemDTO) {
    try {
        const summonerObject = await getPuuidByNames({ summoner: summoner, region: Constants.Regions.EU_WEST });


        // findOneAndUpdate with upsert option
        await Summoner.findOneAndUpdate({ id: summonerObject.id }, summonerObject, {
            new: true, // return the new doc if one is upserted
            upsert: true // make this update into an upsert
        });

        fetchDataForSummoner(summonerObject);
    } catch (error) {
        console.log('Error while fetching PUUID from LeagueItemDTO:', error);
    }
}

async function fetchDataForSummoner(summoner: ISummoner) {
    const matchIdList = await getMatchList(summoner.puuid, Constants.Regions.EU_WEST, 2)

    for (const matchId of matchIdList) {
        // Check if match already exists in MongoDB
        const existingMatch = await TFTMatch.findOne({ "metadata.match_id": matchId });


        if (!existingMatch) {
            // If the match does not exist, fetch it and save it
            console.log('Fetching match with ID ' + matchId + ' from Riot API...');

            const match = await getMatch(matchId, Constants.Regions.EU_WEST);
            const matchObject = new TFTMatch({ _id: new mongoose.Types.ObjectId(), ...match });
            await matchObject.save();

        }
    }
}


// fetchAndSaveData();

// Fetch and save data from Riot API every day
schedule.scheduleJob('0 * * * *', fetchAndSaveData);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
