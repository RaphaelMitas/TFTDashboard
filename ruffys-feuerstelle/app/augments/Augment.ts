import { Item } from "data/tftTypes";

export interface AugmentInterface {
    apiName: string;
    associatedTraits: string[];
    composition: string[];
    desc: null | string;
    effects: { [key: string]: number | EffectEnum };
    icon: string;
    incompatibleTraits: string[];
    label: string;
    data?: {

    }
}

export default class Augment {
    apiName: string;
    associatedTraits: string[];
    composition: string[];
    desc: null | string;
    effects: { [key: string]: number | EffectEnum };
    icon: string;
    incompatibleTraits: string[];
    label: string;
    data?: {

    }
    constructor(augment: AugmentInterface) {
        this.apiName = augment.apiName;
        this.associatedTraits = augment.associatedTraits;
        this.composition = augment.composition;
        this.desc = augment.desc;
        this.effects = augment.effects;
        this.icon = augment.icon;
        this.incompatibleTraits = augment.incompatibleTraits;
        this.label = augment.label;
        this.data = augment.data;
    }

    static toJSON(augments: Augment[]) {
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
    static fromJSON(json: AugmentInterface[]) {
        return json.map(augment => {
            return new Augment(augment);
        })
    }
}


export enum EffectEnum {
    Null = "null",
}