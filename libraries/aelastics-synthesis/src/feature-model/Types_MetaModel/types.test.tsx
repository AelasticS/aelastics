// /** @jsx hm */

// import { Element } from "../../jsx/element";
// import { hm } from "../../jsx/handle";
// import { Property, Subtype, Supertype, TypeModel } from "./types-components";
// import { IObject, IType, ITypeModel } from "./types-meta.model";

// let a = <Object name="ime"></Object>;
// let b = <Object $ref={a}></Object>; // efekat je da je b = a

// let c: IType = <Object name="ime" $local_id="55"></Object>;
// let d = <Object $ref_local_id="55"></Object>; // efekat je da je b = a

// let g = c as IObject;

// const typeModel: Element<ITypeModel> = (
//   <TypeModel name="prvi type model">
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

describe("Type instance", () => {
  it("tests example", () => {
    expect(true).toBeTruthy();
  });
});
