import { emit } from "process";
import { Element } from "../jsx/element";
import * as je from "./jsx-elements";

describe("Test jsx-elements", () => {
  test("print out", () => {
    // create a top oragnization with properties
    const eTop1 = new je.Complex_JSX_Element("Organization");
    eTop1.addProperty("name", new je.Simple_JSX_Element("ITU"));
    eTop1.addProperty("address", new je.Simple_JSX_Element("Copenhagen"));

    // create subordinate oragnizations with properties
    const eDept1 = new je.Complex_JSX_Element("Oragnization");
    eDept1.addProperty(
      "name",
      new je.Simple_JSX_Element("Computer Science Department")
    );
    const eDept2 = new je.Complex_JSX_Element("Oragnization");
    eDept2.addProperty(
      "name",
      new je.Simple_JSX_Element("Business IT Department")
    );
    // add subordinate oragnizations as sub elements
    eTop1.addsubElement(eDept1);
    eTop1.addsubElement(eDept2);

    const eTop2 = new je.Complex_JSX_Element("Organization");
    eTop2.addProperty("name", new je.Simple_JSX_Element("DTU"));
    eTop2.addProperty("address", new je.Simple_JSX_Element("Lyngby"));
    const eDept3 = new je.Complex_JSX_Element("Oragnization");
    eDept3.addProperty("titel", new je.Simple_JSX_Element("Compute"));
    eTop2.addsubElement(eDept3);

    const eRef = new je.Reference_JSX_Element(
      "PartnerOrganization",
      "refByName",
      eTop1.getProperty("name")!.reference.name
    );
    eTop2.addsubElement(eRef);

    // create an oragnizational model
    const eModel = new je.Complex_JSX_Element("OrganizationalModel");
    eModel.addProperty("name", new je.Simple_JSX_Element("Org model"));
    eModel.addsubElement(eTop1);
    eModel.addsubElement(eTop2);

    let jsxStringArray = new Array<string>();
    eModel.pushJSX(jsxStringArray, 0);
    expect(jsxStringArray.length).toBeGreaterThan(0);

    let jsxString = eModel.toJSX();
    console.log(jsxString);
    expect(jsxString.length).toBeGreaterThan(0);
  });
});
