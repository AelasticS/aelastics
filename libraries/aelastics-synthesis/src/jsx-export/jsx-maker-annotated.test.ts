import * as jm from "./jsx-maker-annotated"
import { ChildType, dep1, Employee, Organization } from "./examples-for-test";
import { JSX_Annotation } from "./jsx-annotatation";


// annotataions for Child
const childAnnot: JSX_Annotation<typeof ChildType> = {
    idProp:"name",
    nameProp:"name",
    tagName:undefined,
    $props:{
        name:{include:true}
    }
}

// annotataions for Employee
const empAnnot: JSX_Annotation<typeof Employee> = {
    idProp: "id",
    nameProp: "name",
    tagName:undefined,
    $props: {
        id:{include:true},
        name:{include:true},
        children: {
            propName:undefined,
            isParentProp:undefined,
            isReconnectAllowed: undefined,
            $elem: childAnnot
        },
        birthPlace: {
            idProp:"name",
            nameProp:"name",
            tagName:"Place",
            $props:{
                name:{include:true },
                state:{include: true}
            }
        }
    }
};

// annotataions for Organization
const orgAnnot: JSX_Annotation<typeof Organization> = {
  idProp: "id",
  nameProp: "name",
  tagName: undefined,
  $props: {
    id: { include: true },
    name: { include: true },
    employees: {
      propName: undefined,
      isParentProp: undefined,
      isReconnectAllowed: undefined,
      $elem: empAnnot,
    },
    manager: empAnnot,
  },
};

describe ("Test jsx-maker-annotated", ()=> {
    test("using builder with annotation", ()=>{
        let cpx = jm.make(dep1, {type:Organization, value:orgAnnot})
        expect(cpx).toEqual(
            {
                name: "Organization",
                properties: [
                  {
                    name: "id",
                    reference: {
                      name: 1,
                      value: 1,
                    },
                  },
                  {
                    name: "name",
                    reference: {
                      name: "Department 1",
                      value: "Department 1",
                    },
                  },
                ],
                subElements: [
                  {
                    name: "Employee",
                    properties: [
                      {
                        name: "id",
                        reference: {
                          name: 1,
                          value: 1,
                        },
                      },
                      {
                        name: "name",
                        reference: {
                          name: "John",
                          value: "John",
                        },
                      },
                    ],
                    subElements: [
                      {
                        name: "Place",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "London",
                              value: "London",
                            },
                          },
                          {
                            name: "state",
                            reference: {
                              name: "UK",
                              value: "UK",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                      {
                        name: "Child",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "Paul",
                              value: "Paul",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                      {
                        name: "Child",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "Anna",
                              value: "Anna",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                    ],
                    references: [
                    ],
                  },
                  {
                    name: "Employee",
                    properties: [
                      {
                        name: "id",
                        reference: {
                          name: 1,
                          value: 1,
                        },
                      },
                      {
                        name: "name",
                        reference: {
                          name: "Peter",
                          value: "Peter",
                        },
                      },
                    ],
                    subElements: [
                      {
                        name: "Place",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "London",
                              value: "London",
                            },
                          },
                          {
                            name: "state",
                            reference: {
                              name: "UK",
                              value: "UK",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                    ],
                    references: [
                    ],
                  },
                  {
                    name: "Employee",
                    properties: [
                      {
                        name: "id",
                        reference: {
                          name: 1,
                          value: 1,
                        },
                      },
                      {
                        name: "name",
                        reference: {
                          name: "Suzanne",
                          value: "Suzanne",
                        },
                      },
                    ],
                    subElements: [
                      {
                        name: "Place",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "London",
                              value: "London",
                            },
                          },
                          {
                            name: "state",
                            reference: {
                              name: "UK",
                              value: "UK",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                    ],
                    references: [
                    ],
                  },
                ],
                references: [
                  {
                    name: "Employee",
                    tagName: "Employee",
                    refByType: "refByName",
                    refValue: "John",
                  },
                ],
              }  
        )
    })
})