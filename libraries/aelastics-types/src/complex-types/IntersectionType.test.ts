
import * as t from '../index'
import { IntersectionType } from './IntersectionType';


// example how intersection type is deefined and used 
const Person = t.object(
    {
      name: t.string,
      age: t.number,
    },
    'person'
  )

  const Customer = t.object(
    {
        customerId: t.number,
        purchaseHistory: t.string
    },
    'customer'
  )

  let person1: t.TypeOf<typeof Person> = {
    name: 'John',
    age:35
  }  
  
  let customer1: t.TypeOf<typeof Customer> = {
    customerId: 1,
    purchaseHistory: 'Books'
  } 

  let pc: IPersonCustomer = {name: 'John', age: 35, customerId: 1, purchaseHistory: 'Books'};

  const PersonCustomer = t.intersectionOf([Person, Customer], 'personCustomer');

  type IPersonCustomer = t.TypeOf<typeof PersonCustomer>


  // test intersection type

describe('IntersectionType addChild and children methods tests', () => {
    let instance:IntersectionType<any>;

    beforeEach(() => {
        instance = new IntersectionType('TestType', [], { schema: 'TestSchema' } as any);
    });

    describe('addChild', () => {
        it('should do nothing when both parent and child are undefined', () => {
            const parent = undefined;
            const child = undefined;
            instance.addChild(parent, child, {} as any);
            expect(parent).toBeUndefined();
        });

        it('should assign child as parent when parent is undefined', () => {
            let parent: any = undefined;
            const child = { key: 'value' };
            instance.addChild(parent, child, {} as any);
            expect(parent).toEqual(child);
        });

        it('should retain parent when child is undefined', () => {
            const parent = { key: 'value' };
            const child = undefined;
            instance.addChild(parent, child, {} as any);
            expect(parent).toEqual({ key: 'value' });
        });

        it('should merge arrays when both parent and child are arrays', () => {
            const parent = [1, 2];
            const child = [3, 4];
            instance.addChild(parent, child, {} as any);
            expect(parent).toEqual([1, 2, 3, 4]);
        });

        it('should add object properties to array when parent is an array and child is an object', () => {
            const parent: any[] = [1, 2];
            const child = { key: 'value' };
            instance.addChild(parent, child, {} as any);
            expect(parent).toEqual(expect.arrayContaining([1, 2]));
            expect(parent).toHaveProperty('key', 'value');
        });

        it('should add parent properties to array when child is an array and parent is an object', () => {
            let parent: any = { key: 'value' };
            const child: any[] = [1, 2];
            instance.addChild(parent, child, {} as any);
            expect(child).toEqual(expect.arrayContaining([1, 2]));
            expect(child).toHaveProperty('key', 'value');
        });

        it('should merge objects when both parent and child are objects', () => {
            const parent = { a: 1 };
            const child = { b: 2 };
            instance.addChild(parent, child, {} as any);
            expect(parent).toEqual({ a: 1, b: 2 });
        });

        it('should set parent to undefined for incompatible types', () => {
            let parent: any = 42;
            const child: any = true;
            instance.addChild(parent, child, {} as any);
            expect(parent).toBeUndefined();
        });
    });

    describe('children', () => {
        it('should yield elements with role "asElementOfIntersection"', () => {
            instance = new IntersectionType('TestType', [1, 2, 3] as any, { schema: 'TestSchema' } as any);
            const value = 123 as any;
            const children = [...instance.children(value)];
            expect(children).toHaveLength(3);
            children.forEach(([v, t, info], index) => {
                expect(v).toBe(value);
                expect(t).toBe(instance.elements[index]);
                expect(info).toEqual({ role: 'asElementOfIntersection' });
            });
        });
    });
});
