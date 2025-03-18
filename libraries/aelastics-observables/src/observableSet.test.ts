import { createObservableSet, SetHandlers } from './observableSet';

describe('createObservableSet', () => {
    it('should call the add handler', () => {
        const target = new Set<number>();
        const handlers: SetHandlers<number> = {
            add: jest.fn((set, value) => [false, set.add(value)]),
        };

        const proxy = createObservableSet(target, handlers, true);
        proxy.add(100);

        expect(handlers.add).toHaveBeenCalledWith(target, 100);
        expect(target.has(100)).toBe(true);
    });

    it('should call the delete handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            delete: jest.fn((set, value) => [false, set.delete(value)]),
        };

        const proxy = createObservableSet(target, handlers, true);
        proxy.delete(2);

        expect(handlers.delete).toHaveBeenCalledWith(target, 2);
        expect(target.has(2)).toBe(false);
    });

    it('should call the clear handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            clear: jest.fn((set) => {
                set.clear();
                return [false, undefined];
            }),
        };

        const proxy = createObservableSet(target, handlers, true);
        proxy.clear();

        expect(handlers.clear).toHaveBeenCalledWith(target);
        expect(target.size).toBe(0);
    });

    it('should call the has handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            has: jest.fn((set, value) => [false, set.has(value)]),
        };

        const proxy = createObservableSet(target, handlers, true);
        const result = proxy.has(1);

        expect(handlers.has).toHaveBeenCalledWith(target, 1);
        expect(result).toBe(true);
    });

    it('should call the forEach handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            forEach: jest.fn((set, callback) => [false, set.forEach(callback)]),
        };

        const proxy = createObservableSet(target, handlers, true);
        proxy.forEach((value) => {});

        expect(handlers.forEach).toHaveBeenCalledWith(target, expect.any(Function));
    });

    it('should call the entries handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            entries: jest.fn((set) => [false, set.entries()]),
        };

        const proxy = createObservableSet(target, handlers, true);
        const iterator = proxy.entries();

        expect(handlers.entries).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual([1, 1]);
    });

    it('should call the keys handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            keys: jest.fn((set) => [false, set.keys()]),
        };

        const proxy = createObservableSet(target, handlers, true);
        const iterator = proxy.keys();

        expect(handlers.keys).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(1);
    });

    it('should call the values handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            values: jest.fn((set) => [false, set.values()]),
        };

        const proxy = createObservableSet(target, handlers, true);
        const iterator = proxy.values();

        expect(handlers.values).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(1);
    });

    it('should call the size handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            size: jest.fn((set) => [false, set.size]),
        };

        const proxy = createObservableSet(target, handlers, true);
        const size = proxy.size;

        expect(handlers.size).toHaveBeenCalledWith(target);
        expect(size).toBe(3);
    });

    it('should call the Symbol.iterator handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            [Symbol.iterator]: jest.fn((set) => [false, set[Symbol.iterator]()]),
        };

        const proxy = createObservableSet(target, handlers, true);
        const iterator = proxy[Symbol.iterator]();

        expect(handlers[Symbol.iterator]).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(1);
    });

    it('should call the toString handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const handlers: SetHandlers<number> = {
            [Symbol.toStringTag]: jest.fn((set) => [false, set.toString()]),
        };

        const proxy = createObservableSet(target, handlers, true);
        const result = proxy.toString();

        expect(handlers.toString).toHaveBeenCalledWith(target);
        expect(result).toBe('[object Set]');
    });
});