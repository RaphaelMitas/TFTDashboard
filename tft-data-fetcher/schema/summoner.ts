import mongoose, { Document, Schema } from 'mongoose';
import { Constants } from 'twisted';
import { Regions, Tiers } from 'twisted/dist/constants';


export interface ISummoner extends Document {
    id: string,
    name: string,
    accountId: string,
    puuid: string,
    region: Regions,
    tier: Tiers,
}

const SummonerSchema: Schema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    accountId: { type: String, required: true },
    puuid: { type: String, required: true },
    region: { type: String, enum: Regions, required: true },
    tier: { type: String, enum: Tiers, required: true },
}, { _id: false });

export const Summoner = mongoose.model<ISummoner>('Summoner', SummonerSchema);
