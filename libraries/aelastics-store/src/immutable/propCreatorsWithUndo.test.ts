import { defineOneToOne, undo, redo, defineManyToOne, defineOneToMany, defineManyToMany, defineSimpleValue } from '././propCreatorsWithUndo'; // Replace with the actual module where these functions are defined

class Boss {
  name: string;
  company?: Company;

  constructor(name: string) {
    this.name = name;
    defineOneToOne(this, 'company', 'boss');
  }
}

class Company {
  name: string;
  boss?: Boss;

  constructor(name: string) {
    this.name = name;
    defineOneToOne(this, 'boss', 'company');
  }
}

describe('Undo and Redo functionality', () => {
  let boss1: Boss;
  let boss2: Boss;
  let company1: Company;
  let company2: Company;

  beforeEach(() => {
    boss1 = new Boss('Alice');
    boss2 = new Boss('Bob');
    company1 = new Company('TechCorp');
    company2 = new Company('BizCorp');
  });

  test('Undo should revert the last operation', () => {
    boss1.company = company1;
    expect(boss1.company).toBe(company1);
    expect(company1.boss).toBe(boss1);

    undo();

    expect(boss1.company).toBeUndefined();
    expect(company1.boss).toBeUndefined();
  });

  test('Redo should reapply the last undone operation', () => {
    boss1.company = company1;
    undo();
    redo();

    expect(boss1.company).toBe(company1);
    expect(company1.boss).toBe(boss1);
  });

  test('Undo and Redo should handle multiple operations', () => {
    boss1.company = company1;
    boss2.company = company2;

    undo();
    expect(boss2.company).toBeUndefined();
    expect(company2.boss).toBeUndefined();

    undo();
    expect(boss1.company).toBeUndefined();
    expect(company1.boss).toBeUndefined();

    redo();
    expect(boss1.company).toBe(company1);
    expect(company1.boss).toBe(boss1);

    redo();
    expect(boss2.company).toBe(company2);
    expect(company2.boss).toBe(boss2);
  });
});



describe('OneToMany and ManyToOne Relationship: Company and Worker', () => {
  let company: any;
  let worker1: any;
  let worker2: any;

  beforeEach(() => {
    company = {};
    worker1 = {};
    worker2 = {};

    defineOneToMany(company, 'workers', 'company');
    defineManyToOne(worker1, 'company', 'workers');
    defineManyToOne(worker2, 'company', 'workers');
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
    undo();
    expect(company._workers).not.toContain(worker1);
    expect(worker1._company).toBeUndefined();
  });

  test('Undoing remove operation', () => {
    company.addWorkers(worker1);
    company.removeWorkers(worker1);
    undo();
    expect(company._workers).toContain(worker1);
    expect(worker1._company).toBe(company);
  });

  test('Redoing add operation', () => {
    company.addWorkers(worker1);
    undo();
    redo();
    expect(company._workers).toContain(worker1);
    expect(worker1._company).toBe(company);
  });

  test('Redoing remove operation', () => {
    company.addWorkers(worker1);
    company.removeWorkers(worker1);
    undo();
    redo();
    expect(company._workers).not.toContain(worker1);
    expect(worker1._company).toBeUndefined();
  });
});



describe('ManyToMany Relationship: Student and Course', () => {
  let student1: any;
  let student2: any;
  let course1: any;
  let course2: any;

  beforeEach(() => {
    student1 = { name: 'Alice' };
    student2 = { name: 'Bob' };
    course1 = { name: 'Math' };
    course2 = { name: 'Science' };

    defineManyToMany(student1, 'courses', 'students');
    defineManyToMany(student2, 'courses', 'students');
    defineManyToMany(course1, 'students', 'courses');
    defineManyToMany(course2, 'students', 'courses');
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
    undo();
    expect(student1._courses).not.toContain(course1);
    expect(course1._students).not.toContain(student1);
  });

  test('Undoing remove operation', () => {
    student1.addCourses(course1);
    student1.removeCourses(course1);
    undo();
    expect(student1._courses).toContain(course1);
    expect(course1._students).toContain(student1);
  });

  test('Redoing add operation', () => {
    student1.addCourses(course1);
    undo();
    redo();
    expect(student1._courses).toContain(course1);
    expect(course1._students).toContain(student1);
  });

  test('Redoing remove operation', () => {
    student1.addCourses(course1);
    student1.removeCourses(course1);
    undo();
    redo();
    expect(student1._courses).not.toContain(course1);
    expect(course1._students).not.toContain(student1);
  });
});


describe('Simple value changes combined with Undo and Redo Operations', () => {
  test('Simple value changes combined with one-to-one relationship', () => {
    const person = {}  as any;
    const car = {}  as any;
    defineSimpleValue(person, 'name');
    defineOneToOne(person, 'car', 'owner');
    defineOneToOne(car, 'owner', 'car');

    person.name = 'John';
    person.car = car;
    car.owner = person;

    undo();
    expect(person.car).toBeUndefined();
    expect(car.owner).toBeUndefined();

    undo();
    expect(person.name).toBeUndefined();

    redo();
    expect(person.name).toBe('John');

    redo();
    expect(person.car).toBe(car);
    expect(car.owner).toBe(person);
  });
  test('Simple value changes combined with one-to-many relationship', () => {
    const company = {} as any;
    const worker1 = {} as any;
    const worker2 = {} as any;
    defineSimpleValue(company, 'name');
    defineOneToMany(company, 'workers', 'company');
    defineSimpleValue(worker1, 'name');
    defineSimpleValue(worker2, 'name');
    
    company.name = 'TechCorp';
    company.addWorkers(worker1);
    company.addWorkers(worker2);
    worker1.name = 'Alice';
    worker2.name = 'Bob';
    
    undo();
    expect(worker2.name).toBeUndefined();
    
    undo();
    expect(worker1.name).toBeUndefined();
    
    undo();
    expect(company.workers.length).toEqual(1);
    
    undo();
    expect(company.workers.length).toEqual(0);

    undo();
    expect(company.name).toBeUndefined();
    
    redo();
    expect(company.name).toBe('TechCorp');
    
    redo();
    expect(company.workers).toEqual([worker1]);
    
    redo();
    expect(company.workers.length).toEqual(2);

    redo();
    expect(worker1.name).toBe('Alice');
    
    redo();
    expect(worker2.name).toBe('Bob');
  });
  
  
  test('Simple value changes combined with many-to-many relationship', () => {
    const student1 = {} as any;
    const student2 = {} as any;
    const course1 = {} as any;
    const course2 = {} as any;
    defineSimpleValue(student1, 'name');
    defineSimpleValue(student2, 'name');
    defineManyToMany(student1, 'courses', 'students');
    defineManyToMany(student2, 'courses', 'students');
    defineManyToMany(course1, 'students', 'courses');
    defineManyToMany(course2, 'students', 'courses');

    course1.name ='Math'
    course2.name = 'Science'
    student1.name = 'Emily';
    student2.name = 'David';
    student1.addCourses(course1);
    student2.addCourses(course2);
    course1.addStudents(student1); // should be ignored as student1 is already connected
    course1.addStudents(student2);
    course2.addStudents(student2); // should be ignored as student2 is already connected

    undo(); // connecting c1 and s2 
    expect(course2.students.length).toEqual(1);
    expect(student2.courses).toEqual([course2]);

    undo(); // connecting s2 and c2
    expect(course2.students.length).toEqual(0);
    expect(student2.courses.length).toEqual(0);
    expect(course1.students.length).toEqual(1);

    undo();// connecting s1 and c1
    expect(student1.courses.length).toEqual(0);
    expect(course1.students.length).toEqual(0);


    undo()
    expect(student2.name).toBeUndefined();

    undo();
    expect(student1.name).toBeUndefined();

    redo();
    expect(student1.name).toBe('Emily');

    redo();
    expect(student2.name).toBe('David');

    redo();
    expect(student1.courses).toEqual([course1]);

    redo();
    expect(course2.students).toEqual([student2]);
  });
  
});
