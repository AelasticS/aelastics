import * as jm from "./jsx-maker-annotated";
import { ChildType, dep1, Employee, Organization } from "./examples-for-test";
import { JSX_Annotation } from "./jsx-annotation";
import { snapshotWith } from "./snapshot-JSX-org-with-annot";
import { snapshot } from "./snapshot-JSX-org";

// annotataions for Child
const childAnnot: JSX_Annotation<typeof ChildType> = {
  idProp: "name",
  nameProp: "name",
  tagName: undefined,
  isReference: undefined,
  refType: undefined,
  ifProperty: {
    isParentProp: undefined,
    propName: undefined,
    isReconnectAllowed: undefined,
  },
  $props: {
    name: { include: true },
  },
};

// annotataions for Employee
const empAnnot: JSX_Annotation<typeof Employee> = {
  idProp: "id",
  nameProp: "name",
  tagName: undefined,
  isReference: false,
  refType: undefined,
  ifProperty: {
    isParentProp: undefined,
    propName: undefined,
    isReconnectAllowed: undefined,
  },
  $props: {
    id: { include: true },
    name: { include: true },
    children: {
      propName: undefined,
      isParentProp: undefined,
      isReconnectAllowed: undefined,
      $elem: childAnnot,
    },
    birthPlace: {
      idProp: "name",
      nameProp: "name",
      tagName: "Place",
      isReference: false,
      refType: undefined,
      ifProperty: {
        isParentProp: undefined,
        propName: undefined,
        isReconnectAllowed: undefined,
      },
      $props: {
        name: { include: true },
        state: { include: true },
      },
    },
  },
};

// annotataions for Organization
const orgAnnot: JSX_Annotation<typeof Organization> = {
  idProp: "id",
  nameProp: "name",
  tagName: undefined,
  isReference: false,
  refType: undefined,
  ifProperty: {
    isParentProp: undefined,
    propName: undefined,
    isReconnectAllowed: undefined,
  },
  $props: {
    id: { include: true },
    name: { include: true },
    employees: {
      propName: undefined,
      isParentProp: undefined,
      isReconnectAllowed: undefined,
      $elem: empAnnot,
    },
    manager: {
      // take from empAnot except tagName
      idProp: empAnnot.idProp,
      nameProp: empAnnot.nameProp,
      tagName: "Manager",
      isReference: true,
      refType: "refByName",
      ifProperty: {
        isParentProp: undefined,
        propName: undefined,
        isReconnectAllowed: undefined,
      },
      $props: empAnnot.$props,
    },
  },
};

describe("Test jsx-maker-annotated", () => {
  test("with annotation", () => {
    let cpx = jm.makeWith(dep1, { type: Organization, value: orgAnnot });
    expect(cpx).toEqual(snapshotWith);
  });

  test("without annotation", () => {
    let cpx = jm.make(dep1, Organization);
    expect(cpx).toEqual(snapshot);
  });
});

