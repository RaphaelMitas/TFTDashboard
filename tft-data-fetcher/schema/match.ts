import mongoose, { Document, Schema } from 'mongoose';


export interface IMatch {
    metadata: Metadata;
    info: Info;
}

export interface Info {
    game_datetime: number;
    game_length: number;
    game_version: string;
    participants: Participant[];
    queue_id: number;
    tft_game_type: string;
    tft_set_core_name: string;
    tft_set_number: number;
}

export interface Participant {
    augments: string[];
    companion: Companion;
    gold_left: number;
    last_round: number;
    level: number;
    placement: number;
    players_eliminated: number;
    puuid: string;
    time_eliminated: number;
    total_damage_to_players: number;
    traits: Trait[];
    units: Unit[];
}

export interface Companion {
    content_ID: string;
    item_ID: number;
    skin_ID: number;
    species: string;
}

export interface Trait {
    name: string;
    num_units: number;
    style: number;
    tier_current: number;
    tier_total: number;
}

export interface Unit {
    character_id: string;
    itemNames: string[];
    name: string;
    rarity: number;
    tier: number;
}

export interface Metadata {
    data_version: string;
    match_id: string;
    participants: string[];
}




// Define a schema and model for your data
const TFTMatchSchema = new Schema({}, { _id: false, strict: false }); // flexible schema to accommodate any data structure from the Riot API
export const TFTMatch = mongoose.model<IMatch>('TFTMatch', TFTMatchSchema);

