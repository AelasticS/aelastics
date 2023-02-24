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

// let a = <Object name="name"></Object>;
// let b = <Object $ref={a}></Object>; // same as b = a

// let c: t.IType = <Object name="name" $local_id="55"></Object>;
// let d = <Object $ref_local_id="55"></Object>; // same as je d = c

// let g = c as t.IObject;

const store = new ModelStore();

// const exampleOfReferencing: Element<t.ITypeModel> = (
//   <TypeModel name="TypeModel" store={store}>
//     <Object name="Object" $local_id="1">
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

    {/* TODO method 1: Bad example - if refByName is forgotten, then an abstract type will be created */}
    {/* <TypeOptional name="SomeOptionalType">
      <TypeOfOptional $refByName="Person"></TypeOfOptional>
    </TypeOptional>

    {/* TODO method 2: It should be tested */}
    {/* <TypeOptional
      name="OptionalCompany"
      optionalType={<TypeObject $refByName="Company"></TypeObject>}
    ></TypeOptional> */}

    {/* TODO method 3: create special jsx element REF. It should be implemented and tested */}
    {/* <TypeOptional
      name="OptionalType"
      optionalType={<Ref $ref_local_id="2" />}
    ></TypeOptional> */}

    {/* TODO method 4: what is the meaning of the following code. 
    What is the meaning of the added prop5 in the ref object? 
    Is there a need to implement this method?  */}
    {/* <TypeOptional
      name="OptionalCompany"
      optionalType={
        <TypeObject $refByName="Company">
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

    let companyType = model.elements.find((e) => e.name == "Company");

    expect((optCompanyProperty as t.IProperty).domain).toBe(optCompanyType);
    expect((optCompanyProperty as t.IProperty).domain).not.toBe(companyType);
  });
});
