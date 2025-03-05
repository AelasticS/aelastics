import { useSyncExternalStore, useRef } from "react";
import { useStore } from "./useStore"; // Import useStore

export const useStoreSelector = <T,>(selector: () => T): T => {
  const store = useStore(); // 🔹 Automatically get the store
  const prevSelectedValue = useRef<T | undefined>(undefined);

  return useSyncExternalStore(
    store.subscribe,
    () => {
      const newSelectedValue = selector(); // 🔹 No need for state argument

      // Prevent unnecessary re-renders
      if (prevSelectedValue.current !== undefined && Object.is(prevSelectedValue.current, newSelectedValue)) {
        return prevSelectedValue.current;
      }

      prevSelectedValue.current = newSelectedValue;
      return newSelectedValue;
    },
    () => selector() // 🔹 SSR hydration
  );
};

