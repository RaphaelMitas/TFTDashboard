export default interface tftTypes {
    items: Item[];
    setData: any;
    sets: any;
}

export interface Item {
    apiName: string;
    associatedTraits: string[];
    composition: string[];
    desc: null | string;
    effects: { [key: string]: number | EffectEnum };
    from: null;
    icon: string;
    id: null;
    incompatibleTraits: string[];
    name: null | string;
    unique: boolean;
    augmentQuality: string;
}

export enum EffectEnum {
    Null = "null",
}
