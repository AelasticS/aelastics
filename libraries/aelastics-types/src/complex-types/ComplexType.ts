import { Type } from '../type/Type'
import { Node } from '../common/Node'
import { ITransformer, WhatToDo } from '../transducers/Transformer'

export abstract class ComplexType<V, G, T> extends Type<V, G, T> {
  isSimple(): boolean {
    return false
  }

  doTransformation<A>(
    t: ITransformer,
    input: V | Node,
    initObj?: A,
    resetAcc: boolean = false,
    typeLevel:boolean = false
  ): [A, WhatToDo] {
    let whatToDo: WhatToDo = 'continue'
    let acc: A = initObj as any
    let n = Node.makeNode(input, this, initObj, undefined, undefined, typeLevel)
    if (n.visited.has([n.type, n.instance])) {
      n.isRevisited = true // already visited
      if (resetAcc) {
        let r = <any>n.visited.get([n.type, n.instance])
        return [r, 'continue']
      } else return [acc!, 'continue']
    }
    if (resetAcc || acc === undefined) {
      ;[acc, whatToDo] = t.init(initObj, n)
    }
    n.visited.set([n.type, n.instance], acc) // remember for the next visit
    if (whatToDo === 'terminate') return [acc!, 'terminate']
    // iterate over children
    for (let [child, childType, childExtra] of n.type.children(n.instance, n)) {
      if (whatToDo !== 'continue') break
      let childNode: Node = Node.makeNode(child, childType, acc, childExtra, n, typeLevel)
      let [a1, a2] = t.step(acc, childNode, child)  // process child
      acc = a1
      whatToDo = a2
    }
    if (whatToDo === 'terminate') return [acc, 'terminate']
    return t.result(acc, n)
  }
}
