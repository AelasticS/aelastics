import { createObservableArray, ArrayHandlers } from './observableArray';

describe('createObservableArray', () => {
    it('should call the set handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            set: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy[1] = 99;

        expect(handlers.set).toHaveBeenCalledWith(target, 1, 99, extra);
        expect(target[1]).toBe(99);
    });

    it('should call the delete handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            delete: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        delete proxy[1];

        expect(handlers.delete).toHaveBeenCalledWith(target, 1, extra);
        expect(target[1]).toBeUndefined();
    });

    it('should call the push handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            push: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy.push(4, 5);

        expect(handlers.push).toHaveBeenCalledWith(target, [4, 5], extra);
        expect(target).toEqual([1, 2, 3, 4, 5]);
    });

    it('should call the pop handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            pop: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy.pop();

        expect(handlers.pop).toHaveBeenCalledWith(target, extra);
        expect(target).toEqual([1, 2]);
    });

    it('should call the shift handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            shift: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy.shift();

        expect(handlers.shift).toHaveBeenCalledWith(target, extra);
        expect(target).toEqual([2, 3]);
    });

    it('should call the unshift handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            unshift: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy.unshift(0);

        expect(handlers.unshift).toHaveBeenCalledWith(target, [0], extra);
        expect(target).toEqual([0, 1, 2, 3]);
    });

    it('should call the splice handler with extra parameter', () => {
        const target = [1, 2, 3, 4];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            splice: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy.splice(1, 2, 99, 100);

        expect(handlers.splice).toHaveBeenCalledWith(target, 1, 2, [99, 100], extra);
        expect(target).toEqual([1, 99, 100, 4]);
    });

    it('should call the reverse handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            reverse: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy.reverse();

        expect(handlers.reverse).toHaveBeenCalledWith(target, extra);
        expect(target).toEqual([3, 2, 1]);
    });

    it('should call the sort handler with extra parameter', () => {
        const target = [3, 1, 2];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            sort: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy.sort();

        expect(handlers.sort).toHaveBeenCalledWith(target, extra);
        expect(target).toEqual([1, 2, 3]);
    });

    it('should call the fill handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            fill: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        proxy.fill(0, 1, 3);

        expect(handlers.fill).toHaveBeenCalledWith(target, 0, 1, 3, extra);
        expect(target).toEqual([1, 0, 0]);
    });

    it('should call the defaultAction handler with extra parameter', () => {
        const target = [1, 2, 3];
        const extra = { context: 'test' };
        const handlers: ArrayHandlers<number, typeof extra> = {
            defaultAction: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers, true, extra);
        const length = proxy.length;

        expect(handlers.defaultAction).toHaveBeenCalledWith(target, 'length', [], extra);
        expect(length).toBe(3);
    });

    it('should handle absence of extra parameter gracefully', () => {
        const target = [1, 2, 3];
        const handlers: ArrayHandlers<number> = {
            set: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableArray(target, handlers);
        proxy[1] = 99;

        expect(handlers.set).toHaveBeenCalledWith(target, 1, 99, undefined);
        expect(target[1]).toBe(99);
    });
});

