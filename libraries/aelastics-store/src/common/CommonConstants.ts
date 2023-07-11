import * as t from "aelastics-types";

export const prefixValue = "@@_";
export const objectStatus = "@@aelastics/status";
export const objectSync = "@@aelastics/sync";
export const objectUUID = "@@aelastics/ID";
export const objectType = "@@aelastics/type";

export type IStoreObject<ID, P extends t.ObjectLiteral> = P & {
  readonly [objectType]: string;
  readonly [objectUUID]: ID;
};

export function getUnderlyingType(type: t.Any | undefined): t.Any {
  if (type === undefined) {
    return undefined as any;
  }
  if (type.typeCategory === 'Link') {
    return getUnderlyingType((type as t.LinkType).resolveType()!);
  }
  // handle optional types
  if (type.typeCategory === 'Optional') {
    return getUnderlyingType((type as t.OptionalType<any>).base);
  }
  return type;
}
