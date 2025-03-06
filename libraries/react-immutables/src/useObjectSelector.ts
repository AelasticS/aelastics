import { Store } from "@aelastics/eternal";
import { useSyncExternalStore, useRef } from "react";

export const createObjectSelector = (useStore: () => Store) => {
  return <T,>(selector: (object: any) => T, objectOrUuid: any): T => {
    const store = useStore();
    const prevSelectedValue = useRef<T | undefined>(undefined);

    return useSyncExternalStore(
      (onObjectChange) => {
        const obj =
          typeof objectOrUuid === "string"
            ? store.getObject(objectOrUuid)
            : store.getObject(objectOrUuid.uuid);

        if (!obj) {
          console.warn("useObjectSelector: Object not found in store.");
          return () => {}; // Return a no-op function if object is missing
        }

        store.subscribeToObject(obj, onObjectChange); // ✅ Subscribe to object changes
        return () => store.unsubscribeFromObject(obj, onObjectChange); // ✅ Unsubscribe on cleanup
      },
      () => {
        const obj =
          typeof objectOrUuid === "string"
            ? store.getObject(objectOrUuid)
            : store.getObject(objectOrUuid.uuid);

        if (!obj) {
          return prevSelectedValue.current || ({} as T); // Return previous or empty state
        }

        const newSelectedValue = selector(obj);

        if (prevSelectedValue.current !== undefined && Object.is(prevSelectedValue.current, newSelectedValue)) {
          return prevSelectedValue.current;
        }

        prevSelectedValue.current = newSelectedValue;
        return newSelectedValue;
      },
      () => selector(store.getObject(objectOrUuid.uuid) || {}) // ✅ SSR hydration
    );
  };
};

