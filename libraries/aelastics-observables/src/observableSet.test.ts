import { createObservableSet, SetHandlers } from './observableSet';

const handlers: Required<SetHandlers<number>> = {
    add: jest.fn((target: Set<number>, value: number): [boolean, any] => {
        return [true, target];
    }),
    delete: jest.fn((target: Set<number>, value: number): [boolean, boolean] => {
        return [true, true];
    }),
    clear: jest.fn((target: Set<number>): [boolean, undefined] => {
        return [true, undefined];
    }),
    has: jest.fn((target: Set<number>, value: number): [boolean, boolean] => {
        return [true, target.has(value)];
    }),
    forEach: jest.fn((target: Set<number>, callback: (value: number, value2: number, set: Set<number>) => void): [boolean, any] => {
        target.forEach(callback);
        return [true, undefined];
    }),
    entries: jest.fn((target: Set<number>): [boolean, IterableIterator<[number, number]>] => {
        return [true, target.entries()];
    }),
    keys: jest.fn((target: Set<number>): [boolean, IterableIterator<number>] => {
        return [true, target.keys()];
    }),
    values: jest.fn((target: Set<number>): [boolean, IterableIterator<number>] => {
        return [true, target.values()];
    }),
    size: jest.fn((target: Set<number>): [boolean, number] => {
        return [true, target.size];
    }),
    toStringHandler: jest.fn((target: Set<number>): [boolean, string] => {
        return [true, target.toString()];
    }),

    [Symbol.iterator]: jest.fn((target: Set<number>): IterableIterator<number> => {
        return target[Symbol.iterator]();
    }),

};

describe('createObservableSet', () => {
    it('should call the add handler', () => {
        const target = new Set<number>();
        const proxy = createObservableSet(target, handlers, true);
        proxy.add(100);

        expect(handlers.add).toHaveBeenCalledWith(target, 100);
        expect(target.has(100)).toBe(true);
    });

    it('should call the delete handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        proxy.delete(2);

        expect(handlers.delete).toHaveBeenCalledWith(target, 2);
        expect(target.has(2)).toBe(false);
    });

    it('should call the clear handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        proxy.clear();

        expect(handlers.clear).toHaveBeenCalledWith(target);
        expect(target.size).toBe(0);
    });

    it('should call the has handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        const result = proxy.has(1);

        expect(handlers.has).toHaveBeenCalledWith(target, 1);
        expect(result).toBe(true);
    });

    it('should call the forEach handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        proxy.forEach((value) => {});

        expect(handlers.forEach).toHaveBeenCalledWith(target, expect.any(Function));
    });

    it('should call the entries handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        const iterator = proxy.entries();

        expect(handlers.entries).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual([1, 1]);
    });

    it('should call the keys handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        const iterator = proxy.keys();

        expect(handlers.keys).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(1);
    });

    it('should call the values handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        const iterator = proxy.values();

        expect(handlers.values).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(1);
    });

    it('should call the size handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        const size = proxy.size;

        expect(handlers.size).toHaveBeenCalledWith(target);
        expect(size).toBe(3);
    });

    it('should call the Symbol.iterator handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        const iterator = proxy[Symbol.iterator]();

        expect(handlers[Symbol.iterator]).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(1);
    });

    it('should call the toString handler', () => {
        const target = new Set<number>([1, 2, 3]);
        const proxy = createObservableSet(target, handlers, true);
        const result = proxy.toString();

        expect(handlers.toStringHandler).toHaveBeenCalledWith(target);
        expect(result).toBe('[object Set]');
    });
});