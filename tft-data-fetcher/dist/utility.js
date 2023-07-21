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
const bottleneck_1 = __importDefault(require("bottleneck"));
const summoner_1 = require("./schema/summoner");
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("twisted/dist/constants");
dotenv_1.default.config();
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const api = new twisted_1.TftApi({
    key: RIOT_API_KEY,
});
//
// Get PUUID by summoner name
//
const getPuuidByNamesLimiter = new bottleneck_1.default({
    minTime: 60000 / 1300,
    maxConcurrent: 1, // No more than 30 tasks running at once
});
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
            console.log('Error while getting PUUID:', error);
            throw error;
        }
    });
}
function getPuuidByNamesWithLimiter({ summoner, region }) {
    return getPuuidByNamesLimiter.schedule(() => getPuuidByNames({ summoner: summoner, region: region }));
}
exports.getPuuidByNamesWithLimiter = getPuuidByNamesWithLimiter;
//
// Get challenger, grandmaster and master league
//
const getChallengerLeagueLimiter = new bottleneck_1.default({
    minTime: 600000 / 400,
    maxConcurrent: 1,
});
function getChallengerLeague(region) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const challengerLeague = yield api.League.getChallengerLeague(region);
            return challengerLeague.response.entries;
        }
        catch (error) {
            console.log('Error while getting challenger league:', error);
            throw error;
        }
    });
}
function getChallengerLeagueWithLimiter(region) {
    return getChallengerLeagueLimiter.schedule(() => getChallengerLeague(region));
}
exports.getChallengerLeagueWithLimiter = getChallengerLeagueWithLimiter;
const getGrandMasterLeagueLimiter = new bottleneck_1.default({
    minTime: 600000 / 400,
    maxConcurrent: 1,
});
function getGrandMasterLeague(region) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const grandmasterLeague = yield api.League.getGrandMasterLeague(region);
            return grandmasterLeague.response.entries;
        }
        catch (error) {
            console.log('Error while getting grandmaster league:', error);
            throw error;
        }
    });
}
function getGrandMasterLeagueWithLimiter(region) {
    return getGrandMasterLeagueLimiter.schedule(() => getGrandMasterLeague(region));
}
exports.getGrandMasterLeagueWithLimiter = getGrandMasterLeagueWithLimiter;
const getMasterLeagueLimiter = new bottleneck_1.default({
    minTime: 600000 / 400,
    maxConcurrent: 1,
});
function getMasterLeague(region) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const masterLeague = yield api.League.getMasterLeague(region);
            return masterLeague.response.entries;
        }
        catch (error) {
            console.log('Error while getting master league:', error);
            throw error;
        }
    });
}
function getMasterLeagueWithLimiter(region) {
    return getMasterLeagueLimiter.schedule(() => getMasterLeague(region));
}
exports.getMasterLeagueWithLimiter = getMasterLeagueWithLimiter;
//
// Get match list by PUUID
//
const getMatchListLimiter = new bottleneck_1.default({
    minTime: 10000 / 200,
    maxConcurrent: 1,
});
function getMatchList(puuid, region, matchCount) {
    return __awaiter(this, void 0, void 0, function* () {
        const regionGroup = (0, constants_1.regionToRegionGroup)(region);
        try {
            const matchList = yield api.Match.list(puuid, regionGroup, { count: matchCount });
            return matchList.response;
        }
        catch (error) {
            console.log('Error while getting match list:', error);
            throw error;
        }
    });
}
function getMatchListWithLimiter(puuid, region, matchCount) {
    return getMatchListLimiter.schedule(() => getMatchList(puuid, region, matchCount));
}
exports.getMatchListWithLimiter = getMatchListWithLimiter;
//
// Get match by match ID
//
const getMatchLimiter = new bottleneck_1.default({
    minTime: 10000 / 150,
    maxConcurrent: 1,
});
function getMatch(matchId, region) {
    return __awaiter(this, void 0, void 0, function* () {
        const regionGroup = (0, constants_1.regionToRegionGroup)(region);
        try {
            const match = yield api.Match.get(matchId, regionGroup);
            return match.response;
        }
        catch (error) {
            console.log('Error while getting match:', error);
            throw error;
        }
    });
}
function getMatchWithLimiter(matchId, region) {
    return getMatchLimiter.schedule(() => getMatch(matchId, region));
}
exports.getMatchWithLimiter = getMatchWithLimiter;
