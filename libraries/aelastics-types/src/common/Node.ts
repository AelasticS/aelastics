/*
 * Copyright (c) AelasticS 2020.
 */

import { Any } from './DefinitionAPI'
import { ExtraInfo } from '../type/Type'
import { VisitedNodes } from './VisitedMap'
import { AnnotationTransformer} from '../transducers/AnnotationTransformer'
import { TypedAnnotation} from '../annotations/Annotation'

export class Node {
  instance: any
  type: Any
  acc?: any
  extra: ExtraInfo
  parent?: Node
  visited: VisitedNodes
  annotationTransformers:Map<TypedAnnotation, AnnotationTransformer>
  private _revisited: boolean = false

  constructor(
    i: any,
    t: Any,
    acc?: any,
    e: ExtraInfo = { role: 'asRoot', optional: false },
    parent?: Node
  ) {
    this.instance = i
    this.type = t
    this.acc = acc
    this.extra = e
    this.annotationTransformers = parent? parent.annotationTransformers: new Map()
    this.parent = parent
    this.visited = this.parent !== undefined ? this.parent.visited : new VisitedNodes()
  }

  get isRevisited(): boolean {
    return this._revisited
  }

  set isRevisited(b: boolean) {
    this._revisited = b
  }

  getCurrentAnnotationElement(a:TypedAnnotation) :any {
    return this.annotationTransformers.get(a)?.currentAnnotationElement
  }

  getAnnotationTransformer(a:TypedAnnotation) : AnnotationTransformer | undefined {
    return this.annotationTransformers.get(a)
  }
  
  static makeNode(input: any | Node, type: Any, acc: any, e?: ExtraInfo, parent?: Node): Node {
    if (input instanceof Node) return input
    return new Node(input, type, acc, e, parent)
  }

}
