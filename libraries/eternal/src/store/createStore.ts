import { StoreClass } from "./StoreClass";
import { IStore } from "../interfaces/IStore";
import { ObjectsAdapter, HistoryAdapter, DataAdapter, EventsAdapter, RegistryAdapterForStore } from "./InterfaceAdapters";
import { RegistryService } from "../registry/RegistryService";


export function createStore(
  registryService: RegistryService,
  initialState: any = {},
  options: {
    freeze?: boolean;
    fetchFromExternalSource?: (type: string, uuid: string) => any;
  } = { freeze: true }
): IStore {
  if (!registryService) {
    throw new Error("registry service is required to create a store");
  }
  
  const store = new StoreClass(registryService);

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
