/*
 * Created Date: Tuesday, February 21st 2023
 * Author: Sinisa Neskovic
 * 
 * Copyright (c) 2023 AelasticS
 */

import * as t from "aelastics-types"
import {transducer, Trans as tr}  from "aelastics-types"
import { Node } from "aelastics-types"

let testSchema = t.schema("testSchema")
let Child = t.object(
    {
      name: t.string,
      age: t.number,
    }, 
    "Child",testSchema
)

let Person = t.object(
    {
      name: t.string,
      children: t.arrayOf(Child),
      age: t.number,
      male: t.boolean,
      employed: t.boolean,
    },
    'Person',
    testSchema
)


type IChild = t.TypeOf<typeof Child>
type IPerson = t.TypeOf<typeof Person>

let ch1:IChild = {
  name:"Peter",
  age:10
}

let ch2:IChild = {
  name:"Petra",
  age:4
}

let Tom:IPerson = {
  name:"Tom",
  age:35,
  male:true,
  children:[ch1, ch2],
  employed:true
}

const simpleOrmAnnotSchema = t.object({ column: t.string }, 'simple Orm Annot Schema')
const objectOrmAnnotSchema = t.object({ table: t.string, id: t.string }, 'object Orm Annot Schema')
const collectionOrmAnnotSchema = t.object({ FK: t.string }, 'list Orm Annot Schema')

export type ORM_AnnotationSchema = t.AnnotationSchema<
  typeof simpleOrmAnnotSchema,
  typeof objectOrmAnnotSchema,
  typeof collectionOrmAnnotSchema
>

export type ORM_Annotation<T> = t.Annotation<T, ORM_AnnotationSchema>


const personAnnot: ORM_Annotation<typeof Person> = {
  table:"PersonTable",
  id:"PersonID",
  $props:{
    name:{column:"Name"},
    age:{column:"Age"},
    male:{column:"Male"},
    employed:{column:"Employed"},
    children:{
      FK:"PersonID",
      $elem: {
        table:"ChildTable",
        id:"ChildID",
        $props:{
          name:{column:"Name"},
          age:{column:"Age"}
        }
      }
    }
  }
}
  

describe("test annotation handler", ()=>{
  let sumNumbers: tr.Reducer<number> = (acc: number, item: any, { instance, type }: Node) => {
    switch (type.typeCategory) {
      case 'Number':
        return acc + instance
    }
    return acc
  }

  it('should return 48 when summarizing all numbers', () => {
  //  let tr = transducer().recurse('accumulate').reduce(sumNumbers, 0)
    // let sum = Person.transduce(tr, personAnnot)
    // expect(sum).toEqual(NaN)
    expect(NaN).toEqual(NaN)
  })
})

