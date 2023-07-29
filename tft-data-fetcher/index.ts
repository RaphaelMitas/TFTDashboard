import express from 'express';
import dotenv from 'dotenv';
import { Constants } from 'twisted';
import { ISummoner, getSummonerById, saveSummoner } from './schema/summoner';
import { getChallengerLeague, getGrandMasterLeague, getMatchList, getMatch, getPuuidByNames, getMasterLeague } from './utility';
import schedule from 'node-schedule';
import { LeagueItemDTO } from 'twisted/dist/models-dto';
import { Regions } from 'twisted/dist/constants';
import { deleteOldMatches, getMatchById, isIMatch, saveMatchAndUpdateStats } from './schema/match';


dotenv.config();

const app = express();


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

    // console.log(`Start fetching data from Master League in ${region}...`);
    // const masterLeague = await getMasterLeague(region);
    // for (let i = 0; i < masterLeague.length; i += 3) {
    //     await fetchPuuidFromLeagueItemDTO(masterLeague[i], region);
    // }
    // console.log(`Done fetching Master data from Riot API in ${region}.`);
}

async function fetchPuuidFromLeagueItemDTO(summoner: LeagueItemDTO, region: Regions) {
    try {
        // Check if summoner exists
        const existingSummoner: ISummoner | null = await getSummonerById(summoner.summonerId); // Replace 'summonerName' with the appropriate field in your Summoner schema

        if (!existingSummoner) {
            // Summoner does not exist, fetch and update data
            const summonerObject = await getPuuidByNames({ summoner: summoner, region: region });

            await saveSummoner(summonerObject)

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
        const existingMatch = await getMatchById(matchId);

        if (!existingMatch) {
            console.log('Fetching match with ID ' + matchId + ' from Riot API...');
            const match = await getMatch(matchId, region);

            if (isIMatch(match)) {
                if (match.info.tft_game_type !== 'standard') {
                    console.log('Match is not a standard match, skipping...');
                    continue;
                }
                await saveMatchAndUpdateStats(match);
            } else {
                console.error('Fetched match does not match IMatch interface');
            }
        }
    }
}

// Call fetchAndSaveData function for each region
// fetchAndSaveData(Constants.Regions.EU_WEST);
// fetchAndSaveData(Constants.Regions.AMERICA_NORTH);
// fetchAndSaveData(Constants.Regions.KOREA);
// fetchAndSaveData(Constants.Regions.OCEANIA);

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

// Fetch and save data from Riot API every 15 minutes
console.log('Starting schedule for jobs...');
schedule.scheduleJob('0 * * * *', () => fetchAndSaveData(Constants.Regions.EU_WEST));
schedule.scheduleJob('15 * * * *', () => fetchAndSaveData(Constants.Regions.KOREA));
schedule.scheduleJob('30 * * * *', () => fetchAndSaveData(Constants.Regions.AMERICA_NORTH));
schedule.scheduleJob('45 * * * *', () => fetchAndSaveData(Constants.Regions.OCEANIA));
// delete old matches every day at 04:00
schedule.scheduleJob('0 4 * * *', () => deleteOldMatches(30));
console.log('Schedule for jobs started.');
