import { Store } from "@aelastics/eternal";
import React, { createContext, useContext, ReactNode } from "react";
import { createObjectSelector } from "./useObjectSelector"; // Import object-based selector

// ✅ Define the shape of the context
interface ObjectStoreContext<T> {
  store: Store;
  object: T;
}

// ✅ Function to create an object store provider
export const createObjectStoreProvider = <T extends { uuid: string }>(
  storeInstance: Store,
  concreteObject: T
) => {
  const StoreContext = createContext<ObjectStoreContext<T> | null>(null); // ✅ Provide a typed context

  const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
      <StoreContext.Provider value={{ store: storeInstance, object: concreteObject }}>
        {children}
      </StoreContext.Provider>
    );
  };

  const useStore = (): Store => {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error("useStore must be used within StoreProvider");
    }
    return context.store;
  };

  const useObject = (): T => {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error("useObject must be used within StoreProvider");
    }
    return context.object;
  };

  // ✅ Create object selector hook for this store
  const useObjectSelector = <R,>(selector: (object: T) => R): R => {
    return createObjectSelector(useStore)(selector, useObject());
  };

  return { StoreProvider, useStore, useObject, useObjectSelector };
};



// import { Store } from "@aelastics/eternal";
// import React, { createContext, useContext, ReactNode } from "react";
// import { createObjectSelector } from "./useObjectSelector"; // Import object-based selector

// export const createObjectStoreProvider = <T extends { uuid: string }>(
//   storeInstance: Store,
//   concreteObject: T
// ) => {
//   const StoreContext = createContext<{ store: Store; object: T } | null>(null);

//   const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//     return (
//       <StoreContext.Provider value={{ store: storeInstance, object: concreteObject }}>
//         {children}
//       </StoreContext.Provider>
//     );
//   };

//   const useStore = (): Store => {
//     const context = useContext(StoreContext);
//     if (!context) {
//       throw new Error("useStore must be used within StoreProvider");
//     }
//     return context.store;
//   };

//   const useObject = (): T => {
//     const context = useContext(StoreContext);
//     if (!context) {
//       throw new Error("useObject must be used within StoreProvider");
//     }
//     return context.object;
//   };

//   // ✅ Create object selector hook for this store
//   const useObjectSelector = <R,>(selector: (object: T) => R): R => {
//     return createObjectSelector(useStore)(selector, concreteObject);
//   };

//   return { StoreProvider, useStore, useObject, useObjectSelector };
// };
