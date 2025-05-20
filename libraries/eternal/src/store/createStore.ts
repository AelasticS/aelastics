import { EventPayload, Result } from "../events/EventTypes";
import { Timing, Operation, Type, Property } from "../interfaces/ISubscriptionManager";
import { TypeMeta, TypeSchema } from "../meta/InternalSchema";
import { StoreClass } from "./StoreClass";
import { IStore } from "../interfaces/IStore";


export function createStore(
  metaInfo: Map<string, TypeMeta> | TypeSchema,
  initialState: any = {},
  options: {
    freeze?: boolean;
    fetchFromExternalSource?: (type: string, uuid: string) => any;
  } = { freeze: true }
): IStore {
  if (!metaInfo) {
    throw new Error("meta information is required to create a store");
  }
  const types: Map<string, TypeMeta> = (metaInfo as TypeSchema).types || (metaInfo as Map<string, TypeMeta>);
  const store = new StoreClass(types);

  const publicAPI: IStore = {
    createObject: (type) => store.create(type), 
    updateObject: <T extends object>(recipe: (obj: T ) => void, obj: T) => store.update(recipe, obj),
    updateStore: <R>(recipe: () => R) => store.update(recipe) as R,
    findObjectByUUID: (uuid) => store.findObjectByUUID(uuid),
    isInUpdateMode: () => store.isInUpdateMode(),
    makeRegular: <T>(obj: T) => store.isInUpdateMode() as T, // TODO dummy implementation
    undo: () => store.undo(),
    redo: () => store.redo(),
    fromState: (stateIndex, target) => store.fromState(stateIndex, target),
    makeEternal: <T>(obj: T) => store.isInUpdateMode() as T, // TODO dummy implementation

    subscribeToObject: (obj, callback) => store.subscriptionManager().subscribeToObject(obj, callback),
    subscribeToStore: (callback) => store.subscriptionManager().subscribeToStore(callback),
    subscribe: (
      listener: (event: EventPayload) => Result,
      timing: Timing,
      operation: Operation,
      type: Type,
      property?: Property
    ) => store.subscriptionManager().subscribe(listener, timing, operation, type, property),
    getEternalStore: () => store,
  };

  return options.freeze ? Object.freeze(publicAPI) : publicAPI;
}
