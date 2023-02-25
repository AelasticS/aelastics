/* tslint:disable:max-classes-per-file*/
/* tslint:disable:interface-name */
/* tslint:disable:array-type */
/* tslint:disable:ban-types */

// import * as Model from "./AppModel"
import * as Events from "./EventLog"

// AppObject store
// v 1.0
// - store/get objects
// - implement maps for storing/getting obejcts in chunks (corresponding to object types)

// v 1.1
// - create objects from EventLog
// - Cash of constructors - for each registered class

// v 2.0
//  - ceation of new objects - ID generator
// - read/write objects from/to server/persistent DB

// v 2.1
// - create object from JSON
// - create objects from XMI


//  All objects in store must implement this interface
//  IdType is a type parameter of object identifier, e.g. string, number, GUID, etc.
export interface StoreEntry<IdType> {
    ID: IdType,
    objClass: string,
    chunkName: string
}


enum LogStateType { Stoped, Started }

export class AppStore<IdType> {

    private readonly classConstructors: Map<string, ()=>StoreEntry<IdType>>;
    private readonly idGenerators:Map<string, ()=>IdType>;
    private chunks: Map<string, CacheChunk<IdType>> = new Map();
    private logState: LogStateType;
    //@ts-ignore
    private log: Events.EventLog;


    constructor(classConstructors: Map<string, ()=>StoreEntry<IdType>>, idGenerators:Map<string, ()=>IdType>) {
        this.classConstructors = classConstructors;
        this.idGenerators= idGenerators;
        this.logState = LogStateType.Started
    }

    public startLog(): Events.EventLog {
        if (this.logState === LogStateType.Stoped) {
            this.logState = LogStateType.Started;
            this.log = new Events.EventLog();
        }
        return this.log;
    }

    public stopLog(): void {
        this.logState = LogStateType.Stoped;
    }


    public recreateState(log: Events.EventLog): void {
        // for each action, redo
    }

    // put object to store
    public set(obj: StoreEntry<IdType>): void {
        let chunk: CacheChunk<IdType> | undefined = this.chunks.get(obj.chunkName);
        if (!chunk) {
            chunk = new CacheChunk();
        }
        chunk.set(obj.ID, obj);
    }

    // get object from store
    public get(objId: IdType, chunkName: string): StoreEntry<IdType> | undefined {
        const chunk: CacheChunk<IdType> | undefined = this.chunks.get(chunkName);
        if (chunk) {
            return chunk.get(objId);
        }
        return undefined;
    }

    // remove object from  store
    public drop(objId: IdType, chunkName: string): boolean {
        const chunk: CacheChunk<IdType> | undefined = this.chunks.get(chunkName);
        if (chunk) {
            return chunk.drop(objId);
        }
        return false;
    }

    // remove all objects from given chunk or from all chunks
    public dropAll(): void {
        this.chunks.forEach((chunk, name, m) => {
            chunk.dropAll()
        })
    }


// v 2.0

    public createObject(className:string): StoreEntry<IdType>| undefined {
        let ctor: ()=>StoreEntry<IdType>;

        if (this.classConstructors.has(className)){
            ctor = this.classConstructors.get(className) as ()=>StoreEntry<IdType>;
            const obj: StoreEntry<IdType> = ctor();
            obj.ID = this.generateID(className);
            this.set(obj);
            return obj;
        }
        else { return undefined;}
    }

    public generateID(className:string):IdType {
        let genId: ()=>IdType;

        if (this.idGenerators.has(className)){
            genId = this.idGenerators.get(className) as ()=>IdType;
            return genId();
        }
        else { throw (new Error("No ID generator"));}
    }

}

class CacheChunk<IdType> {
    private cache: Map<IdType, StoreEntry<IdType>> = new Map();

    /* v 1.0 */

    // put object to chunk
    public set(id: IdType, obj: StoreEntry<IdType>): void {
        this.cache.set(id, obj);
    }

    public get(id: IdType): StoreEntry<IdType>| undefined {
        return this.cache.get(id);
    }

    // remove object from  chunk
    public drop(id: IdType): boolean {
        return this.cache.delete(id);
    }

    // remove all objects from chunk
    public dropAll(): void {
        this.cache.clear();
    }

}
