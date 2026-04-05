import * as g from 'generic-metamodel'
import { Context } from './context'
import { CpxTemplate, ExprNode, Template, WithRefProps } from './element'

//export function hm<P extends WithRefProps<g.IModelElement>>
// (t: Template<P>, props: P, ...children: ExprNode<any>[]): ExprNode<P> {
//   let childElem = t(props)
//   childElem.children.push(...children.flat())
//   return childElem
// }

// export function hm<P extends g.IModelElement, R>
//   (t: Template<P> | CpxTemplate<P, P>, props: P, ...children: ExprNode<any>[]): ExprNode<P, R> {
//   let childElem = t(props)
//   childElem.children.push(...children.flat())
//   return childElem
// }

export function createExprNode(t: Template<g.IModelElement> | CpxTemplate<{}, g.IModelElement>, props: {}, ...children: ExprNode<any>[])
  : ExprNode<any, any> {
  let childElem = t(props)
  childElem.childArray.push(...children.flat())
  return childElem
}

export function render<P extends g.IModelElement> (el:ExprNode<P>) {
   return el.render(new Context())
}



