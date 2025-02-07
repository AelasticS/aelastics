# ⚛️ React Integration

## ✅ Best Practice: Always Update React State After `produce()`

```tsx
const [user, setUser] = useState(store.getState().getObject("user-uuid", false));

const updateUser = () => {
    const newUser = store.produce((u) => {
        u.name = "New Name";
    }, user);

    setUser(newUser); // ✅ Ensures React gets the latest version
};
```
