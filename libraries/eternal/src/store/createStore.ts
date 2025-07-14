import { TypeMeta, TypeSchema } from "../meta/InternalSchema";
import { StoreClass } from "./StoreClass";
import { IStore } from "../interfaces/IStore";
import { ObjectsAdapter, HistoryAdapter, DataAdapter, EventsAdapter, RegistryAdapterForStore } from "./InterfaceAdapters";


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

  // Create adapters for each interface
  const objectsAdapter = new ObjectsAdapter(store);
  const historyAdapter = new HistoryAdapter(store);
  const dataAdapter = new DataAdapter(store);
  const eventsAdapter = new EventsAdapter(store);
  const registryAdapterForStore = new RegistryAdapterForStore(store);

  const publicAPI: IStore = {
    // Namespace accessors
    get objects() { return objectsAdapter; },
    get history() { return historyAdapter; },
    get registry() { return registryAdapterForStore.getRegistry(); },
    get data() { return dataAdapter; },
    get events() { return eventsAdapter; },

    // Store-level operations
    import: (storeStateJson: string) => {
      // TODO: Implement full store import
      store.deserialize(storeStateJson);
    },
    export: () => {
      // TODO: Implement full store export
      return JSON.stringify({ message: "Full store export not yet implemented" });
    },

    // Utility methods
    makeEternal: <T>(obj: T) => obj, // TODO: Implement proper makeEternal
    makeRegular: <T>(obj: T) => obj, // TODO: Implement proper makeRegular
    getEternalStore: () => store,
    validate: (obj: any) => ({ success: true }) // TODO: Implement validation
  };

  return options.freeze ? Object.freeze(publicAPI) : publicAPI;
}
