"use strict";
// utility.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchWithLimiter = exports.getMatchListWithLimiter = exports.getMasterLeagueWithLimiter = exports.getGrandMasterLeagueWithLimiter = exports.getChallengerLeagueWithLimiter = exports.getPuuidByNamesWithLimiter = void 0;
const twisted_1 = require("twisted");
const summoner_1 = require("./schema/summoner");
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("twisted/dist/constants");
dotenv_1.default.config();
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const api = new twisted_1.TftApi({
    key: RIOT_API_KEY,
});
function isRateLimitError(error) {
    return error.status === 429;
}
function getPuuidByNames({ summoner, region }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const summonerWithPUUID = yield api.Summoner.getById(summoner.summonerId, region);
            const summonerObject = new summoner_1.Summoner({
                id: summoner.summonerId,
                name: summoner.summonerName,
                accountId: summonerWithPUUID.response.accountId,
                puuid: summonerWithPUUID.response.puuid,
                region: twisted_1.Constants.Regions.EU_WEST,
                tier: twisted_1.Constants.Tiers.CHALLENGER,
            });
            return summonerObject;
        }
        catch (error) {
            if (isRateLimitError(error)) {
                const retryAfter = error.rateLimits.RetryAfter;
                console.log('Rate limit exceeded, retrying after ' + retryAfter + ' seconds');
                yield new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return getPuuidByNames({ summoner, region });
            }
            else {
                console.log('Error while getting PUUID:', error);
                throw error;
            }
        }
    });
}
function getPuuidByNamesWithLimiter({ summoner, region }) {
    return getPuuidByNames({ summoner: summoner, region: region });
}
exports.getPuuidByNamesWithLimiter = getPuuidByNamesWithLimiter;
//
// Get challenger, grandmaster and master league
//
function getChallengerLeague(region) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const challengerLeague = yield api.League.getChallengerLeague(region);
            return challengerLeague.response.entries;
        }
        catch (error) {
            if (isRateLimitError(error)) {
                const retryAfter = error.rateLimits.RetryAfter;
                console.log('Rate limit exceeded, retrying after ' + retryAfter + ' seconds');
                yield new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return getChallengerLeague(region);
            }
            else {
                console.log('Error while getting challenger league:', error);
                throw error;
            }
        }
    });
}
function getChallengerLeagueWithLimiter(region) {
    return getChallengerLeague(region);
}
exports.getChallengerLeagueWithLimiter = getChallengerLeagueWithLimiter;
function getGrandMasterLeague(region) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const grandmasterLeague = yield api.League.getGrandMasterLeague(region);
            return grandmasterLeague.response.entries;
        }
        catch (error) {
            if (isRateLimitError(error)) {
                const retryAfter = error.rateLimits.RetryAfter;
                console.log('Rate limit exceeded, retrying after ' + retryAfter + ' seconds');
                yield new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return getGrandMasterLeague(region);
            }
            else {
                console.log('Error while getting grandmaster league:', error);
                throw error;
            }
        }
    });
}
function getGrandMasterLeagueWithLimiter(region) {
    return getGrandMasterLeague(region);
}
exports.getGrandMasterLeagueWithLimiter = getGrandMasterLeagueWithLimiter;
function getMasterLeague(region) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const masterLeague = yield api.League.getMasterLeague(region);
            return masterLeague.response.entries;
        }
        catch (error) {
            if (isRateLimitError(error)) {
                const retryAfter = error.rateLimits.RetryAfter;
                console.log('Rate limit exceeded, retrying after ' + retryAfter + ' seconds');
                yield new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return getMasterLeague(region);
            }
            else {
                console.log('Error while getting master league:', error);
                throw error;
            }
        }
    });
}
function getMasterLeagueWithLimiter(region) {
    return getMasterLeague(region);
}
exports.getMasterLeagueWithLimiter = getMasterLeagueWithLimiter;
//
// Get match list by PUUID
//
function getMatchList(puuid, region, matchCount) {
    return __awaiter(this, void 0, void 0, function* () {
        const regionGroup = (0, constants_1.regionToRegionGroup)(region);
        try {
            const matchList = yield api.Match.list(puuid, regionGroup, { count: matchCount });
            return matchList.response;
        }
        catch (error) {
            if (isRateLimitError(error)) {
                const retryAfter = error.rateLimits.RetryAfter;
                console.log('Rate limit exceeded, retrying after ' + retryAfter + ' seconds');
                yield new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return getMatchList(puuid, region, matchCount);
            }
            else {
                console.log('Error while getting match list:', error);
                throw error;
            }
        }
    });
}
function getMatchListWithLimiter(puuid, region, matchCount) {
    return getMatchList(puuid, region, matchCount);
}
exports.getMatchListWithLimiter = getMatchListWithLimiter;
//
// Get match by match ID
//
function getMatch(matchId, region) {
    return __awaiter(this, void 0, void 0, function* () {
        const regionGroup = (0, constants_1.regionToRegionGroup)(region);
        try {
            const match = yield api.Match.get(matchId, regionGroup);
            return match.response;
        }
        catch (error) {
            if (isRateLimitError(error)) {
                const retryAfter = error.rateLimits.RetryAfter;
                console.log('Rate limit exceeded, retrying after ' + retryAfter + ' seconds');
                yield new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return getMatch(matchId, region);
            }
            else {
                console.log('Error while getting match:', error);
                throw error;
            }
        }
    });
}
function getMatchWithLimiter(matchId, region) {
    return getMatch(matchId, region);
}
exports.getMatchWithLimiter = getMatchWithLimiter;
