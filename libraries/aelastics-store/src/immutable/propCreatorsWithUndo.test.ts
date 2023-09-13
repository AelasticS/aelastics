import { defineOneToOne, undo, redo } from '././propCreatorsWithUndo'; // Replace with the actual module where these functions are defined

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
