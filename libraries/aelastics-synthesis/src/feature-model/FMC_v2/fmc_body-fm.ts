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
        cena: t.number, // attribute

        // primer 1

        // exclusiveGroup: t.taggedUnion(
        //   {
        //     Standard: t.object({}, "Standard", FMC_BodyFM_TypeSchema),
        //     Adaptive: t.arrayOf(
        //       t.object({}, "Adaptive", FMC_BodyFM_TypeSchema)
        //     ),
        //   },
        //   "desc",
        //   "exclusiveGroup"
        // ),


        // primer 2

        exclusiveGroup: t.optional(
            t.object({
            attribute: t.string, // atribute
            Standard: t.object({}, "Standard", FMC_BodyFM_TypeSchema),
            Standard2: t.optional(t.object({}, "Standard", FMC_BodyFM_TypeSchema)),
            Adaptive: t.arrayOf(
              t.object({}, "Adaptive", FMC_BodyFM_TypeSchema)
            ),
        }, 'exclusiveGroup', FMC_BodyFM_TypeSchema)
        .addValidator({predicate: (value) =>  value.Standard != undefined ||  value.Standard2 != undefined,
        message: (value)=> 'neka poruka o gresci' }))
        

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
const exps2 = (c: IbodyElectronicsSystem) => c.cruiseControl;

type UnionTest =
  | { attr1: number; attr3: string }
  | { attr2: string; attr4: boolean };

type TestType = {
  name: string;
  exclusiveGroup: UnionTest;
  descr: "prvi" | "drugi";
};

const ddd: TestType = {
  name: "ime",
  exclusiveGroup: { attr4: true, attr2: "sfdsff" },
  descr: "prvi",
};

const aaa = (p: TestType) =>
  (<{ attr2: string; attr4: boolean }>p.exclusiveGroup).attr4;


  const aaa2 = (p: TestType) => p.exclusiveGroup.attr4? p.exclusiveGroup.attr4