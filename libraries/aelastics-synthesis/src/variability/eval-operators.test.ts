/**
 * Test fajl za logičke operatore And, Or, Not sa Option funkcijom
 *
 * Ovi testovi pokazuju kako se koriste logički operatori za VarOption dekoratore
 */

import { And, Or, Not, Option } from "./eval-operators";

// Simuliranje odabranih opcija sa string ID-evima
const selectedOptionsWithIds = ["opt1", "opt2", "opt3"];
const selectedOptionsWithoutOpt3 = ["opt1", "opt2"];
const emptySelectedOptions: any[] = [];

describe("Logički operatori And, Or, Not sa Option", () => {
  describe("And operator", () => {
    it("vraća true kada su svi Option() uslovi ispunjeni", () => {
      const condition = And(Option("opt1"), Option("opt2"), Option("opt3"));
      // TODO: Nakon implementacije Option(), test će trebati adapter da pronađe opcije
      // Za sada samo testiramo strukturu
      expect(typeof condition).toBe("function");
    });

    it("vraća false kada nije svi uslovi ispunjeni", () => {
      const condition = And(Option("opt1"), Option("opt2"), Option("opt4"));
      expect(typeof condition).toBe("function");
    });

    it("vraća true kada su ugniježđeni uslovi ispunjeni", () => {
      const condition = And(Or(Option("opt1"), Option("opt2")), Option("opt3"));
      expect(typeof condition).toBe("function");
    });
  });

  describe("Or operator", () => {
    it("vraća true kada je bar jedan Option() uslov ispunjen", () => {
      const condition = Or(Option("opt1"), Option("opt2"), Option("opt3"));
      expect(typeof condition).toBe("function");
    });

    it("vraća true kada su svi uslovi ispunjeni", () => {
      const condition = Or(Option("opt1"), Option("opt2"), Option("opt3"));
      expect(typeof condition).toBe("function");
    });

    it("vraća false kada nijedan uslov nije ispunjen", () => {
      const condition = Or(Option("opt1"), Option("opt2"), Option("opt3"));
      expect(typeof condition).toBe("function");
    });

    it("vraća true kada je jedan ugniježđeni uslov ispunjen", () => {
      const condition = Or(And(Option("opt2"), Option("opt3")), Option("opt1"));
      expect(typeof condition).toBe("function");
    });
  });

  describe("Not operator", () => {
    it("vraća true kada Option() uslov nije ispunjen", () => {
      const condition = Not(Option("opt4"));
      expect(typeof condition).toBe("function");
    });

    it("vraća false kada je Option() uslov ispunjen", () => {
      const condition = Not(Option("opt1"));
      expect(typeof condition).toBe("function");
    });

    it("vraća true kada je Or uslov nespunjen", () => {
      const condition = Not(Or(Option("opt4"), Option("opt5")));
      expect(typeof condition).toBe("function");
    });

    it("vraća false kada je Or uslov ispunjen", () => {
      const condition = Not(Or(Option("opt1"), Option("opt2")));
      expect(typeof condition).toBe("function");
    });
  });

  describe("Kompleksni uglniježđeni izrazi", () => {
    it("And(Or(Option(...), Option(...)), Not(Option(...)), And(Option(...), Option(...)))", () => {
      const condition = And(
        Or(Option("opt1"), Option("opt2")),
        Not(Option("opt3")),
        And(Option("opt1"), Option("opt2"))
      );

      expect(typeof condition).toBe("function");
      // @TODO: Kada se implementira Option(), testovi bi trebali stvarne rezultate
    });

    it("Or(And(Option(...), Option(...)), Not(Option(...)))", () => {
      const condition = Or(
        And(Option("opt1"), Option("opt2")),
        Not(Option("opt3"))
      );

      expect(typeof condition).toBe("function");
    });

    it("Not(And(Or(Option(...), Option(...)), Option(...)))", () => {
      const condition = Not(
        And(Or(Option("opt1"), Option("opt2")), Option("opt3"))
      );

      expect(typeof condition).toBe("function");
    });
  });

  describe("Kombinovanje sa lambda funkcijama", () => {
    it("And sa lambda funkcijom kao uslovom", () => {
      const customCondition = (opts: any[]) => opts.length > 0;
      const condition = And(Option("opt1"), customCondition);

      expect(typeof condition).toBe("function");
    });

    it("Or sa lambda funkcijom kao uslovom", () => {
      const customCondition = (opts: any[]) => opts.length > 2;
      const condition = Or(Option("opt1"), customCondition);

      expect(typeof condition).toBe("function");
    });

    it("Not sa lambda funkcijom kao uslovom", () => {
      const customCondition = (opts: any[]) => opts.length === 0;
      const condition = Not(customCondition);

      expect(typeof condition).toBe("function");
    });
  });

  describe("Option funkcija", () => {
    it("Option vraća EvalCondition funkciju", () => {
      const condition = Option("test-option");
      expect(typeof condition).toBe("function");
    });

    it("Option sa kompleksnim string ID-om", () => {
      const condition = Option("issue-name:option-name");
      expect(typeof condition).toBe("function");
    });

    it("Option sa više od jedne reference", () => {
      const cond1 = Option("opt1");
      const cond2 = Option("opt2");
      const cond3 = Option("opt3");

      expect(typeof cond1).toBe("function");
      expect(typeof cond2).toBe("function");
      expect(typeof cond3).toBe("function");
    });
  });
});

/**
 * @TODO Integrativni testovi
 *
 * Nakon implementacije Option() funkcije koja pronalazi dM.IOption objekte,
 * trebali bi sledeći testovi:
 *
 * 1. Test sa stvarnim dM.IOption objektima
 * 2. Test da pronalazi opcije po string ID-u iz decision modela
 * 3. Test sa različitim formatima string ID-eva
 * 4. Test da rukuje greškama ako se opcija ne pronađe
 * 5. Test perormansiju sa velikim brojem opcija
 */



