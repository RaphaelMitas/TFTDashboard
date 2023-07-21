"use strict";
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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const twisted_1 = require("twisted");
const summoner_1 = require("./schema/summoner");
const utility_1 = require("./utility");
const match_1 = require("./schema/match");
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD; // Your Riot API key in a .env file
// Set up MongoDB connection
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(`mongodb+srv://admin:${MONGO_DB_PASSWORD}@ruffysfeuerstelle.jw6klif.mongodb.net/ruffys-feuerstelle`);
        console.log('MongoDB connected...');
    }
    catch (error) {
        console.log(error);
    }
}))();
function fetchAndSaveData() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Fetching data from Riot API...');
        // Fetch all summoner names in Grandmaster and Challenger
        // const entry = await api.League.getChallengerLeague(Constants.Regions.EU_WEST);
        console.log('Start fetching data from Challenger League...');
        const challengerLeague = yield (0, utility_1.getChallengerLeagueWithLimiter)(twisted_1.Constants.Regions.EU_WEST);
        for (const summoner of challengerLeague) {
            yield fetchPuuidFromLeagueItemDTO(summoner);
        }
        console.log('Done fetching Challenger data from Riot API.');
        console.log('Start fetching data from Grandmaster League...');
        const grandmasterLeague = yield (0, utility_1.getGrandMasterLeagueWithLimiter)(twisted_1.Constants.Regions.EU_WEST);
        for (const summoner of grandmasterLeague) {
            yield fetchPuuidFromLeagueItemDTO(summoner);
        }
        console.log('Done fetching Grandmaster data from Riot API.');
        console.log('Start fetching data from Master League...');
        const masterLeague = yield (0, utility_1.getGrandMasterLeagueWithLimiter)(twisted_1.Constants.Regions.EU_WEST);
        for (const summoner of masterLeague) {
            yield fetchPuuidFromLeagueItemDTO(summoner);
        }
        console.log('Done fetching Master data from Riot API.');
    });
}
function fetchPuuidFromLeagueItemDTO(summoner) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const summonerObject = yield (0, utility_1.getPuuidByNamesWithLimiter)({ summoner: summoner, region: twisted_1.Constants.Regions.EU_WEST });
            // findOneAndUpdate with upsert option
            yield summoner_1.Summoner.findOneAndUpdate({ id: summonerObject.id }, summonerObject, {
                new: true,
                upsert: true // make this update into an upsert
            });
            fetchDataForSummoner(summonerObject);
        }
        catch (error) {
            console.log('Error while fetching PUUID from LeagueItemDTO:', error);
        }
    });
}
function fetchDataForSummoner(summoner) {
    return __awaiter(this, void 0, void 0, function* () {
        const matchIdList = yield (0, utility_1.getMatchListWithLimiter)(summoner.puuid, twisted_1.Constants.Regions.EU_WEST, 2);
        for (const matchId of matchIdList) {
            const match = yield (0, utility_1.getMatchWithLimiter)(matchId, twisted_1.Constants.Regions.EU_WEST);
            const matchObject = new match_1.TFTMatch(match);
            yield match_1.TFTMatch.findOneAndUpdate({ id: matchObject.metadata.match_id }, matchObject, {
                new: true,
                upsert: true // make this update into an upsert
            });
        }
    });
}
fetchAndSaveData();
// Fetch and save data from Riot API every day
// schedule.scheduleJob('0 0 * * *', fetchAndSaveData);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
