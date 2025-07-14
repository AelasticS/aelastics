import { createStore } from '../store/createStore';
import {UserSchema} from './exampleTypeSchema';

describe('EternalStore', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore(UserSchema.types);
  });

  it('should create a dynamic class with the correct name', () => {
    const typeMeta = UserSchema.types.get('User')!;

    const DynamicClass = store.getEternalStore()['createDynamicClass']( typeMeta, store.getEternalStore());
    const instance = new DynamicClass();

    expect(instance.constructor.name).toBe('User');
  });
});