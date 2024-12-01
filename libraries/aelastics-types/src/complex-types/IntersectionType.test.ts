
import * as t from '../index'
import { intersectionOf } from '../index';

// example how intersection type is defined and used 
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
  describe('IntersectionType Tests', () => {
    let instance: any;
    let node: any;

    beforeEach(() => {
        instance = intersectionOf([], 'TestType', t.schema('TestSchema', undefined));
        node = {} as any; // Declare the `node` variable once
    });

    describe('Instantiation Tests', () => {
        it('should instantiate IntersectionType with valid object types', () => {
           expect(() => {
                intersectionOf([Person, Customer], 'PersonCustomer');
            }).not.toThrow();
        });

        it('should throw an error if any element is not an object type', () => {
            const Person = t.object(
                {
                    name: t.string,
                    age: t.number,
                },
                'Person'
            );

            expect(() => {
                intersectionOf([Person, t.number], 'InvalidIntersection');
            }).toThrow('IntersectionType can only be created with object types.');
        });
    });

    describe('addChild Tests', () => {
        it('should successfully add a child to a valid parent object', () => {
            const parent = { id: 1 };
            const child = { name: 'John' };

            instance.addChild(parent, child, node);
            expect(parent).toEqual({ id: 1, name: 'John' });
        });

        it('should throw an error if parent is not an object', () => {
            const parent = undefined;
            const child = { name: 'John' };

            expect(() => {
                instance.addChild(parent as any, child, node);
            }).toThrow('IntersectionType requires parent to be a valid object.');
        });

        it('should throw an error if child is not an object', () => {
            const parent = { id: 1 };
            const child = undefined;

            expect(() => {
                instance.addChild(parent, child as any, node);
            }).toThrow('IntersectionType only supports objects as children.');
        });

        it('should merge properties of multiple children into the parent', () => {
            const parent = { id: 1 };
            const child1 = { name: 'John' };
            const child2 = { age: 30 };

            instance.addChild(parent, child1, node);
            instance.addChild(parent, child2, node);

            expect(parent).toEqual({ id: 1, name: 'John', age: 30 });
        });

        it('should throw an error if parent or child is null', () => {
            const parent = null;
            const child = null;

            expect(() => {
                instance.addChild(parent as any, { name: 'John' }, node);
            }).toThrow('IntersectionType requires parent to be a valid object.');

            expect(() => {
                instance.addChild({ id: 1 }, child as any, node);
            }).toThrow('IntersectionType only supports objects as children.');
        });
    });
});