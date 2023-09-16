/*
 * Project: aelastics-store
 * Created Date: Tuesday September 12th 2023
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */

import { createObservableObject } from './observableObject';

describe('createObservableObject', () => {
    it('set: should modify property if handler returns true and be called with correct arguments', () => {
        const mockSetHandler = jest.fn((target, key, value) => true);
        const obj = createObservableObject({ prop: 1 }, { set: mockSetHandler });

        obj.prop = 2;

        expect(obj.prop).toBe(2);
        expect(mockSetHandler).toHaveBeenCalledWith({ prop: 2 }, 'prop', 2);
    });

    it('set: should not modify property if handler returns false', () => {
        const mockSetHandler = jest.fn((target, key, value) => false);
        const obj = createObservableObject({ prop: 1 }, { set: mockSetHandler });

        obj.prop = 2;

        expect(obj.prop).toBe(1); // Property should remain unchanged
    });

    it('delete: should delete property if handler returns true and be called with correct arguments', () => {
        const mockDeleteHandler = jest.fn((target, key) => true);
        const orgObj:{prop?:number} = { prop: 1 }
        const obj = createObservableObject(orgObj, { delete: mockDeleteHandler });

        delete obj.prop;

        expect(obj.prop).toBeUndefined();
        expect(mockDeleteHandler).toHaveBeenCalledWith({ }, 'prop'); 
    });

    it('method: should call method if handler returns true and be called with correct arguments', () => {
        const mockMethodHandler = jest.fn((target, key, args) => true);
        const obj = createObservableObject({ greet: (name: string) => `Hello, ${name}!` }, { method: mockMethodHandler });

        const greeting = obj.greet("Alice");

        expect(greeting).toBe("Hello, Alice!");
        expect(mockMethodHandler).toHaveBeenCalledWith({ greet: expect.any(Function) }, 'greet', ['Alice']);
    });

    it('defaultAction: should be called when accessing a property or method', () => {
        const mockDefaultActionHandler = jest.fn((target, key) => true);
        const obj = createObservableObject({ prop: 1, greet: (name: string) => `Hello, ${name}!` }, { defaultAction: mockDefaultActionHandler });

        obj.greet("Bob");
        const propValue = obj.prop;

        expect(mockDefaultActionHandler).toHaveBeenNthCalledWith(1, { prop: 1, greet: expect.any(Function) }, 'greet');
        expect(mockDefaultActionHandler).toHaveBeenNthCalledWith(2, { prop: 1, greet: expect.any(Function) }, 'prop');
    });
});
