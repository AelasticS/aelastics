export interface Store{
    clear(): void;
    delete(key: string): boolean;
    get(key: string): Object | undefined;
    has(key: string): boolean;
    add(key: string, object: Object): this;
    readonly size: number;
}

export class MapStore implements Store {
    private map = new Map<string, Object>()

    public get size(): number {
        return this.map.size
    }

    clear(): void {
        this.map.clear();
    }
    delete(key: string): boolean {
        return this.map.delete(key);
    }
    get(key: string): Object | undefined {
        return this.map.get(key);
    }
    has(key: string): boolean {
        return this.map.has(key)
    }
    public add(id:string, o:Object) {
        this.map.set(id, o)
        return this
    }
     

}