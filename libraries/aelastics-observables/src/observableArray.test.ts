import { createObservableArray, ArrayHandlers } from './observableArray';

const handlers: Required<ArrayHandlers<number>> = {

    [Symbol.iterator]: jest.fn((target: number[]): IterableIterator<number> => {
        return target[Symbol.iterator]();
    }),
    getByIndex: jest.fn((target: number[], index: any, value: number): [boolean, number] => {
        return [true, value];
    }),
    setByIndex: jest.fn((target: number[], index: number, value: number): [boolean, number] => {
        return [true, value];
    }),
    delete: jest.fn((target: number[], index: number): [boolean, boolean] => {
        return [true, true];
    }),
    push: jest.fn((target: number[], ...items: number[]): [boolean, number?] => {
        return [true, items.length];
    }),
    pop: jest.fn((target: number[]): [boolean, number?] => {
        return [true, target[target.length - 1]];
    }),
    shift: jest.fn((target: number[]): [boolean, number?] => {
        return [true, target[0]];
    }),
    unshift: jest.fn((target: number[], ...items: number[]): [boolean, number?] => {
        return [true, items.length];
    }),
    splice: jest.fn((target: number[], start: number, deleteCount: number, ...items: number[]): [boolean, number[]?] => {
        return [true, items];
    }),
    reverse: jest.fn((target: number[]): [boolean, number[]?] => {
        return [false, target.reverse()];
    }),
    sort: jest.fn((target: number[]): [boolean, number[]?] => {
        return [true, target.sort()];
    }),
    fill: jest.fn((target: number[], value: number, start: number, end: number): [boolean, number[]?] => {
        return [true, target.fill(value, start, end)];
    }),
    length: jest.fn((target: number[], length: number): [boolean, number?] => {
        return [true, length];
    }),
    includes: jest.fn((target: number[], value: number): [boolean, boolean?] => {
        return [true, target.includes(value)];
    }),
    indexOf: jest.fn((target: number[], value: number, fromIndex: number): [boolean, number] => {
        return [true, target.indexOf(value, fromIndex)];
    }),
    lastIndexOf: jest.fn((target: number[], value: number, fromIndex: number): [boolean, number] => {
        return [true, target.lastIndexOf(value, fromIndex)];
    }),
    find: jest.fn((target: number[], callback: (value: number, index: number, array: number[]) => boolean, thisArg: any): [boolean, number?] => {
        return [true, target.find(callback, thisArg)];
    }),
    findIndex: jest.fn((target: number[], callback: (value: number, index: number, array: number[]) => boolean, thisArg: any): [boolean, number?] => {
        return [true, target.findIndex(callback, thisArg)];
    }),
    concat: jest.fn((target: number[], ...items: number[]): [boolean, number[]] => {
        return [true, target.concat(items)];
    }),
    slice: jest.fn((target: number[], start?: number, end?: number): [boolean, number[]] => {
        return [true, target.slice(start, end)];
    }),
    map: jest.fn((target: number[], callback: (value: number, index: number, array: number[]) => any, thisArg: any): [boolean, any[]?] => {
        return [true, target.map(callback, thisArg)];
    }),
    filter: jest.fn((target: number[], callback: (value: number, index: number, array: number[]) => boolean, thisArg: any): [boolean, number[]?] => {
        return [true, target.filter(callback, thisArg)];
    }),
    reduce: jest.fn((target: number[], callback: (accumulator: any, value: number, index: number, array: number[]) => any, initialValue: any): [boolean, any?] => {
        return [true, target.reduce(callback, initialValue)];
    }),
    reduceRight: jest.fn((target: number[], callback: (accumulator: any, value: number, index: number, array: number[]) => any, initialValue: any): [boolean, any?] => {
        return [true, target.reduceRight(callback, initialValue)];
    }),
    every: jest.fn((target: number[], callback: (value: number, index: number, array: number[]) => boolean, thisArg: any): [boolean, boolean?] => {
        return [true, target.every(callback, thisArg)];
    }),
    some: jest.fn((target: number[], callback: (value: number, index: number, array: number[]) => boolean, thisArg: any): [boolean, boolean?] => {
        return [true, target.some(callback, thisArg)];
    }),
    forEach: jest.fn((target: number[], callback: (value: number, index: number, array: number[]) => void, thisArg: any): [boolean, void?] => {
        return [true, target.forEach(callback, thisArg)];
    }),
    flatMap: jest.fn((target: number[], callback: (value: number, index: number, array: number[]) => any, thisArg: any): [boolean, any[]?] => {
        return [true, target.flatMap(callback, thisArg)];
    }),
    flat: jest.fn((target: number[], depth: number): [boolean, any[]?] => {
        return [true, target.flat(depth)];
    }),
    copyWithin: jest.fn((target: number[], targetIndex: number, start: number, end: number): [boolean, number[]?] => {
        return [false, target.copyWithin(targetIndex, start, end)];
    }),
    entries: jest.fn((target: number[]): [boolean, IterableIterator<[number, number]>?] => {
        return [true, target.entries()];
    }),
    keys: jest.fn((target: number[]): [boolean, IterableIterator<number>?] => {
        return [true, target.keys()];
    }),
    values: jest.fn((target: number[]): [boolean, IterableIterator<number>?] => {
        return [true, target.values()];
    }),
    join: jest.fn((target: number[], separator: string): [boolean, string?] => {
        return [true, target.join(separator)];
    }),
    toStringA: jest.fn((target: number[]): [boolean, string?] => {
        return [true, target.toString()];
    }),
    toLocaleStringA: jest.fn((target: number[]): [boolean, string?] => {
        return [true, target.toLocaleString()];
    }),
};

describe('createObservableArray', () => {
    it('should call the getByIndex handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const value = proxy[1];

        expect(handlers.getByIndex).toHaveBeenCalledWith(target, "1", proxy);
    });

    it('should call the setByIndex handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        proxy[1] = 99;

        expect(handlers.setByIndex).toHaveBeenCalledWith(target, "1", 99);
        expect(target[1]).toBe(99);
    });

    it('should call the delete handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        delete proxy[1];

        expect(handlers.delete).toHaveBeenCalledWith(target, "1");
        expect(target[1]).toBeUndefined();
    });

    it('should call the push handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        proxy.push(4, 5);

        expect(handlers.push).toHaveBeenCalledWith(target, 4, 5);
        expect(target).toEqual([1, 2, 3, 4, 5]);
    });

    it('should call the pop handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        proxy.pop();

        expect(handlers.pop).toHaveBeenCalledWith(target);
        expect(target).toEqual([1, 2]);
    });

    it('should call the shift handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        proxy.shift();

        expect(handlers.shift).toHaveBeenCalledWith(target);
        expect(target).toEqual([2, 3]);
    });

    it('should call the unshift handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        proxy.unshift(0);

        expect(handlers.unshift).toHaveBeenCalledWith(target, 0);
        expect(target).toEqual([0, 1, 2, 3]);
    });

    it('should call the splice handler', () => {
        const target = [1, 2, 3, 4];
        const proxy = createObservableArray(target, handlers, true);
        proxy.splice(1, 2, 99, 100);

        expect(handlers.splice).toHaveBeenCalledWith(target, 1, 2, 99, 100);
        expect(target).toEqual([1, 99, 100, 4]);
    });

    it('should call the reverse handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const res = proxy.reverse();

        expect(handlers.reverse).toHaveBeenCalledWith(target);
        expect(res).toEqual([3, 2, 1]);
    });

    it('should call the sort handler', () => {
        const target = [3, 1, 2];
        const proxy = createObservableArray(target, handlers, true);
        proxy.sort();

        expect(handlers.sort).toHaveBeenCalledWith(target);
        expect(target).toEqual([1, 2, 3]);
    });

    it('should call the fill handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        proxy.fill(0, 1, 3);

        expect(handlers.fill).toHaveBeenCalledWith(target, 0, 1, 3);
        expect(target).toEqual([1, 0, 0]);
    });

    it('should call the length handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const length = proxy.length;

        expect(handlers.length).toHaveBeenCalledWith(target, 3);
        expect(length).toBe(3);
    });

    it('should call the includes handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.includes(2);

        expect(handlers.includes).toHaveBeenCalledWith(target, 2);
        expect(result).toBe(true);
    });

    it('should call the indexOf handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.indexOf(2);

        expect(handlers.indexOf).toHaveBeenCalledWith(target, 2, 0);
        expect(result).toBe(1);
    });

    it('should call the lastIndexOf handler', () => {
        const target = [1, 2, 3, 2];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.lastIndexOf(2);

        expect(handlers.lastIndexOf).toHaveBeenCalledWith(target, 2, target.length - 1);
        expect(result).toBe(3);
    });

    it('should call the find handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.find(value => value === 2);

        expect(handlers.find).toHaveBeenCalledWith(target, expect.any(Function), undefined);
        expect(result).toBe(2);
    });

    it('should call the findIndex handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.findIndex(value => value === 2);

        expect(handlers.findIndex).toHaveBeenCalledWith(target, expect.any(Function), undefined);
        expect(result).toBe(1);
    });

    it('should call the concat handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.concat([4, 5]);

        expect(handlers.concat).toHaveBeenCalledWith(target, [4, 5]);
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should call the slice handler', () => {
        const target = [1, 2, 3, 4, 5];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.slice(1, 4);

        expect(handlers.slice).toHaveBeenCalledWith(target, 1, 4);
        expect(result).toEqual([2, 3, 4]);
    });

    it('should call the map handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.map(value => value * 2);

        expect(handlers.map).toHaveBeenCalledWith(target, expect.any(Function), undefined);
        expect(result).toEqual([2, 4, 6]);
    });

    it('should call the filter handler', () => {
        const target = [1, 2, 3, 4];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.filter(value => value % 2 === 0);

        expect(handlers.filter).toHaveBeenCalledWith(target, expect.any(Function), undefined);
        expect(result).toEqual([2, 4]);
    });

    it('should call the reduce handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.reduce((acc, value) => acc + value, 0);

        expect(handlers.reduce).toHaveBeenCalledWith(target, expect.any(Function), 0);
        expect(result).toBe(6);
    });

    it('should call the reduceRight handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.reduceRight((acc, value) => acc + value, 0);

        expect(handlers.reduceRight).toHaveBeenCalledWith(target, expect.any(Function), 0);
        expect(result).toBe(6);
    });

    it('should call the every handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.every(value => value > 0);

        expect(handlers.every).toHaveBeenCalledWith(target, expect.any(Function), undefined);
        expect(result).toBe(true);
    });

    it('should call the some handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.some(value => value > 2);

        expect(handlers.some).toHaveBeenCalledWith(target, expect.any(Function), undefined);
        expect(result).toBe(true);
    });

    it('should call the forEach handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        proxy.forEach(value => value * 2);

        expect(handlers.forEach).toHaveBeenCalledWith(target, expect.any(Function), undefined);
    });

    it('should call the flatMap handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.flatMap(value => [value, value]);

        expect(handlers.flatMap).toHaveBeenCalledWith(target, expect.any(Function), undefined);
        expect(result).toEqual([1, 1, 2, 2, 3, 3]);
    });

    it('should call the flat handler', () => {
        const target = [1, [2, [3]]] as number[]; // to avoid syntax error
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.flat(1);

        expect(handlers.flat).toHaveBeenCalledWith(target, 1);
        expect(result).toEqual([1, 2, [3]]);
    });

    it('should call the copyWithin handler', () => {
        const target = [1, 2, 3, 4, 5];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.copyWithin(2, 0, 3);

        expect(handlers.copyWithin).toHaveBeenCalledWith(target, 2, 0, 3);
        expect(result).toEqual([1, 2, 1, 2, 3]);
    });

    it('should call the entries handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.entries();

        expect(handlers.entries).toHaveBeenCalledWith(target);
        expect(result.next().value).toEqual([0, 1]);
    });

    it('should call the keys handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.keys();

        expect(handlers.keys).toHaveBeenCalledWith(target);
        expect(result.next().value).toEqual(0);
    });

    it('should call the values handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.values();

        expect(handlers.values).toHaveBeenCalledWith(target);
        expect(result.next().value).toEqual(1);
    });

    it('should call the join handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.join('-');

        expect(handlers.join).toHaveBeenCalledWith(target, '-');
        expect(result).toBe('1-2-3');
    });

    it('should call the toStringA handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.toString();

        expect(handlers.toStringA).toHaveBeenCalledWith(target);
        expect(result).toBe('1,2,3');
    });

    it('should call the toLocaleStringA handler', () => {
        const target = [1, 2, 3];
        const proxy = createObservableArray(target, handlers, true);
        const result = proxy.toLocaleString();

        expect(handlers.toLocaleStringA).toHaveBeenCalledWith(target);
        expect(result).toBe('1,2,3');
    });

    it('should call the Symbol.iterator handler', () => {
        const target = [1, 2, 3];
        const handlers: ArrayHandlers<number> = {
            [Symbol.iterator]: jest.fn((target: number[]): IterableIterator<number> => {
                return target[Symbol.iterator]();
            })
        };
        const proxy = createObservableArray(target, handlers, true);
        const iterator = proxy[Symbol.iterator]();

        expect(handlers[Symbol.iterator]).toHaveBeenCalledWith(target);
        expect(iterator.next().value).toEqual(1);
    });
});