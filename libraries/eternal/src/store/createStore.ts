import { EventPayload, Result } from "../events/EventTypes";
import { Timing, Operation, Type, Property } from "../events/SubscriptionInterface";
import { StoreObject } from "../handlers/InternalTypes";
import { TypeMeta, TypeSchema } from "../meta/InternalSchema";
import { EternalStore, InternalRecipe } from "./EternalStore";
import { Store } from "./StoreInterface";


export function createStore(
  metaInfo: Map<string, TypeMeta> | TypeSchema,
  initialState: any = {},
  options: {
    freeze?: boolean;
    fetchFromExternalSource?: (type: string, uuid: string) => any;
  } = { freeze: true }
): Store {
  if (!metaInfo) {
    throw new Error("meta information is required to create a store");
  }
  const types: Map<string, TypeMeta> = (metaInfo as TypeSchema).types || (metaInfo as Map<string, TypeMeta>);
  const store = new EternalStore(types);

  const publicAPI: Store = {
    createObject: (type) => store.createObject(type), 
    updateObject: <T extends object>(recipe: (obj: T ) => void, obj: T) => store.produce(recipe, obj),
    updateStore: <R>(recipe: () => R) => store.produce(recipe) as R,
    getObject: (uuid) => store.getObject(uuid),
    isInUpdateMode: () => store.isInUpdateMode(),
    makeRegular: <T>(obj: T) => store.isInUpdateMode() as T, // TODO dummy implementation
    undo: () => store.undo(),
    redo: () => store.redo(),
    fromState: (stateIndex, target) => store.fromState(stateIndex, target),
    makeEternal: <T>(obj: T) => store.isInUpdateMode() as T, // TODO dummy implementation

    subscribeToObject: (obj, callback) => store.getSubscriptionManager().subscribeToObject(obj, callback),
    subscribeToStore: (callback) => store.getSubscriptionManager().subscribeToStore(callback),
    subscribe: (
      listener: (event: EventPayload) => Result,
      timing: Timing,
      operation: Operation,
      type: Type,
      property?: Property
    ) => store.getSubscriptionManager().subscribe(listener, timing, operation, type, property),
    getEternalStore: () => store,
  };

  return options.freeze ? Object.freeze(publicAPI) : publicAPI;
}
