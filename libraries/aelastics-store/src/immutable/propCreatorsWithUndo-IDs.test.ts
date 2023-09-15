import { AnyObjectType } from "aelastics-types";
import {
  defineComplexArrayProp,
  defineComplexObjectProp,
  defineManyToMany,
  defineManyToOne,
  defineOneToMany,
  defineOneToOne,
  OperationContext,
} from "./propCreatorsWithUndo"; // Replace with the actual import

class DynamicProperties {
  [key: string]: any;
}

describe("One-to-One Relationship with ID", () => {
  let context: OperationContext;

  beforeEach(() => {
    context = new OperationContext();
    context.idMap = new Map();
  });

  test("should set and get one-to-one relationship with ID", () => {
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

    const person1 = new Person("p1");
    const person2 = new Person("p2");
    const car1 = new Car("c1");
    const car2 = new Car("c2");

    context.idMap.set("p1", person1);
    context.idMap.set("p2", person2);
    context.idMap.set("c1", car1);
    context.idMap.set("c2", car2);

    const personType: AnyObjectType = {} as any;
    const carType: AnyObjectType = {} as any;

    defineOneToOne(
      Person.prototype,
      "car",
      "owner",
      personType,
      carType,
      context,
      true,
      false
    );
    defineOneToOne(
      Car.prototype,
      "owner",
      "car",
      carType,
      personType,
      context,
      false,
      true
    );

    // Set relationships
    person1.car = car1;
    car2.owner = person2;

    // Test relationships
    expect(person1.car).toBe(car1);
    expect(car1.owner).toBe(person1);
    expect(person2.car).toBe(car2);
    expect(car2.owner).toBe(person2);

    // Change relationships
    person1.car = car2;
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
    this._workers = [];
  }
}

class Worker extends DynamicProperties {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
  }
}

describe("One-to-Many Relationship with ID", () => {
  let context: OperationContext;

  beforeEach(() => {
    context = new OperationContext();
    context.idMap = new Map();
  });

  test("should set and get one-to-many relationship with ID", () => {
    const company1 = new Company("c1");
    const worker1 = new Worker("w1");
    const worker2 = new Worker("w2");

    context.idMap.set("c1", company1);
    context.idMap.set("w1", worker1);
    context.idMap.set("w2", worker2);

    const companyType: AnyObjectType = {} as any;
    const workerType: AnyObjectType = {} as any;

    defineOneToMany(
      Company.prototype,
      "workers",
      "company",
      companyType,
      workerType,
      context,
      false,
      true
    );
    defineManyToOne(
      Worker.prototype,
      "company",
      "workers",
      workerType,
      companyType,
      context,
      true,
      false
    );

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

class Student extends DynamicProperties {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
    this._courses = [];
    this._friends = [];
  }
}

class Course extends DynamicProperties {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
    this._students = [];
  }
}

describe("Many-to-Many Relationship with ID", () => {
  let context: OperationContext;

  beforeEach(() => {
    context = new OperationContext();
    context.idMap = new Map();
  });

  test("should set and get many-to-many relationship with ID", () => {
    const student1 = new Student("s1");
    const student2 = new Student("s2");
    const course1 = new Course("c1");
    const course2 = new Course("c2");

    context.idMap.set("s1", student1);
    context.idMap.set("s2", student2);
    context.idMap.set("c1", course1);
    context.idMap.set("c2", course2);

    const studentType: AnyObjectType = {} as any;
    const courseType: AnyObjectType = {} as any;

    defineManyToMany(
      Student.prototype,
      "courses",
      "students",
      studentType,
      courseType,
      context,
      false,
      true
    );
    defineManyToMany(
      Course.prototype,
      "students",
      "courses",
      courseType,
      studentType,
      context,
      true,
      false
    );

    // Add courses to students
    student1.addCourses(course1);
    student1.addCourses(course2);

    // Test relationships
    expect(student1.courses).toEqual([course1, course2]);
    expect(course1.students).toEqual([student1.id]);
    expect(course2.students).toEqual([student1.id]);

    // Remove a course from the student
    student1.removeCourses(course1);

    // Test changed relationships
    expect(student1.courses).toEqual([course2]);
    expect(course1.students).toEqual([]);
    expect(course2.students).toEqual([student1.id]);
  });
});


describe('defineComplexObjectProp', () => {
  const WorkerType: AnyObjectType = {} as any;

  let context: OperationContext;

  beforeEach(() => {
    context = new OperationContext();
    context.idMap = new Map();
  });
  
  it('should set and get complex object property for Worker', () => {
    defineComplexObjectProp(Worker.prototype, 'boss', true, context, WorkerType);

    const worker1 = new Worker('w1');
    const worker2 = new Worker('w2');
    context.idMap.set('w1', worker1);
    context.idMap.set('w2', worker2);

    worker1.boss = worker2;

    expect(worker1.boss).toBe(worker2);
    expect(context.operationStack.length).toBe(1);
  });
});

describe('defineComplexArrayProp', () => {
  const StudentType: AnyObjectType = {} as any;
  let context: OperationContext;

  beforeEach(() => {
    context = new OperationContext();
    context.idMap = new Map();
  });


  it('should add and remove items from complex array property for Student', () => {
    defineComplexArrayProp(Student.prototype, 'friends', true, context, StudentType);

    const student1 = new Student('1');
    const student2 = new Student('2');
    const student3 = new Student('3');
    context.idMap.set('1', student1);
    context.idMap.set('2', student2);
    context.idMap.set('3', student3);

    student1.addFriends(student2);
    student1.addFriends(student3);

    expect(student1._friends).toEqual(['2', '3']);
    expect(context.operationStack.length).toBe(2);

    student1.removeFriends(student2);

    expect(student1._friends).toEqual(['3']);
    expect(context.operationStack.length).toBe(3);
  });
});

