import { Constants, TftApi } from 'twisted';
import { ISummoner } from './schema/summoner';
import { LeagueItemDTO, MatchTFTDTO } from 'twisted/dist/models-dto';
import dotenv from 'dotenv';
import { Regions, regionToRegionGroup } from 'twisted/dist/constants';

dotenv.config();
const RIOT_API_KEY = process.env.RIOT_API_KEY as string;

const api = new TftApi({
    key: RIOT_API_KEY,
});

interface RateLimitError extends Error {
    status: number;
    rateLimits: {
        RetryAfter: number;
    };
}

function isRateLimitError(error: unknown): error is RateLimitError {
    return (error as RateLimitError).status === 429;
}

// Utility function to debounce console logging
const debounceConsoleLog = (function () {
    let timers: { [key: string]: NodeJS.Timeout } = {};
    return (key: string, message: string) => {
        if (timers[key]) {
            clearTimeout(timers[key]);
        }
        timers[key] = setTimeout(() => {
            console.log(message);
        }, 1000);
    };
})();

function logRateLimitError(functionName: string, retryAfter: number) {
    debounceConsoleLog(
        functionName,
        `Rate limit exceeded in ${functionName}, retrying after ${retryAfter} seconds`
    );
}


//
// Get PUUID by summoner name
//

interface PuuidByNamesProps {
    summoner: LeagueItemDTO,
    region: Regions,
}


// Get PUUID by summoner name
export async function getPuuidByNames({ summoner, region }: PuuidByNamesProps): Promise<ISummoner> {
    try {
        const summonerWithPUUID = await api.Summoner.getById(summoner.summonerId, region);

        const summonerObject: ISummoner = {
            id: summoner.summonerId,
            name: summoner.summonerName,
            accountId: summonerWithPUUID.response.accountId,
            puuid: summonerWithPUUID.response.puuid,
            region: Constants.Regions.EU_WEST,
            tier: Constants.Tiers.CHALLENGER,
        };

        return summonerObject;
    } catch (error: unknown) {
        if (isRateLimitError(error)) {
            const retryAfter = error.rateLimits.RetryAfter;
            logRateLimitError('getPuuidByNames', retryAfter);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return getPuuidByNames({ summoner, region });
        } else {
            console.log('Error while getting PUUID:', error);
            throw error;
        }
    }
}


//
// Get challenger, grandmaster and master league
//

export async function getChallengerLeague(region: Regions): Promise<LeagueItemDTO[]> {
    try {
        const challengerLeague = await api.League.getChallengerLeague(region);
        return challengerLeague.response.entries;
    } catch (error: unknown) {
        if (isRateLimitError(error)) {
            const retryAfter = error.rateLimits.RetryAfter;
            logRateLimitError('getChallengerLeague', retryAfter);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return getChallengerLeague(region);
        } else {
            console.log('Error while getting challenger league:', error);
            throw error;
        }
    }
}


export async function getGrandMasterLeague(region: Regions): Promise<LeagueItemDTO[]> {
    try {
        const grandmasterLeague = await api.League.getGrandMasterLeague(region);
        return grandmasterLeague.response.entries;
    } catch (error: unknown) {
        if (isRateLimitError(error)) {
            const retryAfter = error.rateLimits.RetryAfter;
            logRateLimitError('getGrandMasterLeague', retryAfter);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return getGrandMasterLeague(region);
        } else {
            console.log('Error while getting grandmaster league:', error);
            throw error;
        }
    }
}


export async function getMasterLeague(region: Regions): Promise<LeagueItemDTO[]> {
    try {
        const masterLeague = await api.League.getMasterLeague(region);
        return masterLeague.response.entries;
    } catch (error: unknown) {
        if (isRateLimitError(error)) {
            const retryAfter = error.rateLimits.RetryAfter;
            logRateLimitError('getMasterLeague', retryAfter);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return getMasterLeague(region);
        } else {
            console.log('Error while getting master league:', error);
            throw error;
        }
    }
}


//
// Get match list by PUUID
//

export async function getMatchList(puuid: string, region: Regions, matchCount: number): Promise<string[]> {
    const regionGroup = regionToRegionGroup(region);

    try {
        const matchList = await api.Match.list(puuid, regionGroup, { count: matchCount })
        return matchList.response;
    } catch (error: unknown) {
        if (isRateLimitError(error)) {
            const retryAfter = error.rateLimits.RetryAfter;
            logRateLimitError('getMatchList', retryAfter);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return getMatchList(puuid, region, matchCount);
        } else {
            console.log('Error while getting match list:', error);
            throw error;
        }
    }
}

//
// Get match by match ID
//

export async function getMatch(matchId: string, region: Regions): Promise<MatchTFTDTO> {
    const regionGroup = regionToRegionGroup(region);

    try {
        const match = await api.Match.get(matchId, regionGroup);
        return match.response;
    } catch (error: unknown) {
        if (isRateLimitError(error)) {
            const retryAfter = error.rateLimits.RetryAfter;
            logRateLimitError('getMatch', retryAfter);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return getMatch(matchId, region);
        } else {
            console.log('Error while getting match:', error);
            throw error;
        }
    }
}