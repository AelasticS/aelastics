import { AnyObjectType } from 'aelastics-types';
import { defineManyToOne, defineOneToMany, defineOneToOne, OperationContext } from './propCreatorsWithUndo' // Replace with the actual import

class DynamicProperties {
  [key: string]: any;
}

describe('One-to-One Relationship with ID', () => {
  let context: OperationContext;

  beforeEach(() => {
    context = new OperationContext();
    context.idMap = new Map();
  });

  test('should set and get one-to-one relationship with ID', () => {

    class Person extends DynamicProperties {
      id: string;
      constructor(id: string) {
        super();
        this.id = id;
      }
    }
    
    class Car extends DynamicProperties {
      id: string;
      constructor(id: string) {
        super();
        this.id = id;
      }
    }
    

    const person1 = new Person('p1');
    const person2 = new Person('p2');
    const car1 = new Car('c1');
    const car2 = new Car('c2');

    context.idMap.set('p1', person1);
    context.idMap.set('p2', person2);
    context.idMap.set('c1', car1);
    context.idMap.set('c2', car2);

    const personType: AnyObjectType = {} as any;
    const carType: AnyObjectType = {} as any;

    defineOneToOne(Person.prototype, 'car', 'owner', personType, carType, context, true, false);
    defineOneToOne(Car.prototype, 'owner', 'car', carType, personType, context, false, true);




    // Set relationships
    person1.car = car1
    car2.owner = person2;

    // Test relationships
    expect(person1.car).toBe(car1);
    expect(car1.owner).toBe(person1);
    expect(person2.car).toBe(car2);
    expect(car2.owner).toBe(person2);

    // Change relationships
    person1.car = car2
    car1.owner = person2;

    // Test changed relationships
    expect(person1.car).toBe(car2);
    expect(car2.owner).toBe(person1);
    expect(person2.car).toBe(car1);
    expect(car1.owner).toBe(person2);
  });
});


class Company extends DynamicProperties {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
  }
}

class Worker extends DynamicProperties {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
  }
}

describe('One-to-Many Relationship with ID', () => {
  let context: OperationContext;

  beforeEach(() => {
    context = new OperationContext();
    context.idMap = new Map();
  });

  test('should set and get one-to-many relationship with ID', () => {
    const company1 = new Company('c1');
    const worker1 = new Worker('w1');
    const worker2 = new Worker('w2');

    context.idMap.set('c1', company1);
    context.idMap.set('w1', worker1);
    context.idMap.set('w2', worker2);

    const companyType: AnyObjectType = {} as any;
    const workerType: AnyObjectType = {} as any;

    defineOneToMany(Company.prototype, 'workers', 'company', companyType, workerType, context, false, true);
    defineManyToOne(Worker.prototype, 'company', 'workers', workerType, companyType, context, true, false);

    // Add workers to company
    company1.addWorkers(worker1);
    company1.addWorkers(worker2);

    // Test relationships
    expect(company1.workers).toEqual([worker1, worker2]);
    expect(worker1.company).toBe(company1);
    expect(worker2.company).toBe(company1);

    // Remove a worker from the company
    company1.removeWorkers(worker1);

    // Test changed relationships
    expect(company1.workers).toEqual([worker2]);
    expect(worker1.company).toBeUndefined();
    expect(worker2.company).toBe(company1);
  });
});

