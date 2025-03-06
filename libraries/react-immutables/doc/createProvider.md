# React Store Provider Documentation

## Overview
This package provides a flexible way to integrate **multiple independent stores** into a React application.

## Features
✅ **Supports multiple independent stores** (e.g., UserStore, ProductStore)  
✅ **Optimized re-renders** with `useSyncExternalStore`  
✅ **No need to manually pass `useStore`** in components  
✅ **API similar to Redux for easy adoption**

---

## 1️⃣ Creating Store Providers
Each store has its own provider, context, and selector.

### **`createStoreProvider.ts`**
```tsx
import React, { createContext, useContext, ReactNode } from "react";
import { Store } from "@your-org/store"; // Import your Store class
import { useStoreSelector as baseUseStoreSelector } from "./useStoreSelector"; // Import base selector

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

  // ✅ Store selector hook for this specific store
  const useStoreSelector = <T,>(selector: (state: any) => T): T => {
    return baseUseStoreSelector(useStore, selector);
  };

  return { StoreProvider, useStore, useStoreSelector };
};
```

---

## 2️⃣ Creating Multiple Stores
Each store is initialized independently.

```tsx
// ✅ Create independent stores
const userStore = new Store({
  users: {
    "user-123": { uuid: "user-123", name: "Alice" },
  },
});

const productStore = new Store({
  products: {
    "prod-001": { uuid: "prod-001", name: "Laptop" },
  },
});

// ✅ Create separate store providers
export const { StoreProvider: UserStoreProvider, useStoreSelector: useUserStoreSelector } =
  createStoreProvider(userStore);

export const { StoreProvider: ProductStoreProvider, useStoreSelector: useProductStoreSelector } =
  createStoreProvider(productStore);
```

---

## 3️⃣ Using Store Selectors in Components
### ✅ **Selecting User Data**
```tsx
const UserComponent = ({ userId }: { userId: string }) => {
  const userName = useUserStoreSelector((state) => state.users[userId]?.name || "Unknown");
  return <div>User: {userName}</div>;
};
```

### ✅ **Selecting Product Data**
```tsx
const ProductComponent = ({ productId }: { productId: string }) => {
  const productName = useProductStoreSelector((state) => state.products[productId]?.name || "Unknown");
  return <div>Product: {productName}</div>;
};
```

---

## 4️⃣ Wrapping Components in Store Providers
Each component is wrapped inside the **correct store provider**.

```tsx
<UserStoreProvider>
  <ProductStoreProvider>
    <UserComponent userId="user-123" />
    <ProductComponent productId="prod-001" />
  </ProductStoreProvider>
</UserStoreProvider>
```

---

## 🔹 Summary
| Feature | How It Works |
|---------|-------------|
| **Multiple Stores** | ✅ Each store has its own provider (`UserStoreProvider`, `ProductStoreProvider`). |
| **No Manual `useStore` Passing** | ✅ Components use `useUserStoreSelector()`, `useProductStoreSelector()` directly. |
| **Prevents Unnecessary Re-renders** | ✅ Uses `useSyncExternalStore` for optimized updates. |

---

## 🚀 Next Steps
1. **Run tests to verify selectors work correctly**
2. **Optimize store updates for large datasets**
3. **Integrate debugging tools to track store changes**