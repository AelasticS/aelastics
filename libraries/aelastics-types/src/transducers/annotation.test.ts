/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../common/DefinitionAPI'
import { DefaultSchema } from '../type/TypeSchema'
import { Annotation, AnnotationSchema } from '../annotations/Annotation'
import { identityReducer , transducer } from './Transducer'
import { ITransformer, WhatToDo } from './Transformer'
import { Node } from '../common/Node'

let OptionalNumber = t.optional(t.number)
let LinkToPerson = t.link(DefaultSchema, 'Person')

let Child = t.object(
  {
    name: t.string,
    parent: t.optional(LinkToPerson),
  },
  'Child'
)
let ChildArray = t.arrayOf(Child)

ChildArray.addValidator({
  predicate: (value) => value.length > 2,
  message: (v, label?: string, result?: any): string => 'minimal length is 3',
})

let Person = t.object(
  {
    age: t.number,
    name: t.string,
    children: ChildArray,
    male: t.boolean,
    employed: t.boolean,
  },
  'Person'
)

Person.addValidator({
  predicate: (value) => (value.male ? value.employed : true),
  message: (v, label?: string, result?: any): string => 'male persons should be employed',
})

let PersonOptional = t.object(
  { name: t.string, age: OptionalNumber, male: t.boolean, children: t.arrayOf(t.number) },
  'PersonOptional'
)

const simpleOrmAnnotSchema = t.object({ attribute: t.string }, 'simple Orm Annot Schema')
const objectOrmAnnotSchema = t.object({ entity: t.string, id: t.string }, 'object Orm Annot Schema')
const collectionOrmAnnotSchema = t.object({ mapping: t.string }, 'list Orm Annot Schema')

export type ORM_AnnotationSchema = AnnotationSchema<
  typeof simpleOrmAnnotSchema,
  typeof objectOrmAnnotSchema,
  typeof collectionOrmAnnotSchema
>

export type ORM_Annotation<T> = Annotation<T, ORM_AnnotationSchema>

const personAnnot: ORM_Annotation<typeof Person> = {
  entity: 'Person',
  id: 'PersonID',
  $props: {
    name: { attribute: 'name' },
    age: { attribute: 'name' },
    employed: { attribute: 'name' },
    male: { attribute: 'name' },
    children: {
      mapping: 'children',
      $elem: {
        entity: 'Child',
        id: 'ChildID',
        $props: { name: { attribute: 'name' }, parent: { attribute: 'parent' } },
      },
    },
  },
}


const p: t.TypeOf<typeof Person> = {
  name: 'Peter',
  male: true,
  age: 43,
  employed: true,
  children: [],
}
p.children.push({ name: 'Liza', parent: p })

class ermProcessor implements ITransformer {

  private xf: ITransformer

  constructor(xf: ITransformer) {
    this.xf = xf
  }

  init(value:any, currNode: Node): [any, WhatToDo]{
    let instance: any
    if (value) {
      instance = value
    }
    switch (currNode.type.typeCategory) {
      case 'Object':
        // TODO: create class instance, if provided
        instance = {}
        break
      case 'Array':
        instance = []
  //      currNode.instance = instance
        break
      case 'Optional':
        break
    }
    console.log(
      `INIT: annot: ${currNode.getAnnotationForNode(personAnnot)}, value:${value}, instance:${instance}, name: ${currNode.type.name}, category:${currNode.type.typeCategory}`
    )
    return this.xf.init(instance, currNode)
  }

  result (result:any, currNode: Node): [any, WhatToDo] {
/*    console.log(
      `RESULT: result:${result}, instance:${currNode.instance}, name: ${currNode.type.name}, category:${currNode.type.typeCategory}`
    )*/
    return this.xf.result(result, currNode)
  }

  step (result:any, item: any, currNode: Node): [any, WhatToDo] {
    let instance: any
    if (item) {
      instance = item
    }
    switch (currNode.type.typeCategory) {
      case 'Object':
        if (!item) {
          instance = {}
        }
        break
      case 'Array':
        if (!item) {
          instance = []
        }
        break
      case 'String':
        if (instance === undefined) {
          instance = ''
        }
        break
      case 'Number':
        if (instance === undefined) {
          instance = 0
        }
        break
      case 'Boolean':
        if (instance === undefined) {
          instance = true
        }
        break
      case 'Optional':
        break
    }
    currNode.parent?.type.addChild(result, instance, currNode)
/*    console.log(
      `STEP: value:${result}, item:${item}, name: ${currNode.type.name}, category:${currNode.type.typeCategory}`
    )*/
    return this.xf.step(result, item, currNode)
  }
}

describe('basic test for annotations', () => {
  it('should create a default person cyclic optional', () => {
    let tr = transducer()
      .recurse('makeItem')
      .processAnnotations(personAnnot)
      .do(ermProcessor)
      .doFinally(identityReducer())
    let r = Person.transduce(tr, p)
    expect(r).toEqual(p)
  })
})
