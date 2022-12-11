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
} from "./types-components";
import { Context } from "../../jsx/context";
import { ModelStore } from "../../jsx/ModelsStore";

// let a = <Object name="ime"></Object>;
// let b = <Object $ref={a}></Object>; // efekat je da je b = a

// let c: t.IType = <Object name="ime" $local_id="55"></Object>;
// let d = <Object $ref_local_id="55"></Object>; // efekat je da je b = a

// let g = c as t.IObject;

// const primeriReferenciranja: Element<t.ITypeModel> = (
//   <TypeModel name="prvi type model" store={store}>
//     <Object name="Objekat" $local_id="1">
//       <Property name="prop1" />
//       <Property name="prop2" />
//       <Property name="prop3" />
//     </Object>
//     <Subtype name="primer subtype objekta">
//       <Supertype $ref_local_id="1"></Supertype>
//       <Property name="prop1 u subtype"></Property>
//       <Property name="prop2 u subtype"></Property>
//     </Subtype>
//   </TypeModel>
// );

const store = new ModelStore();

const typeModel: Element<t.ITypeModel> = (
  <TypeModel name="prvi type model" store={store}>
    <TypeObject name="Objekat" $local_id="1">
      <Property name="prop1" />
      <Property name="prop2" />
      <Property name="prop3" />
    </TypeObject>
    <TypeSubtype name="Subtype">
      <Property name="prop1" />
      <Property name="prop2" />
      <TypeSupertype $ref_local_id="1"></TypeSupertype>
    </TypeSubtype>
    <TypeObject name="OpcioniObjekat" $local_id="2">
      <Property name="prop1" />
      <Property name="prop2" />
      <Property name="prop3" />
    </TypeObject>
    <TypeOptional name="Opcioni tip">
      <TypeOfOptional $ref_local_id="2"></TypeOfOptional>
    </TypeOptional>
  </TypeModel>
);

let model: t.ITypeModel = typeModel.render(new Context());

describe("Type instance", () => {
  it("Test model instance", () => {
    expect(model).toHaveProperty("name", "prvi type model");
  });

  it("Test object type", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "prvi type model",
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
        name: "prvi type model",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "Subtype",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "prop2" }),
              expect.objectContaining({ name: "prop1" }),
            ]),
          }),
        ]),
      })
    );

    // TODO: srediti ako postoji bolji nacin
    // provera da li je superType attributa na Subtype tipu
    expect((model.elements[4] as t.ISubtype).superType).toEqual(
      model.elements[0] as t.IType
    );
  });

  it("Test optional type", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "prvi type model",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "Opcioni tip",
          }),
        ]),
      })
    );

    expect(model.elements.find((e) => e.name == "OpcioniObjekat")).toBe(
      (model.elements.find((e) => e.name == "Opcioni tip") as t.IOptional)
        .optionalType
    );
  });
});
