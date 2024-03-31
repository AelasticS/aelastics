import * as g from 'generic-metamodel'
import { Context } from './context'
import { CpxTemplate, Element, Template, WithRefProps } from './element'

//export function hm<P extends WithRefProps<g.IModelElement>>
// (t: Template<P>, props: P, ...children: Element<any>[]): Element<P> {
//   let childElem = t(props)
//   childElem.children.push(...children.flat())
//   return childElem
// }

// export function hm<P extends g.IModelElement, R>
//   (t: Template<P> | CpxTemplate<P, P>, props: P, ...children: Element<any>[]): Element<P, R> {
//   let childElem = t(props)
//   childElem.children.push(...children.flat())
//   return childElem
// }

export function hm(t: Template<g.IModelElement> | CpxTemplate<{}, g.IModelElement>, props: {}, ...children: Element<any>[])
  : Element<any, any> {
  let childElem = t(props)
  childElem.children.push(...children.flat())
  return childElem
}

export function render<P extends g.IModelElement> (el:Element<P>) {
   return el.render(new Context())
}



