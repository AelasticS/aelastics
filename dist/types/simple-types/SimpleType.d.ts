import { Any , TypeC } from '../Type'
import { Result } from 'aelastics-result'

export declare abstract class SimpleTypeC<T , D = T> extends TypeC<T , D> {
  constructor(name: string);

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}
