import { emit } from "process";
import { Element } from "../jsx/element";
import { Name, Organization } from "./examples-for-test";
import * as je from "./jsx-elements";

describe("Test jsx-elements", () => {
  test("print out", () => {
    // create a top organization with properties
    const eTop1 = new je.Complex_JSX_Element(Organization, "Organization");
    eTop1.addProperty(Name, "name", new je.Simple_JSX_Element(Name,"ITU"));
    eTop1.addProperty(Name,"address", new je.Simple_JSX_Element(Name, "Copenhagen"));

    // create subordinate organizations with properties
    const eDept1 = new je.Complex_JSX_Element(Organization, "Organization");
    eDept1.addProperty(Name,
      "name",
      new je.Simple_JSX_Element(Name, "Computer Science Department")
    );
    const eDept2 = new je.Complex_JSX_Element(Organization, "Organization");
    eDept2.addProperty(Name,
      "name",
      new je.Simple_JSX_Element(Name, "Business IT Department")
    );
    // add subordinate organizations as sub elements
    eTop1.addsubElement(eDept1);
    eTop1.addsubElement(eDept2);

    const eTop2 = new je.Complex_JSX_Element(Organization, "Organization");
    eTop2.addProperty(Name,"name", new je.Simple_JSX_Element(Name, "DTU"));
    eTop2.addProperty(Name,"address", new je.Simple_JSX_Element(Name, "Lyngby"));
    const eDept3 = new je.Complex_JSX_Element(Organization, "Organization");
    eDept3.addProperty(Name,"title", new je.Simple_JSX_Element(Name, "Compute"));
    eTop2.addsubElement(eDept3);

    const eRef = new je.Reference_JSX_Element(
      Organization,
      "PartnerOrganization",
      "refByName",
      eDept1.getProperty("name")!.reference.tagName
    );
    eTop2.addReference(eRef);

    // create an organizational model
    const eModel = new je.Complex_JSX_Element(Organization, "OrganizationalModel");
    eModel.addProperty(Name,"name", new je.Simple_JSX_Element(Name, "Org model"));
    eModel.addsubElement(eTop1);
    eModel.addsubElement(eTop2);

    let jsxStringArray = new Array<string>();
    eModel.pushJSX(jsxStringArray, 0);
    expect(jsxStringArray.length).toBeGreaterThan(0);

    let jsxString = eModel.toJSX();
    expect(jsxString).toEqual("<OrganizationalModel name=\"Org model\" >\n  <Organization name=\"ITU\" address=\"Copenhagen\" >\n    <Organization name=\"Computer Science Department\" />\n    <Organization name=\"Business IT Department\" />\n  </Organization>\n  <Organization name=\"DTU\" address=\"Lyngby\" >\n    <Organization title=\"Compute\" />\n    <PartnerOrganization refByName=\"Computer Science Department\"/>\n  </Organization>\n</OrganizationalModel>\n");
  });
});
