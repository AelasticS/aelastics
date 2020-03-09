import { Path , Result } from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'
import { Any , DtoTypeOf , TypeOf } from '../Type'

/**
 * Map type
 */
export declare class MapTypeC<K extends Any , V extends Any> extends ComplexTypeC<V , Map<TypeOf<K> , TypeOf<V>> , Array<[DtoTypeOf<K> , DtoTypeOf<V>]>> {
  readonly _tag: 'Map'
  readonly keyType: K

  constructor(name: string , type: V , k: K);

  defaultValue(): any;

  validate(input: Map<TypeOf<K> , TypeOf<V>> , path?: Path): Result<boolean>;

  fromDTO(input: any , path?: Path): Result<Map<K , V>>;

  toDTO(input: Map<TypeOf<K> , TypeOf<V>> | Map<K , V> , path?: Path , validate?: boolean): Result<Array<[K , V]>>;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const mapOf: <K extends Any , V extends Any>(key: K , element: V , name?: string) => MapTypeC<K , V>
