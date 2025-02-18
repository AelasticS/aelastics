import { EternalStore, InternalRecipe } from "./EternalStore"
import { InternalObjectProps } from "./handlers/InternalTypes"
import { TypeMeta } from "./handlers/MetaDefinitions"

export interface Store {
  // Create a new object of a specific type
  createObject<T extends object>(type: string): T

  // Apply a recipe to an object
  produce<T>(recipe: recipe<T>, obj: T): T

  // Retrieve an object by UUID
  getObject<T extends object>(uuid: string): T | undefined

  /** Check if produce() is currently active */
  isInProduceMode(): boolean

  /** Undo last state change */
  undo(): boolean

  /** Redo last undone state change */
  redo(): boolean

  /** Retrieve an object from a specific historical state */
  fromState<T>(stateIndex: number, target: string | T): T | undefined
}

export type recipe<T> = (obj: T) => void

export function createStore(
  metaInfo: Map<string, TypeMeta>,
  initialState: any = {},
  options: {
    freeze?: boolean
    fetchFromExternalSource?: (type: string, uuid: string) => any
  } = { freeze: true }
): Store {
  const store = new EternalStore(metaInfo, options.fetchFromExternalSource)

  const publicAPI: Store = {
    createObject: (type) => store.createObject(type),
    produce: (recipe, obj) => store.produce(recipe as InternalRecipe, obj as InternalObjectProps) as any,
    getObject: (uuid) => store.getObject(uuid),
    isInProduceMode: () => store.isInProduceMode(),
    undo: () => store.undo(),
    redo: () => store.redo(),
    fromState: (stateIndex, target) => store.fromState(stateIndex, target)
  }

  return options.freeze ? Object.freeze(publicAPI) : publicAPI
}
