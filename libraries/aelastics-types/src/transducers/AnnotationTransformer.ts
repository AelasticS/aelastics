/*
 * Copyright (c) AelasticS 2020.
  
 */

// TODO: make AnnotationTransformer as usual Transfomer, other can acces annotations via Node
// Map<AnnotationName, AnnotationTransformer> getCurrentAnnotation, 
import { Node } from '../common/Node'
import { ServiceError } from 'aelastics-result'
import { ITransformer, WhatToDo } from './Transformer'
import { AnyAnnotation } from '../annotations/Annotation'

// export interface IAnnotationProcessor {
//   init: (value: any, currNode: Node, p: AnnotationTransformer) => [any, WhatToDo]
//   result: (result: any, currNode: Node, p: AnnotationTransformer) => [any, WhatToDo]
//   step: (result: any, item: any, currNode: Node, p: AnnotationTransformer) => [any, WhatToDo]
// }

export class AnnotationTransformer implements ITransformer {
  private readonly annotation:  AnyAnnotation
  private readonly xf: ITransformer
  private _annotationStack: any[] = []

  
  constructor(xf: ITransformer, a: AnyAnnotation, ) {
    // ToDo: extend to support an array (a map) of annotations
    this.annotation = a
    this.xf = xf
  }
  
  get currentAnnotation(): any {
    return this._annotationStack.length > 0
      ? this._annotationStack[this._annotationStack.length - 1]
      : undefined
  }


  init(value: any, currNode: Node): [any, WhatToDo] {
    // set current node to point to this instance
    if(!currNode.annotationTransformers?.get(this.annotation))
      new Error(`No annotation - node type: ${currNode.type.name}, value:${currNode.instance}`)
    currNode.annotationTransformers.set(this.annotation, this)

    switch (currNode.extra.role) {
      case 'asRoot':
        this._annotationStack.push(this.annotation)
        break
      case 'asElementOfTaggedUnion':
        this._annotationStack.push(
          this._annotationStack[this._annotationStack.length - 1] === undefined
            ? undefined
            : this._annotationStack[this._annotationStack.length - 1]['$union'][
                currNode.extra.propName as any
              ]
        )
        break
      case 'asIdentifierPart':
      case 'asProperty':
        this._annotationStack.push(
          this._annotationStack[this._annotationStack.length - 1] === undefined
            ? undefined
            : this._annotationStack[this._annotationStack.length - 1]['$props'][
                currNode.extra.propName as any
              ]
        )
        break
      case 'asArrayElement':
        this._annotationStack.push(
          this._annotationStack[this._annotationStack.length - 1] === undefined
            ? undefined
            : this._annotationStack[this._annotationStack.length - 1]['$elem']
        )
        break
    }
    if (this._annotationStack.length > 20) {
      throw new ServiceError(
        'RangeError',
        'Stack too deep.Possible infinitive recursive definition.'
      )
    }
    return this.xf.init(value, currNode)
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    let r = this.xf.result(result, currNode)
    this._annotationStack.pop()
    return r 
  }

  step(result: any, value: any, currNode: Node): [any, WhatToDo] {
    let instance: any
    if (this._annotationStack[this._annotationStack.length - 1] !== undefined) {
      switch (currNode.extra.role) {
        case 'asRoot':
          break
        case 'asProperty':
          this._annotationStack.push(
            this._annotationStack[this._annotationStack.length - 1]['$props'][
              currNode.extra.propName as any
            ]
          )
          break
        case 'asArrayElement':
          this._annotationStack.push(
            this._annotationStack[this._annotationStack.length - 1]['$elem'] // [currNode.extra.index as any]
          )
          break
      }
    } else this._annotationStack.push(undefined)

    let r = this.xf.step(result, value, currNode)
    this._annotationStack.pop()
    return r
  }
}
