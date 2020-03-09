import { Path , Result } from 'aelastics-result'
import { ObjectType , Props } from './ObjectType'
import { Any , DtoTypeOf , TypeOf } from '../Type'
import { ComplexTypeC } from './ComplexType'
import { LiteralTypeC } from '../simple-types/Literal'

export declare class TaggedUnionTypeC<Tag extends string , P extends Props> extends ComplexTypeC<P , TypeOf<P[keyof P]> , DtoTypeOf<P[keyof P]>> {
  readonly discriminator: string
  readonly _tag: 'TaggedUnion'
  readonly keys: string[]

  constructor(name: string , discriminator: string , elements: P);

  validate(value: TypeOf<this> , path?: Path): Result<boolean>;

  fromDTO(input: DtoTypeOf<P[keyof P]> , path?: Path): Result<P[keyof P]>;

  toDTO(input: TypeOf<this> , path?: Path , validate?: boolean): Result<DtoTypeOf<P[keyof P]>>;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const taggedUnion: <P extends Props>(elements: P , discr: string , name?: string) => TaggedUnionTypeC<string , P>
export declare type TaggedProps<Tag extends string> = {
  [K in Tag]: LiteralTypeC<any>;
};
export declare type Tagged<Tag extends string> = ObjectType<TaggedProps<Tag>>;
