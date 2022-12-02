import { ComplexType } from './ComplexType';
import { ExtraInfo, RoleType, Type } from '../type/Type';
import { Any, DtoGraphTypeOf, DtoTreeTypeOf, TypeOf } from '../common/DefinitionAPI';
import { Node } from '../common/Node';
import { InstanceReference, TypeCategory } from '../type/TypeDefinisions';
import { ServiceError } from 'aelastics-result';
import { TypeSchema } from '../type/TypeSchema';
import { OptionalType } from '../special-types/Optional';


// keys of a specific type
type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never
}[keyof O]

type KeysOfOptionalType<O extends InterfaceDecl> = {
  [K in keyof O]: O[K] extends OptionalType<Any> ? K : never
}[keyof O]

type RequiredKeys<T> = Exclude<KeysOfType<T, Exclude<T[keyof T], undefined>>, undefined>;
type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

type AllKeyOf<T> = T extends never ? never : keyof T

// type Omit<T, K> = { [P in Exclude<keyof T, K>]: T[P] }

type Optional<T, K> = { [P in Extract<keyof T, K>]?: T[P] }

type WithOptional<T, K extends AllKeyOf<T>> = T extends never ? never : Omit<T, K> & Optional<T, K>


// export type InterfaceDecl = Record<string, Any>
export interface InterfaceDecl {
  [key: string]: Any;
}
// export type Interface<I extends InterfaceDecl> = Record<keyof I, TypeOf<I[keyof I]>>

export type Interface<I extends InterfaceDecl> = { [K in keyof I]: TypeOf<I[K]> };

// export type InterfaceNew<I extends InterfaceDecl> = WithOptional<Interface<I>, KeysOfOptionalType<I>>;

export type DtoTreeInterface<I extends InterfaceDecl> = Record<keyof I, DtoTreeTypeOf<I[keyof I]>>;
// export type DtoGraphInterface<I extends InterfaceDecl> = Record<keyof I, DtoGraphTypeOf<I[keyof I]>>

export type DtoGraphInterface<I extends InterfaceDecl> = {
  ref: InstanceReference;
  object: { [K in keyof I]: DtoGraphTypeOf<I[K]> }; // Record<keyof I, DtoGraphTypeOf<I[keyof I]>>
};

export class ObjectType<P extends InterfaceDecl, I extends readonly string[]> extends ComplexType<
  Interface<P>,
  DtoGraphInterface<P>,
  DtoTreeInterface<P>
> {
  public ID!: { [k in I[number]]: TypeOf<P[k]> };
  public ID_DTO!: { [k in I[number]]: DtoGraphInterface<P[k]['_G']> }; // { [k in I[number]]: DtoGraphInterface<P[k]> }
  public ID_DTO_TREE!: { [k in I[number]]: DtoTreeTypeOf<P[k]> };
  readonly _identifier: I;
  readonly interfaceDecl: P;
  readonly keys: string[];
  readonly types: Any[];
  readonly len: number;
  public inverseCollection: Map<
    string,
    { propName: string; propType: TypeCategory; type: ObjectType<any, []> }
  > = new Map();

  constructor(name: string, interfaceDecl: InterfaceDecl, identifier: I, schema: TypeSchema) {
    super(name, 'Object', schema);
    this.interfaceDecl = interfaceDecl as any;
    this._identifier = identifier;
    this.keys = Object.keys(this.interfaceDecl);
    this.types = this.keys.map((key) => this.interfaceDecl[key] as Any);
    this.len = this.keys.length;
    this._identifier.forEach((i) => {
      if (!this.keys.includes(i)) {
        throw new ServiceError(
          'ValidationError',
          `Invalid identifier:${i} is not a property of object type ${name}`
        );
      }
    });
  }
  get identifier(): I {
    return this._identifier;
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties(): Map<string, Any> {
    let mp = new Map<string, Any>();
    this.keys.forEach((key) => mp.set(key, this.interfaceDecl[key] as Any));
    return mp;
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allInverse(): Map<string, { propName: string; propType: TypeCategory; type: ObjectType<any, []> }> {
    let mp = new Map(this.inverseCollection);
    return mp;
  }

  getPropsInfo(): [string[], Any[], number] {
    return [this.keys, this.types, this.len];
  }

  getTypeOfProp(name:string): Any | undefined {
    return this.allProperties.get(name)
  }

  init(n: Node): Interface<P> {
    let obj = {}
    // TODO:  is '@@aelastics/type' property needed?
    Object.defineProperty(obj, '@@aelastics/type', {
      value: this.fullPathName,
      writable: true,
      enumerable: false,
      configurable: true
    })
    return obj as any;
  }

  addChild(parent: any, child: any, n: Node): void {
    if (n.extra.propName !== undefined) parent[n.extra.propName] = child;
  }

  *children(object: Interface<P>, n: Node): Generator<[Interface<P>, Any, ExtraInfo]> {
    // TODO subtyping test;
    let implTypeName: string = '';
    let implType: Any | undefined;
    if (object) {
        implTypeName = object['@@aelastics/type'];
    }
    if(implTypeName !== '') {
      implType = this.ownerSchema.getType(implTypeName);
    }
    if (implType && implType != this){
      n.type = implType
      return implType.children(object, n);
    } 
    let [keys, types, len] = this.getPropsInfo();
    for (let i = 0; i < len; i++) {
      if (object === undefined) {
        yield [undefined as any, types[i], { role: 'asProperty', propName: keys[i] }];
      } else {
        yield [object[keys[i]], types[i], { role: 'asProperty', propName: keys[i] }];
      }
    }
  }
}
