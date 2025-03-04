import React, { createContext, useContext, useState } from "react";
import { Store } from "./Store"; // Import your store class

// Create Context
const StoreContext = createContext<Store | null>(null);

// Provide Store Globally
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store] = useState(() => new Store()); // Create store once

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

// Hook to Access Store
export const useStore = (): Store => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return store;
};
