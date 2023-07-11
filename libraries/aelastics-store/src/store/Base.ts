import { Repository, ServerProxy } from "..";
import { EventLog } from "../eventLog/EventLog";
import * as t from "aelastics-types";
import { ObjectLiteral, TypeSchema } from "aelastics-types";
import { IStoreObject, objectType } from "../common/CommonConstants";

export abstract class Base<ID> {
  protected server?: ServerProxy;
  public eventLog = new EventLog();
  protected repo: Repository<t.Any, ID> = new Repository(this.eventLog);

  constructor(server?: ServerProxy) {
    this.server = server;
  }

  protected getTypeSchemaFullName<T extends IStoreObject<ID, ObjectLiteral>>(
    obj: T
  ): string {
    return obj[objectType].substring(0, obj[objectType].lastIndexOf("/"));
  }

  public abstract getTypeSchemaByFullName(schemaPath:string):TypeSchema|undefined;

  public abstract getTypeSchemaOfObject<
    T extends IStoreObject<ID, ObjectLiteral>
  >(obj: T): t.TypeSchema;

  public abstract getTypeOfObject<T extends IStoreObject<ID, ObjectLiteral>>(
    obj: T
  ): t.Any;

  public deepCreate<P extends ObjectLiteral>(
    type:  t.ObjectType<any,any>,
    initValue?: Partial<P>
  ): IStoreObject<ID, P> {
    const obj = this.repo.deepCreate<P>(type, initValue);
    return obj;
  }

  public create<P extends IStoreObject<ID, ObjectLiteral>>(
    type: t. ObjectType<any,any>,
    initValue?: Partial<P>
  ): IStoreObject<ID, P> {
    const obj = this.repo.create<P>(type, initValue);
    return obj;
  }

  public delete<T extends IStoreObject<ID, ObjectLiteral>>(object: T): void {
    let type = this.getTypeOfObject(object);
    if (type.typeCategory !== "Object")
      throw new Error(`You cannot delete typeCategory ${type.typeCategory}`);
    const obj = this.repo.delete(type as t.ObjectType<any, any>, object as any);
  }

  protected importFromDTO(baseType: t. ObjectType<any,any>, inputDTO: ObjectLiteral) {
    const tmpRepo = new Repository<t. ObjectType<any,any>, ID>();
    // avoid eventLog
    // const obj = this.repo.importFromDTO<R>(this.rootType, initValue);
    const obj = tmpRepo.importFromDTO(baseType, inputDTO);
    return obj;
  }

  protected exportToDTO(baseType: t. ObjectType<any,any>, inputDTO: ObjectLiteral) {
    const obj = this.repo.exportToDTO(baseType, inputDTO);
    return obj;
  }
}
