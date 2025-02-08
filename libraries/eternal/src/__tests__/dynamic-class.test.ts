import { EternalStore } from '../EternalStore';
import {UserSchema} from './exampleTypeSchema';

describe('EternalStore', () => {
  let store: EternalStore;

  beforeEach(() => {
    store = new EternalStore(UserSchema.types);
  });

  it('should create a dynamic class with the correct name', () => {
    const typeMeta = UserSchema.types.get('User')!;

    const DynamicClass = store['createDynamicClass']( typeMeta, store);
    const instance = new DynamicClass();

    expect(instance.constructor.name).toBe('User');
  });
});