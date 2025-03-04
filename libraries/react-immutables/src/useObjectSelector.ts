const useObjectSelector = <T,>(
    selector: (object: any) => T, // No need for store access here
    objectOrUuid: any
  ): T => {
    const store = useStore();
    const prevSelectedValue = useRef<T | undefined>(undefined);
  
    return useSyncExternalStore(
      store.subscribe,
      () => {
        // 🔹 Automatically resolve the latest version of the object
        const object = typeof objectOrUuid === "string"
          ? store.getObject(objectOrUuid) // If UUID, fetch latest object
          : store.getObject(objectOrUuid.uuid); // If object, fetch latest version
  
        const newSelectedValue = selector(object);
  
        // Prevent unnecessary re-renders
        if (prevSelectedValue.current !== undefined && Object.is(prevSelectedValue.current, newSelectedValue)) {
          return prevSelectedValue.current;
        }
  
        prevSelectedValue.current = newSelectedValue;
        return newSelectedValue;
      },
      () => selector(store.getObject(objectOrUuid.uuid)) // SSR hydration
    );
  };
  
  // usage
  const userUuid = "1234";
  const user = {}
  const userName1 = useObjectSelector((user) => user.name, userUuid);
  const userName2 = useObjectSelector((user) => user.name, user);
