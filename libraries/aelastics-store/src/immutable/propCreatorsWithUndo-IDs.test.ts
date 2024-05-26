import * as t from "aelastics-types"
import {
  defineComplexArrayProp,
  defineComplexObjectProp,
  defineManyToMany,
  defineManyToOne,
  defineOneToMany,
  defineOneToOne,
} from "./propCreatorsWithUndo" // Replace with the actual import
import { OperationContext } from "./operation-context"
import { uuidv4Generator } from "./repository"
import { ImmutableStore } from "./immutable-store"

class DynamicProperties {
  [key: string]: any
}

const schema = t.schema("schema")

// Define the object types for test
const PersonTYPE = t.object(
  {
    id: t.string,
    name: t.string,
    car: t.optional(t.link(schema, "CarTYPE", "CarTYPE")),
  },
  "PersonTYPE",
  schema
)
const CarTYPE = t.object(
  {
    id: t.string,
    name: t.string,
    owner: t.optional(PersonTYPE),
  },
  "CarTYPE",
  schema
)

const store = new ImmutableStore(PersonTYPE)
store.makeNewOperationContext()

describe("One-to-One Relationship with ID", () => {
  test("should set and get one-to-one relationship with ID", () => {
    class Person extends DynamicProperties {
      id: string
      "@@aelastics/ID": string
      constructor(id: string) {
        super()
        this.id = id
        this["@@aelastics/ID"] = uuidv4Generator()
      }
    }

    class Car extends DynamicProperties {
      id: string
      "@@aelastics/ID": string
      constructor(id: string) {
        super()
        this.id = id
        this["@@aelastics/ID"] = uuidv4Generator()
      }
    }

    const person1 = new Person("p1")
    const person2 = new Person("p2")
    const car1 = new Car("c1")
    const car2 = new Car("c2")

    store.getContext().idMap.set(person1["@@aelastics/ID"], person1)
    store.getContext().idMap.set(person2["@@aelastics/ID"], person2)
    store.getContext().idMap.set(car1["@@aelastics/ID"], car1)
    store.getContext().idMap.set(car2["@@aelastics/ID"], car2)

    const personType: t.AnyObjectType = {} as any
    const carType: t.AnyObjectType = {} as any
 

    defineOneToOne(Person.prototype, "car", "owner", personType, carType, store, true, false)
    defineOneToOne(Car.prototype, "owner", "car", carType, personType, store, false, true)

    // Set relationships
    person1.car = car1
    car2.owner = person2

    // Test relationships
    expect(person1.car).toBe(car1)
    expect(car1.owner).toBe(person1)
    expect(person2.car).toBe(car2)
    expect(car2.owner).toBe(person2)

    // Change relationships
    person1.car = car2
    car1.owner = person2

    // Test changed relationships
    expect(person1.car).toBe(car2)
    expect(car2.owner).toBe(person1)
    expect(person2.car).toBe(car1)
    expect(car1.owner).toBe(person2)
  })
})

class Company extends DynamicProperties {
  id: string
  "@@aelastics/ID": string
  constructor(id: string) {
    super()
    this.id = id
    this["@@aelastics/ID"] = uuidv4Generator()
  }
}

class Worker extends DynamicProperties {
  id: string
  "@@aelastics/ID": string
  constructor(id: string) {
    super()
    this.id = id
    this["@@aelastics/ID"] = uuidv4Generator()
  }
}

describe("One-to-Many Relationship with ID", () => {
  let context: OperationContext<unknown>

  beforeEach(() => {
    context = new OperationContext()
    store.getContext().idMap = new Map()
  })

  test("should set and get one-to-many relationship with ID", () => {
    const company1 = new Company("c1")
    const worker1 = new Worker("w1")
    const worker2 = new Worker("w2")
    const worker3 = new Worker("w3")

    store.getContext().idMap.set(company1["@@aelastics/ID"], company1)
    store.getContext().idMap.set(worker1["@@aelastics/ID"], worker1)
    store.getContext().idMap.set(worker2["@@aelastics/ID"], worker2)
    store.getContext().idMap.set(worker3["@@aelastics/ID"], worker3)

    const companyType: t.AnyObjectType = {} as any
    const workerType: t.AnyObjectType = {} as any

    defineOneToMany(Company.prototype, "workers", "company", companyType, workerType, store, true, true)
    defineManyToOne(Worker.prototype, "company", "workers", workerType, companyType, store, true, true)

    // Add workers to company
    company1.addWorkers(worker1)
    company1.addWorkers(worker2)
    worker3.company = company1

    // Test relationships
    expect(company1.workers).toEqual([worker1, worker2, worker3])
    expect(worker1.company).toBe(company1)
    expect(worker2.company).toBe(company1)
    expect(worker3.company).toBe(company1)

    // Remove a worker from the company
    company1.removeWorkers(worker1)

    // Test changed relationships
    expect(company1.workers).toEqual([worker2, worker3])
    expect(worker1.company).toBeUndefined()
    expect(worker2.company).toBe(company1)
  })
})

class Student extends DynamicProperties {
  id: string
  "@@aelastics/ID": string
  constructor(id: string) {
    super()
    this.id = id
    this["@@aelastics/ID"] = uuidv4Generator()
    this._courses = []
    this._friends = []
  }
}

class Course extends DynamicProperties {
  id: string
  "@@aelastics/ID": string
  constructor(id: string) {
    super()
    this["@@aelastics/ID"] = uuidv4Generator()
    this.id = id
    this._students = []
  }
}

describe("Many-to-Many Relationship with ID", () => {

  beforeEach(() => {
    store.getContext().idMap = new Map()
  })

  test("should set and get many-to-many relationship with ID", () => {
    const student1 = new Student("s1")
    const student2 = new Student("s2")
    const course1 = new Course("c1")
    const course2 = new Course("c2")

    store.getContext().idMap.set(student1["@@aelastics/ID"], student1)
    store.getContext().idMap.set(student2["@@aelastics/ID"], student2)
    store.getContext().idMap.set(course1["@@aelastics/ID"], course1)
    store.getContext().idMap.set(course2["@@aelastics/ID"], course2)

    const studentType: t.AnyObjectType = {} as any
    const courseType: t.AnyObjectType = {} as any

    defineManyToMany(Student.prototype, "courses", "students", studentType, courseType, store, false, true)
    defineManyToMany(Course.prototype, "students", "courses", courseType, studentType, store, true, false)

    // Add courses to students
    student1.addCourses(course1)
    student1.addCourses(course2)

    // Test relationships
    expect(student1.courses).toEqual([course1, course2])
    expect(course1.students).toEqual([student1])
    expect(course2.students).toEqual([student1])

    // Remove a course from the student
    student1.removeCourses(course1)

    // Test changed relationships
    expect(student1.courses).toEqual([course2])
    expect(course1.students).toEqual([])
    expect(course2.students).toEqual([student1])
  })
})

describe("defineComplexObjectProp", () => {
  const WorkerType: t.AnyObjectType = {} as any


  beforeEach(() => {
    store.getContext().idMap = new Map()
  })

  it("should set and get complex object property for Worker", () => {
    defineComplexObjectProp(Worker.prototype, "boss", true, store, WorkerType)

    const worker1 = new Worker("w1")
    const worker2 = new Worker("w2")
    store.getContext().idMap.set(worker1["@@aelastics/ID"], worker1)
    store.getContext().idMap.set(worker2["@@aelastics/ID"], worker2)

    worker1.boss = worker2

    const test3 = worker1.boss

    expect(worker1.boss).toBe(worker2)
    // expect(store.getContext().operationStack.length).toBe(1)
  })
})

describe("defineComplexArrayProp", () => {
  const StudentType: t.AnyObjectType = {} as any

  beforeEach(() => {
    store.getContext().idMap = new Map()
  })

  it("should add and remove items from complex array property for Student", () => {
    defineComplexArrayProp(Student.prototype, "friends", true, store, StudentType)

    const student1 = new Student("1")
    const student2 = new Student("2")
    const student3 = new Student("3")
    store.getContext().idMap.set(student1["@@aelastics/ID"], student1)
    store.getContext().idMap.set(student2["@@aelastics/ID"], student2)
    store.getContext().idMap.set(student3["@@aelastics/ID"], student3)

    student1.addFriends(student2)
    student1.addFriends(student3)

    expect(student1._friends).toEqual([student2["@@aelastics/ID"], student3["@@aelastics/ID"]])
    expect(student1.friends).toEqual([student2, student3])
    // expect(store.getContext().operationStack.length).toBe(2)

    student1.removeFriends(student2)

    expect(student1._friends).toEqual([student3["@@aelastics/ID"]])
    expect(student1.friends).toEqual([student3])
    // expect(store.getContext().operationStack.length).toBe(3)
  })
})
