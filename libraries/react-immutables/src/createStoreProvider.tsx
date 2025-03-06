import { Store } from "@aelastics/eternal"; 
import React, { createContext, useContext, ReactNode } from "react";
import { createStoreSelector } from "./useStoreSelector"; // Import base selector

export const createStoreProvider = (storeInstance: Store) => {
  const StoreContext = createContext<Store | null>(null);

  const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <StoreContext.Provider value={storeInstance}>{children}</StoreContext.Provider>;
  };

  const useStore = (): Store => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error("useStore must be used within StoreProvider");
    }
    return store;
  };

  // Store selector hook for this specific store
  const useStoreSelector = <T,>(selector: (store: Store) => T): T => {
    return createStoreSelector(() => storeInstance)(selector);
  };

  return { StoreProvider, useStore, useStoreSelector };
};
