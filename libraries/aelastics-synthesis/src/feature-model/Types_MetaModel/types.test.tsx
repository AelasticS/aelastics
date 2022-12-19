/** @jsx hm */

import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";
import * as t from "./types-meta.model";
import {
  TypeObject,
  Property,
  TypeSupertype,
  TypeModel,
  TypeSubtype,
  TypeOptional,
  TypeOfOptional,
  PropertyDomain,
} from "./types-components";
import { Context } from "../../jsx/context";
import { ModelStore } from "../../jsx/ModelsStore";

// let a = <Object name="ime"></Object>;
// let b = <Object $ref={a}></Object>; // efekat je da je b = a

// let c: t.IType = <Object name="ime" $local_id="55"></Object>;
// let d = <Object $ref_local_id="55"></Object>; // efekat je da je b = a

// let g = c as t.IObject;

const store = new ModelStore();

// const primeriReferenciranja: Element<t.ITypeModel> = (
//   <TypeModel name="prvi type model" store={store}>
//     <Object name="Objekat" $local_id="1">
//       <Property name="prop1" />
//       <Property name="prop2" />
//       <Property name="prop3" />
//     </Object>

//   </TypeModel>
// );

import { importPredefinedTypes } from "./predefined-model";

const typeModel: Element<t.ITypeModel> = (
  <TypeModel $local_id="PrviTypeModel" name="PrviTypeModel" store={store}>
    {importPredefinedTypes("PrviTypeModel")}
    <TypeObject name="Objekat" $local_id="1">
      <Property name="prop1">
        <PropertyDomain $ref_local_id="number"></PropertyDomain>
      </Property>
      <Property name="prop2" />
      <Property name="prop3" />
    </TypeObject>
    <TypeSubtype name="Subtype">
      <Property name="prop4" />
      <Property name="prop5" />
      <TypeSupertype $ref_local_id="1"></TypeSupertype>
    </TypeSubtype>
    <TypeObject name="OpcioniObjekat" $local_id="2">
      <Property name="prop6" />
    </TypeObject>

    {/* prvi nacin. lose zato sto se pravi apstraktni tip, ako se zaboravi ref_local_id */}
    <TypeOptional name="Opcioni tip">
      <TypeOfOptional $ref_local_id="2"></TypeOfOptional>
      <TypeOfOptional $ref_local_id="2"></TypeOfOptional>
    </TypeOptional>

    {/* drugi nacin. testirati da li radi */}

    {/* <TypeOptional
      name="Opcioni tip"
      optionalType={<TypeObject $ref_local_id="2"></TypeObject>}
    ></TypeOptional> */}

    {/* treci nacin je da se uvede specijali jsx element REF. napraviti i testirati da li radi */}
    {/* <TypeOptional name="Opcioni tip" optionalType={<Ref $ref_local_id="2" />}></TypeOptional> */}
    {/* <TypeOptional
      name="Opcioni tip"
      optionalType={
        <TypeObject name="OpcioniObjekat" $local_id="2">
          <Property name="prop5" />
        </TypeObject>
      }
    ></TypeOptional> */}
  </TypeModel>
);

let model: t.ITypeModel = typeModel.render(new Context());

describe("Type instance", () => {
  it("Test model instance", () => {
    expect(model).toHaveProperty("name", "PrviTypeModel");
  });

  it("Test object type", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "PrviTypeModel",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "Objekat",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "prop3" }),
              expect.objectContaining({ name: "prop2" }),
              expect.objectContaining({ name: "prop1" }),
            ]),
          }),
        ]),
      })
    );
  });

  it("Test subptype type", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "PrviTypeModel",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "Subtype",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "prop4" }),
              expect.objectContaining({ name: "prop5" }),
            ]),
          }),
        ]),
      })
    );

    // TODO: srediti ako postoji bolji nacin
    // provera da li je superType attributa na Subtype tipu
    // expect((model.elements[5] as t.ISubtype).superType).toEqual(
    //   model.elements[1] as t.IType
    // );
  });

  /*
  it("Test optional type", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "PrviTypeModel",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "Opcioni tip",
          }),
        ]),
      })
    );
  });
*/
});
