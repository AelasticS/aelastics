import { VisitedNodes } from './VisitedNodes'
import { Any } from './Type'

export type PositionType = 'BeforeChildren' | 'AfterChild' | 'AfterAllChildren'

export type RoleType =
  | 'asProperty'
  | 'asArrayElement'
  | 'asMapKey'
  | 'asMapValue'
  | 'asElementOfUnion'
  | 'asElementOfTaggedUnion'
  | 'asIntersectionElement'
  | 'asIdentifierPart'
  | 'asFuncArgument'
  | 'asReturnType'
  | 'asRoot'

export type ExtraInfo = Partial<{
  propName: string
  index: number
  parentType: Any
  parentInstance: any
  parentResult: any
  optional: boolean
}>

export type TraversalFunc<R> = (
  type: Any,
  value: any,
  currentResult: R,
  position: PositionType,
  role: RoleType,
  extra: ExtraInfo,
  context: TraversalContext<R>
) => R

export class TraversalContext<R> {
  initValue: R
  public readonly entries: TraversalContextEntry[] = []
  skipSimpleTypes: boolean = true
  traversed: VisitedNodes<Any, any, any> = new VisitedNodes<Any, any, any>()

  constructor(initValue: R, skipSimpleTypes: boolean) {
    this.initValue = initValue
    this.skipSimpleTypes = skipSimpleTypes
    //    this.pushEntry('BeforeChildren', 'asRoot', {})
  }

  pushEntry(/*p: PositionType,*/ r: RoleType, e: ExtraInfo) {
    this.entries.push(new TraversalContextEntry(/*p, */ r, e, this.lastEntry))
  }

  popEntry() {
    return this.entries.pop()
  }

  get lastEntry(): TraversalContextEntry | undefined {
    if (this.entries.length <= 0) {
      // throw new Error(`TraversalContext.pop() error: array of entries empty!`)
      return undefined
    }
    return this.entries[this.entries.length - 1]
  }
}

class TraversalContextEntry {
  parent?: TraversalContextEntry
  //  position: PositionType
  role: RoleType
  extra: ExtraInfo

  constructor(/*p: PositionType,*/ r: RoleType, e: ExtraInfo, parent?: TraversalContextEntry) {
    //    this.position = p
    this.role = r
    this.extra = e
    this.parent = parent
  }
}
