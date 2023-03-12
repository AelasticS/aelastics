import * as jm from "./jsx-maker"
import { dep1, Organization } from "./examples-for-test"

describe ("Test jsx-maker", ()=> {
    test("using builder without annotation", ()=>{
        let cpx = jm.make(Organization, dep1)
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