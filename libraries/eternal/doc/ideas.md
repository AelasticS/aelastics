
Ok, now I would like to discuss how to implement createObject in store using dynamic class. Do not generate any code yet, I just want to discuss. Do you have access to chat session about immutable object based on the first idea, when we used getters and setter to enable bidirecinal associations?OK, no


Next Step: Would You Like to Optimize Memory Usage by Clearing Old States Automatically?
Next Step: I Would You Like to Compare useStoreSelector(),  useSyncExternalStore() and useMemo() to Improve React Rendering Performance. And recomned when to use what

Implement undo/redo functionality?
Optimize React re-rendering using useMemo() and useSelectorStore()?
Discuss how this integrates with Redux or other state management tools?


Two Categories of Objects:

Dynamically Determined View (Default Mode) → No view property, always uses the latest state.
Fixed View Objects → Created via .fromView(viewIndex), where the view is locked to a specific StateView.
Getters Dynamically Resolve Data Based on Object Type:

For dynamically viewed objects → The latest StateView is used.
For fixed view objects → Data is fetched from the specified StateView.
Fixed View Objects Propagate Down the Hierarchy:

When a fixed view object accesses another object (e.g., parent.children), it ensures all child objects also get the same fixed view.
This prevents inconsistencies when traversing the object structure.
Fixed View Objects Are Ephemeral:

They are NOT stored in the state’s object hash map to avoid confusion.
They are created on demand and exist only as temporary "snapshots".
Setters Are Restricted:

Fixed view objects cannot be modified (set operations will throw errors).
Fixed view objects cannot be used as values for updates, preventing state inconsistencies.