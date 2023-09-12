// createObservableArray.test.ts
import { createObservableArray } from './observableArray';

describe('createObservableArray', () => {
    // Test the `set` handler.
    it('set: should update the array if handler returns true and be called with correct arguments', () => {
        const mockSetHandler = jest.fn((target, index, value) => true);
        const arr = createObservableArray<number>([1, 2, 3], { set: mockSetHandler });

        arr[1] = 99;

        expect(arr[1]).toBe(99);

        // expect(mockSetHandler.mock.calls[0][0]).toMatchObject([1, 2, 3]); 
        // array is tested after mutation
        expect(mockSetHandler).toHaveBeenCalledWith(expect.arrayContaining([1, 99, 3]), 1, 99);

    });

    // Test the `delete` handler.
    it('delete: should delete the element if handler returns true and be called with correct arguments', () => {
        const mockDeleteHandler = jest.fn((target, index) => true);
        const arr = createObservableArray<number>([1, 2, 3], { delete: mockDeleteHandler });

        delete arr[1];

        expect(arr[1]).toBeUndefined();
        expect(mockDeleteHandler).toHaveBeenCalledWith(expect.arrayContaining([1, , 3]), 1);
    });

    // Test the `push` handler.
    it('push: should add element if handler returns true and be called with correct arguments', () => {
        const mockPushHandler = jest.fn((target, items) => true);
        const arr = createObservableArray<number>([1, 2, 3], { push: mockPushHandler });

        arr.push(4);

        expect(arr[3]).toBe(4);
        expect(mockPushHandler).toHaveBeenCalledWith(expect.arrayContaining([1, 2, 3]), expect.arrayContaining([4]));
    });

    // Test the `pop` handler.
    it('pop: should remove the last element if handler returns true and be called with correct arguments', () => {
        const mockPopHandler = jest.fn((target) => true);
        const arr = createObservableArray<number>([1, 2, 3], { pop: mockPopHandler });

        const popped = arr.pop();

        expect(popped).toBe(3);
        expect(arr.length).toBe(2);
        expect(mockPopHandler).toHaveBeenCalledWith(expect.arrayContaining([1, 2]));
    });

    // Test the `shift` handler.
    it('shift: should remove the first element if handler returns true and be called with correct arguments', () => {
        const mockShiftHandler = jest.fn((target) => true);
        const arr = createObservableArray<number>([1, 2, 3], { shift: mockShiftHandler });

        const shifted = arr.shift();

        expect(shifted).toBe(1);
        expect(arr).toEqual([2, 3]);
        expect(mockShiftHandler).toHaveBeenCalledWith(expect.arrayContaining([2, 3]));
    });

    // Test the `unshift` handler.
    it('unshift: should add elements to the start of the array if handler returns true and be called with correct arguments', () => {
        const mockUnshiftHandler = jest.fn((target, items) => true);
        const arr = createObservableArray<number>([1, 2, 3], { unshift: mockUnshiftHandler });

        arr.unshift(0);

        expect(arr).toEqual([0, 1, 2, 3]);
        expect(mockUnshiftHandler).toHaveBeenCalledWith(expect.arrayContaining([0, 1, 2, 3]), expect.arrayContaining([0]));
    });

    // Test the `splice` handler.
    it('splice: should modify the array correctly if handler returns true and be called with correct arguments', () => {
        const mockSpliceHandler = jest.fn((target, start, deleteCount, items) => true);
        const arr = createObservableArray<number>([1, 2, 3], { splice: mockSpliceHandler });

        arr.splice(1, 1, 99);

        expect(arr).toEqual([1, 99, 3]);
        expect(mockSpliceHandler).toHaveBeenCalledWith(expect.arrayContaining([1, 99, 3]), 1, 1, expect.arrayContaining([99]));
    });

    // Test the `reverse` handler.
    it('reverse: should reverse the array if handler returns true and be called with correct arguments', () => {
        const mockReverseHandler = jest.fn((target) => true);
        const arr = createObservableArray<number>([1, 2, 3], { reverse: mockReverseHandler });

        arr.reverse();

        expect(arr).toEqual([3, 2, 1]);
        expect(mockReverseHandler).toHaveBeenCalledWith(expect.arrayContaining([3, 2, 1]));
    });

    // Test the `sort` handler.
    it('sort: should sort the array if handler returns true and be called with correct arguments', () => {
        const mockSortHandler = jest.fn((target) => true);
        const arr = createObservableArray<number>([3, 1, 2], { sort: mockSortHandler });

        arr.sort();

        expect(arr).toEqual([1, 2, 3]);
        expect(mockSortHandler).toHaveBeenCalledWith(expect.arrayContaining([1, 2, 3]));
    });

    // Test the `fill` handler.
    it('fill: should fill the array with the specified value if handler returns true and be called with correct arguments', () => {
        const mockFillHandler = jest.fn((target, value, start, end) => true);
        const arr = createObservableArray<number>([1, 2, 3], { fill: mockFillHandler });

        arr.fill(0, 1, 3);

        expect(arr).toEqual([1, 0, 0]);
        expect(mockFillHandler).toHaveBeenCalledWith(expect.arrayContaining([1, 0, 0]), 0, 1, 3);
    });

    // Test the `defaultAction` handler.
    it('defaultAction: should be called when accessing an unknown property', () => {
        const mockDefaultActionHandler = jest.fn((target, key) => true);
        const arr = createObservableArray<number>([1, 2, 3], { defaultAction: mockDefaultActionHandler });

        const value = arr.length;

        expect(mockDefaultActionHandler).toHaveBeenCalledWith(expect.arrayContaining([1, 2, 3]), 'length');
        expect(value).toBe(3)
    });
});
