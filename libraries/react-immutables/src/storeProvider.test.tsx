import React from "react";
import { render, screen } from "@testing-library/react";
import { Store } from "@aelastics/eternal";
import { createStoreProvider } from "./createStoreProvider";
import { createObjectStoreProvider } from "./createObjectProvider";

jest.mock("@aelastics/eternal", () => {
  return {
    Store: jest.fn().mockImplementation(() => ({
      subscribeToStore: jest.fn(),
      unsubscribeFromStore: jest.fn(),
      subscribeToObj: jest.fn(),
      unsubscribeFromObj: jest.fn(),
      getState: jest.fn(() => ({
        users: { "user-123": { uuid: "user-123", name: "Alice" } },
      })),
      getObject: jest.fn((uuid) => ({ uuid, name: `Mocked Object for ${uuid}` })), // ✅ Ensure `getObject()` exists
    })),
  };
});


describe("StoreProvider and useStoreSelector", () => {
  it("provides the store instance via context", () => {
    const mockStore = {} as Store
    const { StoreProvider, useStore } = createStoreProvider(mockStore);
    
    const TestComponent = () => {
      const store = useStore();
      expect(store).toBe(mockStore);
      return <div>Store is available</div>;
    };
    
    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );
    
    expect(screen.getByText("Store is available")).not.toBeNull()//toBeInTheDocument();
  });
});

describe("ObjectStoreProvider and useObjectSelector", () => {
  it("provides the store and object via context", () => {
    const mockStore = {} as Store;
    const mockObject = { uuid: "user-123", name: "Alice" };
    const { StoreProvider, useObject } = createObjectStoreProvider(mockStore, mockObject);
    
    const TestComponent = () => {
      const object = useObject();
      expect(object).toEqual(mockObject);
      return <div>Object is available</div>;
    };
    
    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );
    
    expect(screen.getByText("Object is available")).not.toBeNull()//toBeInTheDocument();
  });
});
