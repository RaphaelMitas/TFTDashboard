import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export interface DataDragonAugmentInterface {
    apiName: string;
    augmentQuality: string;
    associatedTraits: string[];
    composition: string[];
    desc: string;
    effects: { [key: string]: number | EffectEnum };
    icon: string;
    incompatibleTraits: string[];
    label: string;
    data?: {

    }
}

export class DataDragonAugment {
    apiName: string;
    augmentQuality: string;
    associatedTraits: string[];
    composition: string[];
    desc: null | string;
    effects: { [key: string]: number | EffectEnum };
    icon: string;
    incompatibleTraits: string[];
    label: string;
    data?: {

    }
    constructor(augment: DataDragonAugmentInterface) {
        this.apiName = augment.apiName;
        this.augmentQuality = augment.augmentQuality;
        this.associatedTraits = augment.associatedTraits;
        this.composition = augment.composition;
        this.desc = augment.desc;
        this.effects = augment.effects;
        this.icon = augment.icon;
        this.incompatibleTraits = augment.incompatibleTraits;
        this.label = augment.label;
        this.data = augment.data;
    }

    static toJSON(augments: DataDragonAugment[]) {
        return augments.map(augment => {
            return {
                apiName: augment.apiName,
                associatedTraits: augment.associatedTraits,
                composition: augment.composition,
                desc: augment.desc,
                effects: augment.effects,
                icon: augment.icon,
                incompatibleTraits: augment.incompatibleTraits,
                label: augment.label,
                data: augment.data,
            }
        })
    }
    static fromJSON(json: DataDragonAugmentInterface[]) {
        return json.map(augment => {
            return new DataDragonAugment(augment);
        })
    }
}


export enum EffectEnum {
    Null = "null",
}

interface IFirebaseAugmentStats {
    augment: string;
    augment_at_stage: number;
    game_version: string;
    average_placement_at_stage: number;
    total_games: number;
    total_placement: number;
    games_with_placement_1_to_4: number;
    wins: number;
}

class FirebaseAugmentStats implements IFirebaseAugmentStats {
    augment: string;
    augment_at_stage: number;
    game_version: string;
    average_placement_at_stage: number;
    total_games: number;
    total_placement: number;
    games_with_placement_1_to_4: number;
    wins: number;
    constructor(data: IFirebaseAugmentStats) {
        this.augment = data.augment;
        this.augment_at_stage = data.augment_at_stage;
        this.game_version = data.game_version;
        this.average_placement_at_stage = data.average_placement_at_stage;
        this.total_games = data.total_games;
        this.total_placement = data.total_placement;
        this.games_with_placement_1_to_4 = data.games_with_placement_1_to_4;
        this.wins = data.wins;
    }
}

//FirebaseConverter Typescript
export const firebaseAugmentStatsConverter = {
    toFirestore: function (augmentStats: FirebaseAugmentStats) {
        return {
            augment: augmentStats.augment,
            augment_at_stage: augmentStats.augment_at_stage,
            game_version: augmentStats.game_version,
            average_placement_at_stage: augmentStats.average_placement_at_stage,
            total_games: augmentStats.total_games,
            total_placement: augmentStats.total_placement,
            games_with_placement_1_to_4: augmentStats.games_with_placement_1_to_4,
            wins: augmentStats.wins,
        }
    },
    fromFirestore: function (snapshot: QueryDocumentSnapshot<IFirebaseAugmentStats>) {
        const data = snapshot.data();
        return new FirebaseAugmentStats(data);
    }
}

interface IDBAugment {
    average_placement_at_stage_2: number;
    average_placement_at_stage_3: number;
    average_placement_at_stage_4: number;
    total_games: number;
    wins: number;
    placement_1_to_4: number;
    augment: string;
    game_version: string;
    average_placement: number;
    win_percent: number;
    top4_percent: number;
    total_placement: number;
}

export class DBAugment implements IDBAugment {
    average_placement_at_stage_2: number;
    average_placement_at_stage_3: number;
    average_placement_at_stage_4: number;
    total_games: number;
    wins: number;
    placement_1_to_4: number;
    augment: string;
    game_version: string;
    average_placement: number;
    win_percent: number;
    top4_percent: number;
    total_placement: number;
    constructor(data: IDBAugment) {
        this.average_placement_at_stage_2 = data.average_placement_at_stage_2;
        this.average_placement_at_stage_3 = data.average_placement_at_stage_3;
        this.average_placement_at_stage_4 = data.average_placement_at_stage_4;
        this.total_games = data.total_games;
        this.wins = data.wins;
        this.placement_1_to_4 = data.placement_1_to_4;
        this.augment = data.augment;
        this.game_version = data.game_version;
        this.average_placement = data.average_placement;
        this.win_percent = data.win_percent;
        this.top4_percent = data.top4_percent;
        this.total_placement = data.total_placement;
    }
    static toJSON(data: DBAugment[]) {
        return data.map(data => {
            return {
                average_placement_at_stage_2: data.average_placement_at_stage_2,
                average_placement_at_stage_3: data.average_placement_at_stage_3,
                average_placement_at_stage_4: data.average_placement_at_stage_4,
                total_games: data.total_games,
                wins: data.wins,
                placement_1_to_4: data.placement_1_to_4,
                augment: data.augment,
                game_version: data.game_version,
                average_placement: data.average_placement,
                win_percent: data.win_percent,
                top4_percent: data.top4_percent,
                total_placement: data.total_placement,
            }
        })
    }
    static fromJSON(json: any[]) {
        return json.map(data => {
            return new DBAugment(data);
        })
    }

}


export default class Augment implements DataDragonAugment, DBAugment {
    average_placement_at_stage_2: number;
    average_placement_at_stage_3: number;
    average_placement_at_stage_4: number;
    total_games: number;
    wins: number;
    placement_1_to_4: number;
    augment: string;
    game_version: string;
    average_placement: number;
    win_percent: number;
    top4_percent: number;
    total_placement: number;
    apiName: string;
    augmentQuality: string;
    associatedTraits: string[];
    composition: string[];
    desc: string;
    effects: { [key: string]: number | EffectEnum; };
    icon: string;
    incompatibleTraits: string[];
    label: string;
    data?: {} | undefined;
    constructor(data: any) {
        this.average_placement_at_stage_2 = data.average_placement_at_stage_2;
        this.average_placement_at_stage_3 = data.average_placement_at_stage_3;
        this.average_placement_at_stage_4 = data.average_placement_at_stage_4;
        this.total_games = data.total_games;
        this.wins = data.wins;
        this.placement_1_to_4 = data.placement_1_to_4;
        this.augment = data.augment;
        this.game_version = data.game_version;
        this.average_placement = data.average_placement;
        this.win_percent = data.win_percent;
        this.top4_percent = data.top4_percent;
        this.total_placement = data.total_placement;
        this.apiName = data.apiName;
        this.augmentQuality = data.augmentQuality;
        this.associatedTraits = data.associatedTraits;
        this.composition = data.composition;
        this.desc = data.desc;
        this.effects = data.effects;
        this.icon = data.icon;
        this.incompatibleTraits = data.incompatibleTraits;
        this.label = data.label;
        this.data = data.data;
    }
    static toJSON(data: Augment[]) {
        return data.map(data => {
            return {
                average_placement_at_stage_2: data.average_placement_at_stage_2,
                average_placement_at_stage_3: data.average_placement_at_stage_3,
                average_placement_at_stage_4: data.average_placement_at_stage_4,
                total_games: data.total_games,
                wins: data.wins,
                placement_1_to_4: data.placement_1_to_4,
                augment: data.augment,
                game_version: data.game_version,
                average_placement: data.average_placement,
                win_percent: data.win_percent,
                top4_percent: data.top4_percent,
                total_placement: data.total_placement,
                apiName: data.apiName,
                augmentQuality: data.augmentQuality,
                associatedTraits: data.associatedTraits,
                composition: data.composition,
                desc: data.desc,
                effects: data.effects,
                icon: data.icon,
                incompatibleTraits: data.incompatibleTraits,
                label: data.label,
                data: data.data,
            }
        })
    }
}