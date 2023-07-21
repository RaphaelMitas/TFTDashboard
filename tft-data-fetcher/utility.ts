// utility.ts

import { Constants, TftApi } from 'twisted';
import Bottleneck from 'bottleneck';
import { ISummoner, Summoner } from './schema/summoner';
import { LeagueItemDTO, MatchTFTDTO } from 'twisted/dist/models-dto';
import dotenv from 'dotenv';
import { RegionGroups, Regions, regionToRegionGroup } from 'twisted/dist/constants';
import e from 'express';
import { get } from 'http';

dotenv.config();
const RIOT_API_KEY = process.env.RIOT_API_KEY as string;

const api = new TftApi({
    key: RIOT_API_KEY,
});


//
// Get PUUID by summoner name
//

const getPuuidByNamesLimiter = new Bottleneck({
    minTime: 60000 / 1300, //  60,000 ms / 1600 requests = 37.5 ms/request
    maxConcurrent: 1, // No more than 30 tasks running at once
});

interface PuuidByNamesProps {
    summoner: LeagueItemDTO,
    region: Regions,
}

async function getPuuidByNames({ summoner, region }: PuuidByNamesProps): Promise<ISummoner> {
    try {
        const summonerWithPUUID = await api.Summoner.getById(summoner.summonerId, region);

        const summonerObject = new Summoner({
            id: summoner.summonerId,
            name: summoner.summonerName,
            accountId: summonerWithPUUID.response.accountId,
            puuid: summonerWithPUUID.response.puuid,
            region: Constants.Regions.EU_WEST,
            tier: Constants.Tiers.CHALLENGER,
        });

        return summonerObject;
    } catch (error) {
        console.log('Error while getting PUUID:', error);
        throw error;
    }
}

export function getPuuidByNamesWithLimiter({ summoner, region }: PuuidByNamesProps): Promise<ISummoner> {
    return getPuuidByNamesLimiter.schedule(() => getPuuidByNames({ summoner: summoner, region: region }));
}

//
// Get challenger, grandmaster and master league
//

const getChallengerLeagueLimiter = new Bottleneck({
    minTime: 600000 / 400,
    maxConcurrent: 1,
});

async function getChallengerLeague(region: Regions): Promise<LeagueItemDTO[]> {
    try {
        const challengerLeague = await api.League.getChallengerLeague(region);
        return challengerLeague.response.entries;
    } catch (error) {
        console.log('Error while getting challenger league:', error);
        throw error;
    }
}

export function getChallengerLeagueWithLimiter(region: Regions): Promise<LeagueItemDTO[]> {
    return getChallengerLeagueLimiter.schedule(() => getChallengerLeague(region));
}

const getGrandMasterLeagueLimiter = new Bottleneck({
    minTime: 600000 / 400,
    maxConcurrent: 1,
});

async function getGrandMasterLeague(region: Regions): Promise<LeagueItemDTO[]> {
    try {
        const grandmasterLeague = await api.League.getGrandMasterLeague(region);
        return grandmasterLeague.response.entries;
    } catch (error) {
        console.log('Error while getting grandmaster league:', error);
        throw error;
    }
}

export function getGrandMasterLeagueWithLimiter(region: Regions): Promise<LeagueItemDTO[]> {
    return getGrandMasterLeagueLimiter.schedule(() => getGrandMasterLeague(region));
}

const getMasterLeagueLimiter = new Bottleneck({
    minTime: 600000 / 400,
    maxConcurrent: 1,
});

async function getMasterLeague(region: Regions): Promise<LeagueItemDTO[]> {
    try {
        const masterLeague = await api.League.getMasterLeague(region);
        return masterLeague.response.entries;
    } catch (error) {
        console.log('Error while getting master league:', error);
        throw error;
    }
}

export function getMasterLeagueWithLimiter(region: Regions): Promise<LeagueItemDTO[]> {
    return getMasterLeagueLimiter.schedule(() => getMasterLeague(region));
}


//
// Get match list by PUUID
//

const getMatchListLimiter = new Bottleneck({
    minTime: 10000 / 200,
    maxConcurrent: 1,
});
async function getMatchList(puuid: string, region: Regions, matchCount: number): Promise<string[]> {
    const regionGroup = regionToRegionGroup(region);

    try {
        const matchList = await api.Match.list(puuid, regionGroup, { count: matchCount })
        return matchList.response;
    } catch (error) {
        console.log('Error while getting match list:', error);
        throw error;
    }
}

export function getMatchListWithLimiter(puuid: string, region: Regions, matchCount: number): Promise<string[]> {
    return getMatchListLimiter.schedule(() => getMatchList(puuid, region, matchCount));
}


//
// Get match by match ID
//

const getMatchLimiter = new Bottleneck({
    minTime: 10000 / 150,
    maxConcurrent: 1,
});

async function getMatch(matchId: string, region: Regions): Promise<MatchTFTDTO> {
    const regionGroup = regionToRegionGroup(region);

    try {
        const match = await api.Match.get(matchId, regionGroup);
        return match.response;
    } catch (error) {
        console.log('Error while getting match:', error);
        throw error;
    }
}

export function getMatchWithLimiter(matchId: string, region: Regions): Promise<MatchTFTDTO> {
    return getMatchLimiter.schedule(() => getMatch(matchId, region));
}