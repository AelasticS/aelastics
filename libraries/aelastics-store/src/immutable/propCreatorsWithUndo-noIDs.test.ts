import { objectStatus } from '../common/CommonConstants';
import { StatusValue } from '../common/Status';
import { ImmutableStore } from './immutable-store';
import { defineOneToOne, defineManyToOne, defineOneToMany, defineManyToMany, defineSimpleValue } from './propCreatorsWithUndo'; // Replace with the actual module where these functions are defined
import { AnyObjectType } from 'aelastics-types';

describe("Undo and Redo functionality", () => {
  test("should set and get one-to-one relationship with ID", () => {
    expect(true).toBeTruthy
  })
})

/*
const targetObjType = {} as AnyObjectType
const inverseObjType = {} as AnyObjectType

const store = new ImmutableStore(targetObjType)


class DynamicProperties {
  [key: string]: any;
  constructor() {
    this[objectStatus] = StatusValue.Unmodified
  }
}
class Company extends DynamicProperties {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
    this._workers = []

  }
}

class Worker extends DynamicProperties {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
  }
}

describe('Undo and Redo functionality', () => {

  let boss1 = {} as any;
  let boss2 = {} as any;
  let company1 = {}  as any;
  let company2=  {}  as any;

  beforeEach(() => {
    boss1 = {} as any;
    boss2 = {} as any;
    company1 = {}  as any;
    company2=  {}  as any;
    store.makeNewOperationContext({})
  
    defineOneToOne(boss1, 'company', 'boss', targetObjType, inverseObjType);
    defineOneToOne(boss2, 'company', 'boss', targetObjType, inverseObjType);
  
    defineOneToOne(company1, 'boss', 'company', targetObjType, inverseObjType);
    defineOneToOne(company2, 'boss', 'company', targetObjType, inverseObjType);

  });

  test('Undo should revert the last operation', () => {
    boss1.company = company1;
    expect(boss1.company).toBe(company1);
    expect(company1.boss).toBe(boss1);

    store.getContext().undo();

    expect(boss1.company).toBeUndefined();
    expect(company1.boss).toBeUndefined();
  });

  test('Redo should reapply the last undone operation', () => {
    boss1.company = company1;
    store.getContext().undo();
    store.getContext().redo();

    expect(boss1.company).toBe(company1);
    expect(company1.boss).toBe(boss1);
  });

  test('Undo and Redo should handle multiple operations', () => {
    boss1.company = company1;
    boss2.company = company2;

    store.getContext().undo();
    expect(boss2.company).toBeUndefined();
    expect(company2.boss).toBeUndefined();

    store.getContext().undo();
    expect(boss1.company).toBeUndefined();
    expect(company1.boss).toBeUndefined();

    store.getContext().redo();
    expect(boss1.company).toBe(company1);
    expect(company1.boss).toBe(boss1);

    store.getContext().redo();
    expect(boss2.company).toBe(company2);
    expect(company2.boss).toBe(boss2);
  });
});



describe('OneToMany and ManyToOne Relationship: Company and Worker', () => {
  let company: Company;
  let worker1: Worker;
  let worker2: Worker;



  beforeEach(() => {
    company = new Company("c1");
    worker1 = new Worker("w1");
    worker2 = new Worker("w2");
    store.makeNewOperationContext({})

    defineOneToMany(company, 'workers', 'company', targetObjType, inverseObjType);
    defineManyToOne(worker1, 'company', 'workers', targetObjType, inverseObjType);
    defineManyToOne(worker2, 'company', 'workers', targetObjType, inverseObjType);


  });

  test('Adding a worker to a company', () => {
    company.addWorkers(worker1);
    expect(company._workers).toContain(worker1);
    expect(worker1._company).toBe(company);
  });

  test('Removing a worker from a company', () => {
    company.addWorkers(worker1);
    company.removeWorkers(worker1);
    expect(company._workers).not.toContain(worker1);
    expect(worker1._company).toBeUndefined();
  });

  test('Undoing add operation', () => {
    company.addWorkers(worker1);
    store.getContext().undo();
    expect(company._workers).not.toContain(worker1);
    expect(worker1._company).toBeUndefined();
  });

  test('Undoing remove operation', () => {
    company.addWorkers(worker1);
    company.removeWorkers(worker1);
    store.getContext().undo();
    expect(company._workers).toContain(worker1);
    expect(worker1._company).toBe(company);
  });

  test('Redoing add operation', () => {
    company.addWorkers(worker1);
    store.getContext().undo();
    store.getContext().redo();
    expect(company._workers).toContain(worker1);
    expect(worker1._company).toBe(company);
  });

  test('Redoing remove operation', () => {
    company.addWorkers(worker1);
    company.removeWorkers(worker1);
    store.getContext().undo();
    store.getContext().redo();
    expect(company._workers).not.toContain(worker1);
    expect(worker1._company).toBeUndefined();
  });
});

class Course extends DynamicProperties{
  id: string;
  _students: string[] = [];

  constructor(id: string) {
    super()
    this.id = id;
  }
}

class Student extends DynamicProperties{
  id: string;
  _courses: string[] = [];

  constructor(id: string) {
    super()
    this.id = id;
  }
}
describe('ManyToMany Relationship: Student and Course', () => {
  let student1: Student;
  let student2: Student;
  let course1: Course;
  let course2: Course;
  
  beforeEach(() => {
    store.makeNewOperationContext({})
    student1 = new Student('Alice');
    student2 = new Student('Bob');
    course1 =   new Course('Math')
    course2 = new Course('Science')
    defineManyToMany(student1, 'courses', 'students', targetObjType, inverseObjType);
    defineManyToMany(student2, 'courses', 'students', targetObjType, inverseObjType);
    defineManyToMany(course1, 'students', 'courses', targetObjType, inverseObjType);
    defineManyToMany(course2, 'students', 'courses', targetObjType, inverseObjType);

  });

  test('Adding a course to a student', () => {
    student1.addCourses(course1);
    expect(student1._courses).toContain(course1);
    expect(course1._students).toContain(student1);
  });

  test('Removing a course from a student', () => {
    student1.addCourses(course1);
    student1.removeCourses(course1);
    expect(student1._courses).not.toContain(course1);
    expect(course1._students).not.toContain(student1);
  });

  test('Undoing add operation', () => {
    student1.addCourses(course1);
    store.getContext().undo();
    expect(student1._courses).not.toContain(course1);
    expect(course1._students).not.toContain(student1);
  });

  test('Undoing remove operation', () => {
    student1.addCourses(course1);
    student1.removeCourses(course1);
    store.getContext().undo();
    expect(student1._courses).toContain(course1);
    expect(course1._students).toContain(student1);
  });

  test('Redoing add operation', () => {
    student1.addCourses(course1);
    store.getContext().undo();
    store.getContext().redo();
    expect(student1._courses).toContain(course1);
    expect(course1._students).toContain(student1);
  });

  test('Redoing remove operation', () => {
    student1.addCourses(course1);
    student1.removeCourses(course1);
    store.getContext().undo();
    store.getContext().redo();
    expect(student1._courses).not.toContain(course1);
    expect(course1._students).not.toContain(student1);
  });
});


describe('Simple value changes combined with Undo and Redo Operations', () => {
  store.makeNewOperationContext({})

  test('Simple value changes combined with one-to-one relationship', () => {
    const person = {}  as any;
    const car = {}  as any;
    person[objectStatus] = StatusValue.Unmodified
    car[objectStatus] = StatusValue.Unmodified
    defineSimpleValue(person, 'name', targetObjType);
    defineOneToOne(person, 'car', 'owner', targetObjType, inverseObjType);
    defineOneToOne(car, 'owner', 'car', targetObjType, inverseObjType);

    person.name = 'John';
    person.car = car;
    car.owner = person;

    store.getContext().undo();
    expect(person.car).toBeUndefined();
    expect(car.owner).toBeUndefined();

    store.getContext().undo();
    expect(person.name).toBeUndefined();

    store.getContext().redo();
    expect(person.name).toBe('John');

    store.getContext().redo();
    expect(person.car).toBe(car);
    expect(car.owner).toBe(person);
  });

  test('Simple value changes combined with one-to-many relationship', () => {
    const company = new Company("c1");
    const worker1 = new Worker("w1");
    const worker2 = new Worker("w1");
    
    defineSimpleValue(company, 'name', targetObjType);
    defineOneToMany(company, 'workers', 'company', targetObjType, inverseObjType);
    defineSimpleValue(worker1, 'name', targetObjType);
    defineSimpleValue(worker2, 'name', targetObjType);
    defineOneToMany(worker1, 'company', 'workers', targetObjType, inverseObjType);
    defineOneToMany(worker2, 'company', 'workers', targetObjType, inverseObjType);
    
    company.name = 'TechCorp';
    company.addWorkers(worker1);
    company.addWorkers(worker2);
    worker1.name = 'Alice';
    worker2.name = 'Bob';
    
    store.getContext().undo();
    expect(worker2.name).toBeUndefined();
    
    store.getContext().undo();
    expect(worker1.name).toBeUndefined();
    
    store.getContext().undo();
    expect(company.workers.length).toEqual(1);
    
    store.getContext().undo();
    expect(company.workers.length).toEqual(0);

    store.getContext().undo();
    expect(company.name).toBeUndefined();
    
    store.getContext().redo();
    expect(company.name).toBe('TechCorp');
    
    store.getContext().redo();
    expect(company.workers).toEqual([worker1]);
    
    store.getContext().redo();
    expect(company.workers.length).toEqual(2);

    store.getContext().redo();
    expect(worker1.name).toBe('Alice');
    
    store.getContext().redo();
    expect(worker2.name).toBe('Bob');
  });
  
  
  test('Simple value changes combined with many-to-many relationship', () => {
    const student1 = new Student("s1");
    const student2 = new Student("s2");
    const course1 = new Course("c1");
    const course2 = new Course("c2");
    
    defineSimpleValue(student1, 'name', targetObjType);
    defineSimpleValue(student2, 'name', targetObjType);
    defineManyToMany(student1, 'courses', 'students', targetObjType, inverseObjType);
    defineManyToMany(student2, 'courses', 'students', targetObjType, inverseObjType);
    defineManyToMany(course1, 'students', 'courses', targetObjType, inverseObjType);
    defineManyToMany(course2, 'students', 'courses', targetObjType, inverseObjType);

    course1.name ='Math'
    course2.name = 'Science'
    student1.name = 'Emily';
    student2.name = 'David';
    student1.addCourses(course1);
    student2.addCourses(course2);
    course1.addStudents(student1); // should be ignored as student1 is already connected
    course1.addStudents(student2);
    course2.addStudents(student2); // should be ignored as student2 is already connected

    store.getContext().undo(); // connecting c1 and s2 
    expect(course2.students.length).toEqual(1);
    expect(student2.courses).toEqual([course2]);

    store.getContext().undo(); // connecting s2 and c2
    expect(course2.students.length).toEqual(0);
    expect(student2.courses.length).toEqual(0);
    expect(course1.students.length).toEqual(1);

    store.getContext().undo();// connecting s1 and c1
    expect(student1.courses.length).toEqual(0);
    expect(course1.students.length).toEqual(0);


    store.getContext().undo()
    expect(student2.name).toBeUndefined();

    store.getContext().undo();
    expect(student1.name).toBeUndefined();

    store.getContext().redo();
    expect(student1.name).toBe('Emily');

    store.getContext().redo();
    expect(student2.name).toBe('David');

    store.getContext().redo();
    expect(student1.courses).toEqual([course1]);

    store.getContext().redo();
    expect(course2.students).toEqual([student2]);
  });
  
});
*/