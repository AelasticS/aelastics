import { EternalStore } from "./EternalStore";
import { EternalObject } from "./handlers/InternalTypes";
import { PropertyMeta } from "./handlers/MetaDefinitions";

export type UUID = string;

export interface ChangeLog {
    type: 'insert' | 'update' | 'delete';
    objectId: UUID;
    property?: string;
    oldValue?: any;
    newValue?: any;
}


// extra data for observable creators
export interface ObservableExtra {
    store: EternalStore;
    object: EternalObject;
    propDes: PropertyMeta;
}
