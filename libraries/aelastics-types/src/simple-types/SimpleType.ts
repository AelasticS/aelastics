import { ExtraInfo, Type } from '../type/Type'
import { Any } from '../common/DefinitionAPI'
import { Node } from '../common/Node'
import { ITransformer , WhatToDo } from '../transducers/Transformer'

export abstract class SimpleType<V, G, T> extends Type<V, G, T> {
  isSimple(): boolean {
    return true
  }
/*  init(n: Node): V {
    return n.instance
  }*/

  addChild(parent: any, child: any, n: Node): void {}

  *children(i: V, n: Node): Generator<[V, Any, ExtraInfo]> {
 //   return [i, this, n.extra]
  }

  doTransformation<A>(
    t: ITransformer,
    input: V | Node,
    initObj?: A,
    resetAcc: boolean = false
  ): [A, WhatToDo] {
    /**
     *  no children, skip step, just do init i result
     */
    let acc = initObj
    let whatToDo: WhatToDo
    let n = Node.makeNode(input, this, initObj)
    if (resetAcc || acc === undefined) {
      ;[acc, whatToDo] = t.init(initObj, n)
    }
    ;[acc, whatToDo] = t.step(acc, n.instance, n)
    return whatToDo !== 'continue' ? [acc!, whatToDo] : (t.result(acc, n) as any)
  }
}

export type AnySimpleType = SimpleType<any, any, any>

