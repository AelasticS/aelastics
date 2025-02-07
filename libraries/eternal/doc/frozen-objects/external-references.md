
# 📌 Tracking External References in `@aelastics/eternal`

## **1️⃣ Understanding the Problem**

In `@aelastics/eternal`, objects are immutable and versioned, meaning that whenever an object is modified, a **new version** is created. However, in **cyclic structures**, there is no single parent-child relationship, making it difficult to propagate updates properly.

### **Why is this a problem?**
- **React uses reference equality (`!==`) to detect state changes.**
- If a **deeply nested object** changes, React won’t detect it unless a component directly holding that object receives a new reference.
- **Cyclic references prevent traditional parent-child update tracking**, so we need an explicit way to track which objects are held externally.

## **2️⃣ Solution: Selector-Based External Reference Tracking**

Instead of relying on a **parent-based update propagation** (like Immer.js), we **track objects that are referenced externally** and ensure they receive a new version when needed.

### **✔ Step 1: Track External References**
- A **WeakMap<object, boolean> (`externalRefs`)** is stored inside the `Store`.
- Whenever an object is **retrieved dynamically** (e.g., via `getObject()`), it is assumed **it might be used externally** and recorded in `externalRefs`.

### **✔ Step 2: Hook into Object Retrieval (`getObject()`)**
- Whenever a component or function **fetches an object**, it is **marked as externally referenced**.

### **✔ Step 3: Detect Changes Using the Change Log**
- **During `produce()`, all modified objects are logged in `changeLog`.**
- **Before finalizing `produce()`, we check which objects in `changeLog` belong to structures containing external references.**
- If an external reference is affected, **it is also updated to ensure React sees the change.**

## **3️⃣ 🚀 Why This Works**
✅ **Ensures React receives new references when necessary** (no unnecessary updates).  
✅ **Handles cyclic relationships properly** (without assuming a single parent).  
✅ **Works with React’s `useState` and `useSelector()`** seamlessly.  
✅ **Prevents subtle UI bugs where React fails to detect updates.**  

---

## **4️⃣ Using External Reference Tracking in React**

### **🔹 Correct Usage in React**
Since React depends on reference equality (`!==`) to detect changes, components must receive **new object references when needed**.

```tsx
const [user, setUser] = useState(store.getState().getObject("user-uuid", false));

const updateUser = () => {
    const newUser = store.produce((u) => {
        u.name = "New Name";
    }, user);

    setUser(newUser); // ✅ Ensures React gets the latest version
};
```

### **🚨 Common Mistake: Forgetting to Update React State**
```tsx
store.produce((u) => {
    u.name = "Updated";
}, user); // ❌ React won’t detect the change unless the reference is updated

// Fix:
setUser(store.getState().getObject(user.uuid, false));
```

---

## **5️⃣ Summary of Key Rules**
| Rule | Explanation |
|------|------------|
| **External references must be tracked** | Objects retrieved dynamically may be held in React state or other external locations. |
| **Changes propagate to referenced objects** | If a referenced object’s structure changes, React gets a new reference. |
| **React must receive updated objects** | `setState(newObject)` must be called after `produce()` to ensure re-renders. |

---

📖 **[Next: Implementing External Reference Tracking]()**
