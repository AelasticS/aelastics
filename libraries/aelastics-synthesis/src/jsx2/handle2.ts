import * as t from 'aelastics-types'
import * as g from 'generic-metamodel'
import { Context } from './context'
import { Element, Template, WithRefProps } from './element'

export function hm<P extends WithRefProps<g.IModelElement>>
  (t: Template<P>, props: P, ...children: Element<any>[]): Element<P> {
  let childElem = t(props)
  childElem.children.push(...children.flat())
  return childElem
}

export function render<P extends g.IModelElement> (el:Element<P>) {
   return el.render(new Context())
}