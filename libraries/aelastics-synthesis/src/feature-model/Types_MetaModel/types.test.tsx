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
  <TypeModel name="FirstTypeModel" store={store}>
    {importPredefinedTypes("../FirstTypeModel")}
    <TypeObject name="Person">
      <Property name="firstName">
        <PropertyDomain $refByName="number"></PropertyDomain>
      </Property>
      <Property name="address" />
      <Property name="age" />
    </TypeObject>

    <TypeObject name="Company">
      <Property name="companyName">
        <PropertyDomain $refByName="string" />
      </Property>
    </TypeObject>

    <TypeOptional name="OptionalCompany">
      <TypeOfOptional $refByName="Company" />
    </TypeOptional>

    <TypeSubtype name="Worker">
      <Property name="professon" />
      <Property name="salary" />
      <TypeSupertype $refByName="Person"></TypeSupertype>
      <Property name="workingCompany">
        <PropertyDomain $refByName="OptionalCompany" />
      </Property>
    </TypeSubtype>
    <TypeObject name="Place">
      <Property name="name">
        <PropertyDomain $refByName="string" />
      </Property>
    </TypeObject>

    {/* prvi nacin. lose zato sto se pravi apstraktni tip, ako se zaboravi ref_local_id */}
    {/* <TypeOptional name="SomeOptionalType">
      <TypeOfOptional $refByName="Person"></TypeOfOptional>
      <TypeOfOptional $refByName="Person"></TypeOfOptional>
    </TypeOptional>

    <TypeOptional name="SomeOptionalType2">
      <TypeOfOptional $refByName="Person"></TypeOfOptional>
      <TypeOfOptional $refByName="Person"></TypeOfOptional>
    </TypeOptional> */}

    {/* drugi nacin. testirati da li radi */}

    {/* <TypeOptional
      name="Opcioni tip"
      optionalType={<TypeObject $refByName="OpcioniObjekat"></TypeObject>}
    ></TypeOptional> */}

    {/* treci nacin je da se uvede specijali jsx element REF. napraviti i testirati da li radi */}
    {/* <TypeOptional name="Opcioni tip" optionalType={<Ref $ref_local_id="2" />}></TypeOptional> */}
    {/* <TypeOptional
      name="Opcioni tip"
      optionalType={
        <TypeObject $refByName="OpcioniObjekat">
          <Property name="prop5" />
        </TypeObject>
      }
    ></TypeOptional> */}
  </TypeModel>
);

let model: t.ITypeModel = typeModel.render(new Context());

describe("Type instance", () => {
  it("Test model instance", () => {
    expect(model).toHaveProperty("name", "FirstTypeModel");
  });

  it("Test object type", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "FirstTypeModel",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "Person",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "age" }),
              expect.objectContaining({ name: "address" }),
              expect.objectContaining({ name: "firstName" }),
            ]),
          }),
        ]),
      })
    );
  });

  it("Test subtype type", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "FirstTypeModel",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "Worker",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "professon" }),
              expect.objectContaining({ name: "salary" }),
            ]),
          }),
        ]),
      })
    );
  });

  it("Test optional type", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "FirstTypeModel",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "OptionalCompany",
          }),
        ]),
      })
    );
  });

  it("Test optional property", () => {
    expect(model).toEqual(
      expect.objectContaining({
        name: "FirstTypeModel",
        elements: expect.arrayContaining([
          expect.objectContaining({
            name: "Worker",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "workingCompany" }),
            ]),
          }),
        ]),
      })
    );
  });

  it("Test optional property relation", () => {
    let workerType = model.elements.find((e) => e.name == "Worker");
    let optCompanyProperty = (workerType as t.IObject).properties.find(
      (e) => e.name == "workingCompany"
    );

    let optCompanyType = model.elements.find(
      (e) => e.name == "OptionalCompany"
    );

    let companyType = model.elements.find(
      (e) => e.name == "Company"
    );

    expect((optCompanyProperty as t.IProperty).domain).toBe(optCompanyType);
    expect((optCompanyProperty as t.IProperty).domain).not.toBe(companyType);
  });

  // TODO: srediti ako postoji bolji nacin
  // provera da li je superType attributa na Subtype tipu
  // expect((model.elements[5] as t.ISubtype).superType).toEqual(
  //   model.elements[1] as t.IType
  // );

  // it("Test optional type", () => {
  //   expect(model).toEqual(
  //     expect.objectContaining({
  //       name: "PrviTypeModel",
  //       elements: expect.arrayContaining([
  //         expect.objectContaining({
  //           name: "Opcioni tip",
  //         }),
  //       ]),
  //     })
  //   );
  // });
});
