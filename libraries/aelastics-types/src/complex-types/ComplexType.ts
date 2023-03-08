import { Type } from '../type/Type'
import { Node } from '../common/Node'
import { ITransformer, WhatToDo } from '../transducers/Transformer'
import { AnnotationTransformer, IAnnotationProcessor } from '../transducers/AnnotationTransformer'

export abstract class ComplexType<V, G, T> extends Type<V, G, T> {
  isSimple(): boolean {
    return false
  }

  doTransformation<A>(
    t: ITransformer,
    input: V | Node,
    initObj?: A,
    resetAcc: boolean = false,
  ): [A, WhatToDo] {
    let whatToDo: WhatToDo = 'continue'
    let acc: A = initObj as any
    let n = Node.makeNode(input, this, initObj)
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
    // maybe for loop could be replaced by reduce on Iterable ?

    /*    if (n.instance === undefined && whatToDo === 'continue') {  // make one step for undefined instance
    } else*/
    // ToDo check n.type.children!!!
    for (let [child, childType, childExtra] of n.type.children(n.instance, n)) {
      if (whatToDo !== 'continue') break
      let childNode: Node = Node.makeNode(child, childType, acc, childExtra, n)
      let [a1, a2] = t.step(acc, child, childNode)
      acc = a1
      whatToDo = a2
    }
    if (whatToDo === 'terminate') return [acc, 'terminate']
    return t.result(acc, n)
  }
}
