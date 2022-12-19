export interface IStack<T> {
    push(item: T): void;
    pop(): T;
    peek(): T;
    get size(): number;
}


export class ArrayStack<T> implements IStack<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) { }

    push(item: T): void {
        if (this.size === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }

    pop(): T {
        if (this.storage.length > 0) {
            return this.storage.pop()!;

        }
        else
            throw Error("Stack has no elements");

    }

    peek(): T {
        if (this.storage.length > 0) {
            return this.storage[this.size - 1];
        }
        else
            throw Error("Stack has no elements");

    }

    get size(): number {
        return this.storage.length;
    }
}