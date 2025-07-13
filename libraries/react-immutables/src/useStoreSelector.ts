import { Store } from "@aelastics/eternal";
import { useSyncExternalStore, useRef } from "react";

export const createStoreSelector = (useStore: () => Store) => {
  return <T>(selector: (store: Store) => T): T => {
    const store = useStore();
    const prevSelectedValue = useRef<T | undefined>(undefined);

    return useSyncExternalStore(
      (onStoreChange) => {
        const unsubscribe = store.subscriptionManager.subscribeToStore(onStoreChange); // ✅ Subscribe to store changes
        return unsubscribe; // ✅ Return an unsubscribe function
      },
      () => {
        const newSelectedValue = selector(store);
        if (prevSelectedValue.current !== undefined && Object.is(prevSelectedValue.current, newSelectedValue)) {
          return prevSelectedValue.current;
        }
        prevSelectedValue.current = newSelectedValue;
        return newSelectedValue;
      },
      () => selector(store) // ✅ SSR hydration
    );
  };
};
