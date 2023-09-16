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

import { createObservableMap } from './observableMap';

describe('createObservableMap', () => {
    it('set: should add key-value pair if handler returns true and be called with correct arguments', () => {
        const mockSetHandler = jest.fn((target, key, value) => true);
        const map = createObservableMap<string, number>(new Map(), { set: mockSetHandler });

        map.set('one', 1);

        expect(map.get('one')).toBe(1);
        expect(mockSetHandler).toHaveBeenCalledWith(expect.any(Map), 'one', 1);
    });

    it('delete: should delete key-value pair if handler returns true and be called with correct arguments', () => {
        const mockDeleteHandler = jest.fn((target, key) => true);
        const map = createObservableMap<string, number>(new Map([['one', 1]]), { delete: mockDeleteHandler });

        map.delete('one');

        expect(map.get('one')).toBeUndefined();
        expect(map.size).toBe(0);
        expect(mockDeleteHandler).toHaveBeenCalledWith(expect.any(Map), 'one');
    });

    it('clear: should clear the map if handler returns true and be called with correct arguments', () => {
        const mockClearHandler = jest.fn((target) => true);
        const map = createObservableMap<string, number>(new Map([['one', 1], ['two', 2]]), { clear: mockClearHandler });

        map.clear();

        expect(map.size).toBe(0);
        expect(mockClearHandler).toHaveBeenCalledWith(expect.any(Map));
    });

    it('defaultAction: should be called when accessing an unknown property', () => {
        const mockDefaultActionHandler = jest.fn((target, key) => true);
        const map = createObservableMap<string, number>(new Map([['one', 1]]), { defaultAction: mockDefaultActionHandler });

        const value = map.size;

        expect(mockDefaultActionHandler).toHaveBeenCalledWith(expect.any(Map), 'size');
        expect(value).toBe(1)
    });
});
