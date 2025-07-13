import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect"; // Ensure toBeInTheDocument() is available
import { Store } from "@aelastics/eternal";
import { createObjectStoreProvider } from "./createObjectProvider";

jest.mock("@aelastics/eternal", () => {
  return {
    Store: jest.fn().mockImplementation(() => ({
      objectManager: {
        findByUUID: jest.fn((uuid) => {
          if (uuid === "user-123") {
            return { uuid: "user-123", name: "Alice" };
          }
          return { uuid, name: `Mocked Object for ${uuid}` };
        }),
      },
      subscriptionManager: {
        subscribeToStore: jest.fn(() => jest.fn()), // Returns unsubscribe function
        subscribeToObject: jest.fn(() => jest.fn()), // Returns unsubscribe function
      },
      getState: jest.fn(() => ({
        users: { "user-123": { uuid: "user-123", name: "Alice" } },
      })),
    })),
  };
});


describe("ObjectStoreProvider and useObjectSelector", () => {
  it("provides the store and object via context", () => {
    const mockStore = new (jest.requireMock("@aelastics/eternal").Store)();
    const mockObject = { uuid: "user-123", name: "Alice" };
    const { StoreProvider, useObject, useObjectSelector } = createObjectStoreProvider(mockStore, mockObject);

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

    expect(screen.getByText("Object is available")).not.toBeNull() //toBeInTheDocument();
  });

  it("correctly selects object data using useObjectSelector", () => {
    const mockStore = new (jest.requireMock("@aelastics/eternal").Store)();
    const mockObject = { uuid: "user-123", name: "Alice" };
    const { StoreProvider, useObjectSelector } = createObjectStoreProvider(mockStore, mockObject);

    const TestComponent = () => {
      const userName = useObjectSelector((obj) => obj.name);
      expect(userName).toBe("Alice");
      return <div>User Name: {userName}</div>;
    };

    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );

    expect(screen.getByText("User Name: Alice")).not.toBeNull() //toBeInTheDocument();
  });
});
