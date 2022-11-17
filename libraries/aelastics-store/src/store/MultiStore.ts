import * as t from 'aelastics-types';
import { Repository } from './Repository';
import { EventLog } from '../eventLog/EventLog';
import { ServerProxy } from '../server-proxy/ServerProxy';
import { InstanceReference } from 'aelastics-types';
import { objectType, objectUUID } from './CommonConstants';

/**
 * Store - keeps application state
 */

export class MultiStore<ID> {
    public readonly schemas: t.TypeSchema[] = [];
    public eventLog = new EventLog();
    protected repos: Map<t.Any, Repository<any>> = new Map();
    protected server?: ServerProxy;
    protected readonly instances: Map<ID, t.ObjectLiteral> = new Map

    constructor(server?: ServerProxy) {
        this.server = server;
    }

    registerTypeSchemas(schemas: t.TypeSchema[]) {
        schemas.push(...schemas)
    }
        
    protected getTypeSchemaName<T extends t.ObjectLiteral>(obj: T): string {
        return obj[objectType].substring(0, obj[objectType].lastIndexOf("/") + 1);
    }

    protected getTypeSchema<T extends t.ObjectLiteral>(obj: T): t.TypeSchema {
        const schemaName = this.getTypeSchemaName(obj)
        const schema = this.schemas.find(((s) => s.name === schemaName))
        if (!schema)
            throw new Error(`Type schema '${schemaName}' does not exist`);
        return schema
    }

    protected getRepos(type: t.Any): Repository<t.Any> {
        let rep = this.repos.get(type);
        if (!rep) {
            rep = new Repository(this.eventLog);
            this.repos.set(type, rep);
        }
        return rep;
    }

    public clear() {

    }

    public getObjectByID(id:ID) {
        return this.instances.get(id)
    }

    public async fetchObjectByID(type: t.Any, id:ID) {
        // read from server
        // deseralize
        // add to this.instances
        return this.getObjectByID(id)
    }

    public async persist () {

    }

    public new<T extends t.ObjectLiteral>(type: t.Any, initValue: T): T {
        const rep = this.getRepos(type);
        const obj = rep.create<T>(type, initValue);
        this.add(type, obj)
        return obj;
    }

    public add<T extends t.ObjectLiteral>(type: t.Any, obj: T) {
        this.instances.set(obj[objectUUID], obj)
    }

    public remove<T extends t.ObjectLiteral>(obj: T) {
        this.instances.delete(obj[objectUUID])
    }

    public delete<T extends t.ObjectLiteral>(object: T): void {
        let type = this.getType(object as Object);
        const rep = this.getRepos(type);
        if (type.typeCategory !== 'Object') throw new Error(`You cannot delete typeCategory ${type.typeCategory}`);
        const obj = rep.delete(type as t.ObjectType<any, any>, object as any);
    }

    public getType<T extends t.ObjectLiteral>(obj: T): t.Any {
        const typeName = obj[objectType].substring(obj[objectType].lastIndexOf("/") + 1)
        const schema = this.getTypeSchema(obj)
        const type = schema._types.get(typeName)
        if (!type)
            throw new Error(`Object type '${typeName}' does not exist in schema '${schema.name}'`);
        return type
    }


} 