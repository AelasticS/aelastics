import { createObservableMap, MapHandlers } from './observableMap';

const handlers: Required<MapHandlers<string, number>> = {
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
    }),
    entries: jest.fn((target: Map<string, number>): [boolean, IterableIterator<[string, number]>] => {
        return [true, target.entries()];
    }),
    keys: jest.fn((target: Map<string, number>): [boolean, IterableIterator<string>] => {
        return [true, target.keys()];
    }),
    values: jest.fn((target: Map<string, number>): [boolean, IterableIterator<number>] => {
        return [true, target.values()];
    }),
    size: jest.fn((target: Map<string, number>): [boolean, number] => {
        return [true, target.size];
    }),
    [Symbol.iterator]: jest.fn((target: Map<string, number>): IterableIterator<[string, number]> => {
        return target[Symbol.iterator]();
    }),
    toStringHandler: jest.fn((target: Map<string, number>): [boolean, string] => {
    return [true, target.toString()];
    }),
    
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

    it('should call the entries handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const proxy = createObservableMap(target, handlers, true);
        const iterator = proxy.entries();

        expect(handlers.entries).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(['a', 1]);
    });

    it('should call the keys handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const proxy = createObservableMap(target, handlers, true);
        const iterator = proxy.keys();

        expect(handlers.keys).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual('a');
    });

    it('should call the values handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const proxy = createObservableMap(target, handlers, true);
        const iterator = proxy.values();

        expect(handlers.values).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(1);
    });

    it('should call the size handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const proxy = createObservableMap(target, handlers, true);
        const size = proxy.size;

        expect(handlers.size).toHaveBeenCalledWith(target);
        expect(size).toBe(2);
    });

    it('should call the Symbol.iterator handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const proxy = createObservableMap(target, handlers, true);
        const iterator = proxy[Symbol.iterator]();

        expect(handlers[Symbol.iterator]).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(['a', 1]);
    });

    it('should call the toString handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const proxy = createObservableMap(target, handlers, true);
        const result = proxy.toString();

        expect(handlers.toStringHandler).toHaveBeenCalledWith(target);
        expect(result).toBe('[object Map]');
    });
});