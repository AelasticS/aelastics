import { ObjectLiteral } from "aelastics-types";

export const prefixValue = '@@_';
export const objectStatus = '@@aelastics/status';
export const objectSync = '@@aelastics/sync';
export const objectUUID = '@@aelastics/ID';
export const objectType = '@@aelastics/type'

export type IStoreObject<P extends ObjectLiteral> = P & {readonly objectType:string, readonly objectUUID:string }