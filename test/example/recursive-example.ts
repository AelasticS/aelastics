/*
 * Copyright (c) AelasticS 2019.
 */
import * as t from '../../src/aelastics-types'
import { AgeType, SexType, BirthPlaceType } from './types-example'
import any = jasmine.any

const MySchema = t.schema('MySchema')

export const PersonType = t.object(
  {
    name: t.string,
    age: t.optional(AgeType),
    sex: SexType,
    birthPlace: t.optional(BirthPlaceType),
    parent: t.link(MySchema, 'PersonType'),
    children: t.arrayOf(t.link(MySchema, 'PersonType'))
  },
  'PersonType',
  MySchema
)
t.inverseProps(PersonType, 'parent', PersonType, 'children')

// MySchema.validate()

export const GrandpaRobert: t.TypeOf<typeof PersonType> = {
  name: 'Robert',
  age: 88,
  sex: 'male',
  birthPlace: {
    name: 'Belgrade',
    state: 'Serbia'
  },
  parent: {},
  children: []
}

export const SonDavid: t.TypeOf<typeof PersonType> = {
  name: 'David',
  age: 55,
  sex: 'male',
  birthPlace: {
    name: 'Belgrade',
    state: 'Serbia'
  },
  parent: GrandpaRobert,
  children: []
}
GrandpaRobert.children.push(SonDavid)

export const SonMark: t.TypeOf<typeof PersonType> = {
  name: 'Mark',
  age: 35,
  sex: 'male',
  birthPlace: {
    name: 'Novi Sad',
    state: 'Serbia'
  },
  parent: SonDavid,
  children: []
}

export const DaugtherDora: t.TypeOf<typeof PersonType> = {
  name: 'Dora',
  age: 32,
  sex: 'female',
  birthPlace: {
    name: 'Novi Sad',
    state: 'Serbia'
  },
  parent: SonDavid,
  children: []
}
SonDavid.children.push(SonMark, DaugtherDora)

export const DaugtherSarah: t.TypeOf<typeof PersonType> = {
  name: 'Sarah',
  age: 30,
  sex: 'female',
  birthPlace: {
    name: 'Belgrade',
    state: 'Serbia'
  },
  parent: GrandpaRobert,
  children: []
}
GrandpaRobert.children.push(DaugtherSarah)

export const SonJohn: t.TypeOf<typeof PersonType> = {
  name: 'John',
  age: 3,
  sex: 'male',
  birthPlace: {
    name: 'Belgrade',
    state: 'Serbia'
  },
  parent: SonMark,
  children: []
}
export const secondLevelObject = t.object(
  {
    name: t.string
  },
  'secondLevelObject'
)
export const rootLevelLevelObject = t.object(
  {
    a: secondLevelObject,
    b: secondLevelObject
  },
  'rootLevelObject'
)

export const schema = t.schema('schema')

export const companyType = t.object(
  {
    name: t.string,
    city: t.string,
    director: t.link(schema, 'worker', 'director')
  },
  'company',
  schema
)

export const workerType = t.object(
  {
    firstName: t.string,
    lastName: t.string,
    company: companyType
  },
  'worker',
  schema
)

t.inverseProps(companyType, 'director', workerType, 'company')

export const arrayOfRootLevelObjects = t.arrayOf(rootLevelLevelObject)

export const objectWithArrays = t.object(
  {
    a: arrayOfRootLevelObjects,
    b: arrayOfRootLevelObjects
  },
  'object whit arrays'
)

export const arraySchema = t.schema('arraySchema')

export const arrayObject = t.object(
  {
    a: t.boolean,
    b: t.number,
    c: t.arrayOf(t.link(arraySchema, 'firstLevelArray', 'c'))
  },
  'arrayObject',
  arraySchema
)

export const firstLevelArray = t.arrayOf(arrayObject, 'firstLevelArray')

export const arr1: t.TypeOf<typeof arrayObject> = {
  a: true,
  b: 10,
  c: []
}
export const arr2: t.TypeOf<typeof arrayObject> = {
  a: false,
  b: 20,
  c: []
}

export const f: t.TypeOf<typeof firstLevelArray> = [arr1, arr2]

arr1.c[0] = f
arr2.c[0] = f

arraySchema.addType(firstLevelArray)

export const mapSchema = t.schema('mapSchema')

export const mapOfRootLevelObjects = t.mapOf(t.string, rootLevelLevelObject)

export const rootMap = t.mapOf(
  t.string,
  t.object(
    {
      a: t.boolean,
      b: t.number.derive().lessThan(32),
      c: t.optional(t.string),
      d: t.link(mapSchema, 'rootMap', 'object')
    },
    'object'
  ),
  'rootMap'
)
mapSchema.addType(rootMap)

// rootMapGraph za testiranje Mape sa graf strukturom

export const rootMapGraph = t.mapOf(
  t.number,
  // t.arrayOf(t.link(mapSchema, 'rootMapGraph')),
  t.mapOf(t.number, t.link(mapSchema, 'rootMapGraph')),
  'rootMapGraph'
)
mapSchema.addType(rootMapGraph)

export const map1: t.TypeOf<typeof rootMapGraph> = new Map([[1, new Map([])]])

export const map2: t.TypeOf<typeof rootMapGraph> = new Map([[1, map1]])

export const map3: t.TypeOf<typeof rootMapGraph> = new Map([[1, map2]])
map1.set(1, map2)

mapSchema.validate()
export const intersectionInstance = t.intersectionOf([
  t.object({ a: t.string.derive('').alphabetical }),
  t.object({ b: t.string })
])

export const objectWithIntersections = t.object(
  {
    a: intersectionInstance,
    b: intersectionInstance
  },
  'object with intersection'
)

export const intersectionSchema = t.schema('intersectionSchema')

export const secondLevelIntersectionObject = t.object(
  {
    a: t.link(intersectionSchema, 'recursiveIntersection', 'recursiveIntersection'),
    b: t.boolean,
    c: t.string
  },
  'secondLevelIntersectionObject',
  intersectionSchema
)

export const recursiveIntersection = t.intersectionOf(
  [t.object({ a: secondLevelIntersectionObject }), t.object({ b: t.string })],
  'recursiveIntersection'
)

export const recursive1: t.TypeOf<typeof recursiveIntersection> = {
  a: {
    c: 'C',
    b: true,
    a: undefined
  },
  b: 'A'
}
recursive1.a.a = recursive1

export const recursive2: t.TypeOf<typeof recursiveIntersection> = {
  a: {
    c: 'B',
    b: true,
    a: undefined
  },
  b: 'B'
}

export const recursive3: t.TypeOf<typeof recursiveIntersection> = {
  a: {
    c: 'C',
    b: true,
    a: undefined
  },
  b: 'C'
}

intersectionSchema.addType(recursiveIntersection)
intersectionSchema.validate()
export const simpleObject = t.object({ a: t.string }, 'simple object')
export const simpleSubtype = t.subtype(simpleObject, { date: t.date })
export const objectWithSubtipes = t.object(
  { a: simpleSubtype, b: simpleSubtype },
  'objectWithSubtypes'
)

export const subtypeSchema = t.schema('subtypeSchema')
export const secondLevelSybtypeObject = t.object(
  {
    a: t.boolean,
    b: t.link(subtypeSchema, 'recursiveSubtype', 'recursiveSubtype')
  },
  'secondLevelSybtypeObject',
  subtypeSchema
)
export const recursiveSubtype = t.subtype(
  simpleObject,
  { b: t.number.derive().greaterThan(11), c: secondLevelSybtypeObject },
  'recursiveSubtype',
  subtypeSchema
)

export const simpleUnion = t.unionOf([t.string, t.number], 'simpleUnion')
export const objectWithUnion = t.object({ a: simpleUnion, b: simpleUnion }, 'objectWithUnion')

export const unionSchema = t.schema('unionSchema')
export const secondLevelUnionObject = t.object(
  {
    a: t.boolean,
    b: t.link(unionSchema, 'recursiveUnion', 'recursiveUnion')
  },
  'secondLevelUnionObject',
  unionSchema
)
export const recursiveUnion = t.unionOf([secondLevelUnionObject, simpleUnion], 'recursiveUnion')
unionSchema.addType(recursiveUnion)
/*
import * as t from "../index";

// 1.
export function lazyFunction(f:()=> t.Any) {
    return function () {
        // @ts-ignore
        return f.apply(this, arguments);
    };
}
const lazyTreeType1 = lazyFunction(() => treeType1);

export const treeType1 = t.object({info:t.string, children:t.arrayOf(lazyTreeType1())});

export const tree1:t.TypeOf<typeof treeType> = {info:"", children:[]};

// export const treeType = t.subtype(treeTypeAbs, {children:treeTypeAbs});


// 2.
/!*
export const recursiveType = <fn extends ()=>any>  (f:fn) => {
    const res:ReturnType<fn> = f();
    return res;
}
const lazyTreeType = recursiveType(() => treeType);
*!/


// 3.
export class RecursiveTypeC<fn extends ()=> t.Any> extends t.TypeC<ReturnType<fn>> {

    constructor(name: string , public readonly getTypeFun:fn) {
        super(name);
    }

    public getType():t.Any {return this.getType();}
}
export const recursiveType = <ft extends ()=> t.Any>  (f:ft)=> new RecursiveTypeC("recursive", f);

const lazyTreeType = lazyFunction(() => treeType);

export const treeType = t.object({info:t.string, children:t.arrayOf(recursiveType(lazyTreeType))});
export const tree:t.TypeOf<typeof treeType> = {info:"", children:[]};


*/
