/*
 * Copyright (c) AelasticS 2020.
 */

import * as Trans from "./transducers/index"
export {Trans}

import * as AnnotationDecls from "./annotations/index"
export {AnnotationDecls as AnnotationTypes}

export * from './common/DefinitionAPI'
export * from './common/Node'

export * from './type/TypeDefinisions'
export { ITransformer, WhatToDo } from './transducers/Transformer'
export { IMapFun, identityReducer, naturalReducer , stepperReducer, transducer} from './transducers/Transducer'
export { Node } from './common/Node'
export { Type } from './type/Type'
export {TypeCategory} from './type/TypeDefinisions'
export { SimpleType, AnySimpleType } from './simple-types/SimpleType'

export { StringType } from './simple-types/StringType'
export { NumberType } from './simple-types/NumberType'
export { BooleanType } from './simple-types/BooleanType'
export { LiteralType } from './simple-types/Literal'
export { DateType } from './simple-types/DateType'
export { NullType } from './simple-types/Null'
export { UndefinedType } from './simple-types/Undefined'
export { VoidType } from './simple-types/Void'

export { ComplexType } from './complex-types/ComplexType'
export { ObjectType, AnyObjectType } from './complex-types/ObjectType'
export { ArrayType } from './complex-types/ArrayType'
export { Subtype } from './complex-types/Subtype'
export { TaggedUnionType } from './complex-types/TaggedUnionType'
export { EntityType, findTypeCategory } from './complex-types/EntityType'

export { OptionalType } from './special-types/Optional'
export { EntityReference } from './special-types/EntityReference'
export { LinkType } from './special-types/LinkType'

export {AnnotationSchema, Annotation} from './annotations/Annotation'