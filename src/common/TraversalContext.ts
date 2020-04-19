import { VisitedNodes } from './VisitedNodes'
import { Any } from './Type'

export type TraversalFunc<R> = (type: Any, value: any, c: TraversalContext<R>) => R

export class TraversalContext<R> {
  position: 'BeforeChildren' | 'AfterChild' | 'AfterAllChildren' = 'BeforeChildren'
  skipSimpleTypes: boolean = true
  traversed: VisitedNodes<Any, any, any> = new VisitedNodes<Any, any, any>()
}
