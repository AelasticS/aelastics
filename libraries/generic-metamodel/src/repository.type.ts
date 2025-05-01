import * as t from "aelastics-types";
import { DescriptionType, IDType, NameType } from "./basic.type";
import { Model } from "./models.type";

const objectID = '@@aelastics/ID';
const objectType = '@@aelastics/type'

export const RepositoryShema = t.schema("RepositoryShema");


// TODO name must be RegExp("^[a-zA-Z0-9_.-]+$")
export const RepositoryObject =  t.entity({

    id: IDType,
    name: NameType,
    description: DescriptionType,
    ownerRepository: IDType,
    ownerPackage: IDType,
    category: t.string.derive("ObjectType").oneOf(['Item', 'Package', 'ObjAsPackage']),
    objectClassification:IDType
}, ['name'] as const, 'RepositoryObject', RepositoryShema);


export const Package = t.subtype(RepositoryObject,{
    content: t.arrayOf(RepositoryObject),
}, 'Package', RepositoryShema);


export const ObjAsPackage = t.subtype(Package,{
    objRef: IDType,
}, 'ObjAsPackage', RepositoryShema);


export const Repository = t.subtype(Package,{
    repositoryType: IDType
}, "Repository", RepositoryShema);


export type IRepository = t.TypeOf<typeof Repository>;