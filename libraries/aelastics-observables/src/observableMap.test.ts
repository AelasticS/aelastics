import { createObservableMap, MapHandlers } from './observableMap';

const handlers: MapHandlers<string, number> = {
    set: jest.fn((target: Map<string, number>, key: string, value: number): [boolean, any] => {
        return [true, undefined];
    }),
    delete: jest.fn((target: Map<string, number>, key: string): [boolean, boolean] => {
        return [true, true];
    }),
    clear: jest.fn((target: Map<string, number>): [boolean, undefined] => {
        return [true, undefined];
    }),
    get: jest.fn((target: Map<string, number>, key: string): [boolean, number] => {
        return [true, target.get(key) ?? 0];
    }),
    has: jest.fn((target: Map<string, number>, key: string): [boolean, boolean] => {
        return [true, target.has(key)];
    }),
    forEach: jest.fn((target: Map<string, number>, callback: (value: number, key: string, map: Map<string, number>) => void): [boolean, any] => {
        target.forEach(callback);
        return [true, undefined];
    })
};

describe('createObservableMap', () => {
    it('should call the set handler', () => {
        const target = new Map<string, number>();
        const proxy = createObservableMap(target, handlers, true);
        proxy.set('a', 100);

        expect(handlers.set).toHaveBeenCalledWith(target, 'a', 100);
        expect(target.get('a')).toBe(100);
    });

    it('should call the delete handler', () => {
        const target = new Map<string, number>([['a', 1]]);
        const proxy = createObservableMap(target, handlers, true);
        proxy.delete('a');

        expect(handlers.delete).toHaveBeenCalledWith(target, 'a');
        expect(target.has('a')).toBe(false);
    });

    it('should call the clear handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const proxy = createObservableMap(target, handlers, true);
        proxy.clear();

        expect(handlers.clear).toHaveBeenCalledWith(target);
        expect(target.size).toBe(0);
    });

    it('should call the get handler', () => {
        const target = new Map<string, number>([['a', 1]]);
        const proxy = createObservableMap(target, handlers, true);
        const value = proxy.get('a');

        expect(handlers.get).toHaveBeenCalledWith(target, 'a');
        expect(value).toBe(1);
    });

    it('should call the has handler', () => {
        const target = new Map<string, number>([['a', 1]]);
        const proxy = createObservableMap(target, handlers, true);
        const result = proxy.has('a');

        expect(handlers.has).toHaveBeenCalledWith(target, 'a');
        expect(result).toBe(true);
    });

    it('should call the forEach handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const proxy = createObservableMap(target, handlers, true);
        proxy.forEach((value, key) => {});

        expect(handlers.forEach).toHaveBeenCalledWith(target, expect.any(Function));
    });
});