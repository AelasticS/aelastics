// import { useSyncExternalStore } from "react";
// import { Store } from "@aelastics/eternal";

// export function useEternalSelector<T>(store: Store, selector: (state: Store) => T): T {
//     return useSyncExternalStore(
//         store.subscribe,  // Subscribe to store updates
//         () => selector(store), // Get the selected state
//     );
// }
