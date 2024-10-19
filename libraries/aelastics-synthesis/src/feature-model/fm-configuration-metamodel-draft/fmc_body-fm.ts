/**
 *
 */

import * as t from "aelastics-types";

export const FMC_BodyFM_TypeSchema = t.schema("FMC_BodyFM_TypeSchema");

export const bodyElectronicsSystem = t.object(
  {
    wiper: t.arrayOf(
      t.object(
        {
          constant: t.object({}, "constant", FMC_BodyFM_TypeSchema),
          constant2: t.object({}, "constant", FMC_BodyFM_TypeSchema),
        },
        "wiper",
        FMC_BodyFM_TypeSchema
      )
    ),
    cruiseControl: t.object(
      {
        price: t.number, // attribute

        // example 1

        exclusiveGroup: t.taggedUnion(
          {
            Standard: t.object({ name: t.string }, "Standard", FMC_BodyFM_TypeSchema),
            Adaptive: t.arrayOf(
              t.object({ qty: t.number }, "Adaptive", FMC_BodyFM_TypeSchema)
            ),
          },
          "desc",
          "exclusiveGroup"
        ),

        exclusiveGroup2: t.arrayOf(
          t.taggedUnion(
            {
              Standard: t.object({ name: t.string }, "Standard", FMC_BodyFM_TypeSchema),
              Adaptive: t.arrayOf(
                t.object({ qty: t.number }, "Adaptive", FMC_BodyFM_TypeSchema)
              ),
            },
            "desc",
            "exclusiveGroup"
          )
        ),
        exclusiveGroup3: t.taggedUnion(
          {
            Standard: t.object({ name: t.string }, "Standard", FMC_BodyFM_TypeSchema),
            Adaptive: t.object({ qty: t.number }, "Adaptive", FMC_BodyFM_TypeSchema)
            ,
          },
          "desc",
          "exclusiveGroup"
        ),

        inclusiveGroup: t.object({
          Standard: t.arrayOf(t.object({ name: t.string }, "Standard", FMC_BodyFM_TypeSchema)),
          Adaptive: t.arrayOf(
            t.object({ qty: t.number }, "Adaptive", FMC_BodyFM_TypeSchema)
          ),
          D: t.object({ name: t.string }, "D", FMC_BodyFM_TypeSchema),
        }, "inclusiveGroup", FMC_BodyFM_TypeSchema),

        inclusiveGroup2: t.arrayOf(
          t.taggedUnion(
            {
              Standard: t.object({ name: t.string }, "Standard", FMC_BodyFM_TypeSchema),
              Adaptive: t.object({ qty: t.number }, "Adaptive", FMC_BodyFM_TypeSchema),
              D: t.object({ name: t.string }, "D", FMC_BodyFM_TypeSchema),

            },
            "desc",
            "exclusiveGroup"
          )
        ),

        inclusiveGroup3: t.object({
          Standard: t.optional(t.arrayOf(t.object({ name: t.string }, "Standard", FMC_BodyFM_TypeSchema))),
          Adaptive: t.optional(t.arrayOf(
            t.object({ qty: t.number }, "Adaptive", FMC_BodyFM_TypeSchema)
          )),
          D: t.optional(t.object({ name: t.string }, "D", FMC_BodyFM_TypeSchema)),
        }, "inclusiveGroup", FMC_BodyFM_TypeSchema),




        // example 2

        // exclusiveGroup: t.optional(
        //   t
        //     .object(
        //       {
        //         attribute: t.string, // atribute
        //         Standard: t.object({}, "Standard", FMC_BodyFM_TypeSchema),
        //         Standard2: t.optional(
        //           t.object({}, "Standard", FMC_BodyFM_TypeSchema)
        //         ),
        //         Adaptive: t.arrayOf(
        //           t.object({}, "Adaptive", FMC_BodyFM_TypeSchema)
        //         ),
        //       },
        //       "exclusiveGroup",
        //       FMC_BodyFM_TypeSchema
        //     )
        //     .addValidator({
        //       predicate: (value) =>
        //         value.Standard != undefined || value.Standard2 != undefined,
        //       message: (value) => "Some error message",
        //     })
        // ),
      },
      "cruiseControl",
      FMC_BodyFM_TypeSchema
    ),
    featureLeaf: t.boolean,
    optionalFeature: t.optional(t.boolean),
  },
  "FMC_BodyFM_TypeSchema",
  FMC_BodyFM_TypeSchema
);

export type IbodyElectronicsSystem = t.TypeOf<typeof bodyElectronicsSystem>;

// let c1: IbodyElectronicsSystem = {
//   cruiseControl: ,
//   wiper: [{ constant: {} }, { constant: {} }],
// };

const expre = (c: IbodyElectronicsSystem) => c.wiper[1] && c.cruiseControl;

// po radu, ovo je mozda najispravnija varijanta, jer se uzimaju u obzir i kardinalnosti na elementima unije
const exps21 = (c: IbodyElectronicsSystem) => c.cruiseControl.exclusiveGroup = [{ qty: 2 }, { qty: 3 }];
const exps22 = (c: IbodyElectronicsSystem) => c.cruiseControl.exclusiveGroup = { name: "Standard" };

// ovo nije dobro, jer se mogu koristiti svi tipovi. Ovo nije eksluzivna unija
const exp3 = (c: IbodyElectronicsSystem) => c.cruiseControl.exclusiveGroup2 = [{ name: "Standard" }, { name: "Standard2" }, [{ qty: 2 }, { qty: 3 }]];

// ovo je exclusiveGroup3. Slicna je kao exclusiveGroup, ali umesto niza se koristi objekat, tako da nije moguce imati varijantu sa vise instanci
const exp4 = (c: IbodyElectronicsSystem) => c.cruiseControl.exclusiveGroup3 = { name: "Standard" };
const exp5 = (c: IbodyElectronicsSystem) => c.cruiseControl.exclusiveGroup3 = { qty: 2 };


// inclusiveGroup. kako su po radu sve varijante vestacki opcione, ovo je mozda najbolje resenje.
const exp6 = (c: IbodyElectronicsSystem) => c.cruiseControl.inclusiveGroup = {
  Standard: [{ name: "Standard" }],
  D: { name: "D" },
  Adaptive: [{ qty: 2 }]
  // Adaptive: undefined
};

// kako su po radu sve varijante vestacki opcione, ovo je mozda najbolje resenje.
const exp8 = (c: IbodyElectronicsSystem) => c.cruiseControl.inclusiveGroup3 = {
  Standard: [{ name: "Standard" }],
  // D: { name: "D" },
  D: undefined,
  // Adaptive: []
  Adaptive: undefined
};



// inclusiveGroup2
const exp7 = (c: IbodyElectronicsSystem) => c.cruiseControl.inclusiveGroup2 = [
  { name: "Standard" },
  { name: "D" },
  { qty: 2 }
];










type UnionTest =
  | { attr1: number; attr3: string }
  | { attr2: string; attr4: boolean };

type TestType = {
  name: string;
  exclusiveGroup: UnionTest;
  descr: "first" | "second";
};

const ddd: TestType = {
  name: "name",
  exclusiveGroup: { attr4: true, attr2: "sfdsff" },
  descr: "first",
};

const aaa = (p: TestType) =>
  (<{ attr2: string; attr4: boolean }>p.exclusiveGroup).attr4;

//   const aaa2 = (p: TestType) => p.exclusiveGroup.attr4? p.exclusiveGroup.attr4
