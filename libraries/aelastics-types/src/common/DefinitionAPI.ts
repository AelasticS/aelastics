/*
 * Copyright (c) AelasticS 2020.
 */

import { BooleanType } from '../simple-types/BooleanType';
import { NumberType } from '../simple-types/NumberType';
import { StringType } from '../simple-types/StringType';
import { InterfaceDecl, ObjectType } from '../complex-types/ObjectType';
import { Type } from '../type/Type';
import { ArrayType } from '../complex-types/ArrayType';
import { OptionalType } from '../special-types/Optional';
import { DefaultSchema, System, TypeSchema } from '../type/TypeSchema';
import { LinkType } from '../special-types/LinkType';
import { Subtype } from '../complex-types/Subtype';
import { DateType } from '../simple-types/DateType';
import { VoidType } from '../simple-types/Void';
import { UndefinedType } from '../simple-types/Undefined';
import { NullType } from '../simple-types/Null';
import { LiteralType, LiteralValue } from '../simple-types/Literal';
import { EntityReference } from '../special-types/EntityReference';
import { ServiceError } from 'aelastics-result';
import { TaggedUnionType } from '../complex-types/TaggedUnionType';

export * from '../complex-types/EntityType';

export { TypeSchema, DefaultSchema, System } from '../type/TypeSchema';

let counter = 0;

/*function generateName(base: string) {
  return `${base}_${++counter}`
}*/

export interface ObjectLiteral {
  [key: string]: any;
}

export const schema = (name: string, superSchema: TypeSchema = DefaultSchema) => {
  return new TypeSchema(name, superSchema);
};

export const object = <P extends InterfaceDecl>(
  props: P,
  name?: string,
  schema: TypeSchema = DefaultSchema
): ObjectType<P, []> => {
  if (name === undefined || name === '') name = schema.generateName('Object');
  const obj = new ObjectType<P, []>(name, props, [], schema);
  return obj;
};
const getSubtypeName = <U extends ObjectType<any, any>>(superType: U): string => {
  return `subtype of ${superType.fullPathName})`;
};

export const subtype = <P extends InterfaceDecl, S extends InterfaceDecl, I extends readonly string[]>(
  superType: ObjectType<S, I>,
  extraProps: P,
  name: string = getSubtypeName(superType),
  schema: TypeSchema = DefaultSchema
  // @ts-ignore
  //  superProps: S = superType['interfaceDecl']
): Subtype<P, S, ObjectType<InterfaceDecl, I>> => {
  if (name === undefined || name === '') name = schema.generateName(`SubtypeOf ${superType.fullPathName})`);
  return new Subtype(name, extraProps, superType as ObjectType<InterfaceDecl, I>, schema);
};

export const arrayOf = <T extends Any>(
  element: T,
  name?: string,
  schema: TypeSchema = DefaultSchema
): ArrayType<T> => {
  if (name === undefined || name === '') name = schema.generateName(`Array<${element.name}>`);
  let obj = new ArrayType<T>(name, element, schema);
  return obj;
};

const getUnionName = <U extends InterfaceDecl>(elements: U): string => {
  return (
    '(' +
    Object.keys(elements)
      .map((baseType) => elements[baseType].name)
      .join(' | ') +
    ')'
  );
};

export const taggedUnion = <P extends InterfaceDecl>(
  elements: P,
  discr: string,
  name: string = getUnionName(elements),
  schema: TypeSchema = DefaultSchema
): TaggedUnionType<P> => {
  for (let key in elements) {
    let elem = elements[key];
    if (elem instanceof ObjectType) {
      let [keys, types, len] = elem.getPropsInfo();
      if (!keys.includes(discr)) {
        throw new ServiceError('ValidationError', 'Invalid value of discriminator');
      }
    }
  }
  return new TaggedUnionType(name, discr, elements, schema);
};

/**
 * Reference to an Entity (i.e. an object with an identifier)
 * @param t
 * @param name
 * @param schema
 */
export const entityRef = <T extends ObjectType<any, readonly string[]>>(
  t: T,
  name?: string,
  schema: TypeSchema = DefaultSchema
) => {
  if (name === undefined || name === '') name = schema.generateName(`referenceTo${t.name}}>`);
  let obj = new EntityReference<T>(name, t, schema);
  return obj;
};

/**
 *  Boolean type
 */
// tslint:disable-next-line:variable-name
export const boolean: BooleanType = new BooleanType('boolean', 'Boolean', System);
export const optionalBoolean = optional(boolean)

/**
 *  Number type
 */
// tslint:disable-next-line:variable-name
export const number: NumberType = new NumberType('number', 'Number', System);
export const optionalNumber = optional(number)

/**
 *  String type
 */
// tslint:disable-next-line:variable-name
export const string: StringType = new StringType('string', 'String', System);
export const optionalString = optional(string)
/**
 *  date type
 */

export const date = new DateType('date', 'Date', System);

export const voidType: VoidType = new VoidType('Void', 'Void', System);

/**
 *  Undefined type
 */
export const undefinedType: UndefinedType = new UndefinedType();
/**
 *  Null type
 */
export const nullType: NullType = new NullType('Null', 'Null', System);

/**
 * Literal type
 * @param value
 */
export const literal = <V extends LiteralValue>(
  value: V,
  schema: TypeSchema = DefaultSchema
): LiteralType<V> => {
  const name: string = schema.generateName(value.toString()); // JSON.stringify(value)
  return new LiteralType<V>(name, 'Literal', schema, value);
};

/**
 * Optional type
 */
export function optional<RT extends Any>(
  type: RT,
  name?: string,
  owner: TypeSchema = DefaultSchema
): OptionalType<RT> {
  if (name === undefined) name = owner.generateName(`Optional_${type.name}`);

  const optType = owner.getType(name);

  if (optType instanceof OptionalType) {
    return optType;
  }

  if (optType !== undefined) {
    throw new ServiceError('ValidationError', `Type ${name} already exists in schema ${owner.name} which is not an OptionalType`);
  }

  return new OptionalType(type, name, owner);
}

/**
 * link type
 * @param schema
 * @param path
 * @param name
 */
let coun;
export const link = (
  schema: TypeSchema,
  path: string,
  name: string = schema.generateName(`Link->${path}`),
  owner: TypeSchema = DefaultSchema
) => {
  if (name == undefined) name = schema.generateName(`Link->${path}`);
  return new LinkType(name, schema, path, owner);
};

/**
 *  'any' type
 */

export type Any = Type<any, any, any>;
/**
 *  'type of' operators
 */
export type TypeOf<C extends Any> = C['_V'];
export type DtoGraphTypeOf<C extends Any> = C['_G'];
export type DtoTreeTypeOf<C extends Any> = C['_T'];
