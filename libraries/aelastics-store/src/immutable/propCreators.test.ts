import { defineManyToMany, defineManyToOne, defineOneToMany, defineOneToOne } from './propCreators';

// Jest test cases
describe('Testing One-to-One relationship', () => {
    let boss: any;
    let company: any;
  
    beforeEach(() => {
      boss = {};
      company = {};
  
      defineOneToOne(boss, 'company', 'boss');
      defineOneToOne(company, 'boss', 'company');
    });
  
    test('Initial state', () => {
      expect(boss.company).toBeUndefined();
      expect(company.boss).toBeUndefined();
    });
  
    test('Setting relationship', () => {
      boss.company = company;
      expect(boss.company).toBe(company);
      expect(company.boss).toBe(boss);
    });
  
    test('Updating relationship', () => {
      const newCompany = {} as any;
      defineOneToOne(newCompany, 'boss', 'company');
  
      boss.company = newCompany;
      expect(boss.company).toBe(newCompany);
      expect(newCompany.boss).toBe(boss);
      expect(company.boss).toBeUndefined();
    });
  
    test('Removing relationship', () => {
      boss.company = company;
      boss.company = undefined;
  
      expect(boss.company).toBeUndefined();
      expect(company.boss).toBeUndefined();
    });
    test('complex reconnecting', ()=> {
        const boss2 = {} as any;
        const company2 = {} as any;
    
        defineOneToOne(boss2, 'company', 'boss');
        defineOneToOne(company2, 'boss', 'company');
        boss.company = company
        boss2.company = company2

        boss.company = company2

        expect(company.boss).toBeUndefined();
        expect(company2.boss).toBe(boss);
        expect(boss2.company).toBeUndefined;
        
    }
    )
  });
  
  // Jest test cases for One-to-Many and Many-to-One relationships
describe('One-to-Many and Many-to-One relationships', () => {
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
  
    test('Initial state', () => {
      expect(company.workers).toEqual(expect.arrayContaining([]));
      expect(worker1.company).toBeUndefined();
      expect(worker2.company).toBeUndefined();
    });
  
    test('Adding workers to company', () => {
      company.addWorkers(worker1);
      company.addWorkers(worker2);
  
      expect(company.workers).toEqual(expect.arrayContaining([worker1, worker2]));
      expect(worker1.company).toBe(company);
      expect(worker2.company).toBe(company);
    });
  
    test('Removing a worker from company', () => {
      company.addWorkers(worker1);
      company.addWorkers(worker2);
      company.removeWorkers(worker1);
  
      expect(company.workers).toEqual(expect.arrayContaining([worker2]));
      expect(worker1.company).toBeUndefined();
      expect(worker2.company).toBe(company);
    });
  
    test('Updating worker\'s company', () => {
      const newCompany = {} as any;
      defineOneToMany(newCompany, 'workers', 'company');
  
      company.addWorkers(worker1);
      newCompany.addWorkers(worker1);
  
      expect(company.workers).toEqual(expect.arrayContaining([]));
      expect(newCompany.workers).toEqual(expect.arrayContaining([worker1]));
      expect(worker1.company).toBe(newCompany);
    });
  });

  // Jest test cases for Many-to-Many relationships
describe('Many-to-Many relationships', () => {
    let student1: any;
    let student2: any;
    let course1: any;
    let course2: any;
  
    beforeEach(() => {
      student1 = {};
      student2 = {};
      course1 = {};
      course2 = {};
  
      defineManyToMany(student1, 'courses', 'students');
      defineManyToMany(student2, 'courses', 'students');
      defineManyToMany(course1, 'students', 'courses');
      defineManyToMany(course2, 'students', 'courses');
    });
  
    test('Initial state', () => {
      expect(student1.courses).toEqual(expect.arrayContaining([]));
      expect(student2.courses).toEqual(expect.arrayContaining([]));
      expect(course1.students).toEqual(expect.arrayContaining([]));
      expect(course2.students).toEqual(expect.arrayContaining([]));
    });
  
    test('Adding courses to student and vice versa', () => {
      student1.addCourses(course1);
      student2.addCourses(course2);
  
      expect(student1.courses).toEqual(expect.arrayContaining([course1]));
      expect(student2.courses).toEqual(expect.arrayContaining([course2]));
      expect(course1.students).toEqual(expect.arrayContaining([student1]));
      expect(course2.students).toEqual(expect.arrayContaining([student2]));
    });
  
    test('Removing a course from student and vice versa', () => {
      student1.addCourses(course1);
      student1.removeCourses(course1);
  
      expect(student1.courses).toEqual(expect.arrayContaining([]));
      expect(course1.students).toEqual(expect.arrayContaining([]));
    });
  
    test('Updating student\'s courses', () => {
      student1.addCourses(course1);
      student1.addCourses(course2);
  
      expect(student1.courses).toEqual(expect.arrayContaining([course1, course2]));
      expect(course1.students).toEqual(expect.arrayContaining([student1]));
      expect(course2.students).toEqual(expect.arrayContaining([student1]));
    });
  });
  
  