/*
 * Copyright (c) AelasticS 2020.
 */

import { Node } from '../common/Node'
import { ServiceError } from 'aelastics-result'
import { ITransformer, WhatToDo } from './Transformer'
import { NamedAnnotation } from '../annotations/Annotation'

export interface IAnnotationProcessor {
  init: (value: any, currNode: Node, p: AnnotationProcess) => [any, WhatToDo]
  result: (result: any, currNode: Node, p: AnnotationProcess) => [any, WhatToDo]
  step: (result: any, item: any, currNode: Node, p: AnnotationProcess) => [any, WhatToDo]
}

export class AnnotationProcess implements ITransformer {
  public readonly annotation: any // NamedAnnotation
  public readonly processor: IAnnotationProcessor
  private _annotationStack: any[] = []

  get currentAnnotation(): any {
    return this._annotationStack.length > 0
      ? this._annotationStack[this._annotationStack.length - 1]
      : undefined
  }

  constructor(annotation: NamedAnnotation, p: IAnnotationProcessor) {
    // ToDo: extend to support an array (a map) of annotations
    this.annotation = annotation.annotation
    this.processor = p
  }

  init(value: any, currNode: Node): [any, WhatToDo] {
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
    return this.processor.init(value, currNode, this)
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    let r = this.processor.result(result, currNode, this)
    this._annotationStack.pop()
    return r // [result, 'continue']
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

    let r = this.processor.step(result, value, currNode, this)
    this._annotationStack.pop()
    return r
  }
}
