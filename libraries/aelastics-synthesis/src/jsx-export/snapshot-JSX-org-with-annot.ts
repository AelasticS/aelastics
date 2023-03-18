export const snapshotWith = {
    isSubElement: false,
    typeName: "Organization",
    fullPathName: "/DefaultSchema/OrgSchema/Organization",
    tagName: "Organization",
    properties: [
      {
        isSubElement: false,
        typeName: "IDType",
        fullPathName: "/DefaultSchema/IDType",
        tagName: "id",
        reference: {
          isSubElement: false,
          typeName: "IDType",
          fullPathName: "/DefaultSchema/IDType",
          tagName: 1,
          value: 1,
        },
      },
      {
        isSubElement: false,
        typeName: "NameType",
        fullPathName: "/DefaultSchema/NameType",
        tagName: "name",
        reference: {
          isSubElement: false,
          typeName: "NameType",
          fullPathName: "/DefaultSchema/NameType",
          tagName: "Department 1",
          value: "Department 1",
        },
      },
    ],
    subElements: [
      {
        isSubElement: true,
        typeName: "Employee",
        fullPathName: "/DefaultSchema/OrgSchema/Employee",
        tagName: "Employee",
        properties: [
          {
            isSubElement: false,
            typeName: "IDType",
            fullPathName: "/DefaultSchema/IDType",
            tagName: "id",
            reference: {
              isSubElement: false,
              typeName: "IDType",
              fullPathName: "/DefaultSchema/IDType",
              tagName: 1,
              value: 1,
            },
          },
          {
            isSubElement: false,
            typeName: "NameType",
            fullPathName: "/DefaultSchema/NameType",
            tagName: "name",
            reference: {
              isSubElement: false,
              typeName: "NameType",
              fullPathName: "/DefaultSchema/NameType",
              tagName: "John",
              value: "John",
            },
          },
        ],
        subElements: [
          {
            isSubElement: true,
            typeName: "Place",
            fullPathName: "/DefaultSchema/OrgSchema/Place",
            tagName: "Place",
            properties: [
              {
                isSubElement: false,
                typeName: "string",
                fullPathName: "/string",
                tagName: "name",
                reference: {
                  isSubElement: false,
                  typeName: "string",
                  fullPathName: "/string",
                  tagName: "London",
                  value: "London",
                },
              },
              {
                isSubElement: false,
                typeName: "string",
                fullPathName: "/string",
                tagName: "state",
                reference: {
                  isSubElement: false,
                  typeName: "string",
                  fullPathName: "/string",
                  tagName: "UK",
                  value: "UK",
                },
              },
            ],
            subElements: [
            ],
            references: [
            ],
            annotation: {
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
                name: {
                  include: true,
                },
                state: {
                  include: true,
                },
              },
            },
          },
          {
            isSubElement: true,
            typeName: "Child",
            fullPathName: "/DefaultSchema/OrgSchema/Child",
            tagName: "Child",
            properties: [
              {
                isSubElement: false,
                typeName: "string",
                fullPathName: "/string",
                tagName: "name",
                reference: {
                  isSubElement: false,
                  typeName: "string",
                  fullPathName: "/string",
                  tagName: "Paul",
                  value: "Paul",
                },
              },
            ],
            subElements: [
            ],
            references: [
            ],
            annotation: {
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
                name: {
                  include: true,
                },
              },
            },
          },
          {
            isSubElement: true,
            typeName: "Child",
            fullPathName: "/DefaultSchema/OrgSchema/Child",
            tagName: "Child",
            properties: [
              {
                isSubElement: false,
                typeName: "string",
                fullPathName: "/string",
                tagName: "name",
                reference: {
                  isSubElement: false,
                  typeName: "string",
                  fullPathName: "/string",
                  tagName: "Anna",
                  value: "Anna",
                },
              },
            ],
            subElements: [
            ],
            references: [
            ],
            annotation: {
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
                name: {
                  include: true,
                },
              },
            },
          },
        ],
        references: [
        ],
        annotation: {
          idProp: "id",
          nameProp: "name",
          tagName: "Manager",
          isReference: true,
          refType: "refByName",
          ifProperty: {
            isParentProp: undefined,
            propName: undefined,
            isReconnectAllowed: undefined,
          },
          $props: {
            id: {
              include: true,
            },
            name: {
              include: true,
            },
            children: {
              propName: undefined,
              isParentProp: undefined,
              isReconnectAllowed: undefined,
              $elem: {
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
                  name: {
                    include: true,
                  },
                },
              },
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
                name: {
                  include: true,
                },
                state: {
                  include: true,
                },
              },
            },
          },
        },
      },
      {
        isSubElement: true,
        typeName: "Employee",
        fullPathName: "/DefaultSchema/OrgSchema/Employee",
        tagName: "Employee",
        properties: [
          {
            isSubElement: false,
            typeName: "IDType",
            fullPathName: "/DefaultSchema/IDType",
            tagName: "id",
            reference: {
              isSubElement: false,
              typeName: "IDType",
              fullPathName: "/DefaultSchema/IDType",
              tagName: 1,
              value: 1,
            },
          },
          {
            isSubElement: false,
            typeName: "NameType",
            fullPathName: "/DefaultSchema/NameType",
            tagName: "name",
            reference: {
              isSubElement: false,
              typeName: "NameType",
              fullPathName: "/DefaultSchema/NameType",
              tagName: "Peter",
              value: "Peter",
            },
          },
        ],
        subElements: [
          {
            isSubElement: true,
            typeName: "Place",
            fullPathName: "/DefaultSchema/OrgSchema/Place",
            tagName: "Place",
            properties: [
              {
                isSubElement: false,
                typeName: "string",
                fullPathName: "/string",
                tagName: "name",
                reference: {
                  isSubElement: false,
                  typeName: "string",
                  fullPathName: "/string",
                  tagName: "London",
                  value: "London",
                },
              },
              {
                isSubElement: false,
                typeName: "string",
                fullPathName: "/string",
                tagName: "state",
                reference: {
                  isSubElement: false,
                  typeName: "string",
                  fullPathName: "/string",
                  tagName: "UK",
                  value: "UK",
                },
              },
            ],
            subElements: [
            ],
            references: [
            ],
            annotation: {
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
                name: {
                  include: true,
                },
                state: {
                  include: true,
                },
              },
            },
          },
        ],
        references: [
        ],
        annotation: {
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
            id: {
              include: true,
            },
            name: {
              include: true,
            },
            children: {
              propName: undefined,
              isParentProp: undefined,
              isReconnectAllowed: undefined,
              $elem: {
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
                  name: {
                    include: true,
                  },
                },
              },
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
                name: {
                  include: true,
                },
                state: {
                  include: true,
                },
              },
            },
          },
        },
      },
      {
        isSubElement: true,
        typeName: "Employee",
        fullPathName: "/DefaultSchema/OrgSchema/Employee",
        tagName: "Employee",
        properties: [
          {
            isSubElement: false,
            typeName: "IDType",
            fullPathName: "/DefaultSchema/IDType",
            tagName: "id",
            reference: {
              isSubElement: false,
              typeName: "IDType",
              fullPathName: "/DefaultSchema/IDType",
              tagName: 1,
              value: 1,
            },
          },
          {
            isSubElement: false,
            typeName: "NameType",
            fullPathName: "/DefaultSchema/NameType",
            tagName: "name",
            reference: {
              isSubElement: false,
              typeName: "NameType",
              fullPathName: "/DefaultSchema/NameType",
              tagName: "Suzanne",
              value: "Suzanne",
            },
          },
        ],
        subElements: [
          {
            isSubElement: true,
            typeName: "Place",
            fullPathName: "/DefaultSchema/OrgSchema/Place",
            tagName: "Place",
            properties: [
              {
                isSubElement: false,
                typeName: "string",
                fullPathName: "/string",
                tagName: "name",
                reference: {
                  isSubElement: false,
                  typeName: "string",
                  fullPathName: "/string",
                  tagName: "London",
                  value: "London",
                },
              },
              {
                isSubElement: false,
                typeName: "string",
                fullPathName: "/string",
                tagName: "state",
                reference: {
                  isSubElement: false,
                  typeName: "string",
                  fullPathName: "/string",
                  tagName: "UK",
                  value: "UK",
                },
              },
            ],
            subElements: [
            ],
            references: [
            ],
            annotation: {
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
                name: {
                  include: true,
                },
                state: {
                  include: true,
                },
              },
            },
          },
        ],
        references: [
        ],
        annotation: {
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
            id: {
              include: true,
            },
            name: {
              include: true,
            },
            children: {
              propName: undefined,
              isParentProp: undefined,
              isReconnectAllowed: undefined,
              $elem: {
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
                  name: {
                    include: true,
                  },
                },
              },
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
                name: {
                  include: true,
                },
                state: {
                  include: true,
                },
              },
            },
          },
        },
      },
    ],
    references: [
      {
        isSubElement: false,
        typeName: "Employee",
        fullPathName: "/DefaultSchema/OrgSchema/Employee",
        tagName: "Manager",
        refByType: "refByName",
        refValue: "John",
        annotation: {
          idProp: "id",
          nameProp: "name",
          tagName: "Manager",
          isReference: true,
          refType: "refByName",
          ifProperty: {
            isParentProp: undefined,
            propName: undefined,
            isReconnectAllowed: undefined,
          },
          $props: {
            id: {
              include: true,
            },
            name: {
              include: true,
            },
            children: {
              propName: undefined,
              isParentProp: undefined,
              isReconnectAllowed: undefined,
              $elem: {
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
                  name: {
                    include: true,
                  },
                },
              },
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
                name: {
                  include: true,
                },
                state: {
                  include: true,
                },
              },
            },
          },
        },
      },
    ],
    annotation: {
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
        id: {
          include: true,
        },
        name: {
          include: true,
        },
        employees: {
          propName: undefined,
          isParentProp: undefined,
          isReconnectAllowed: undefined,
          $elem: {
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
              id: {
                include: true,
              },
              name: {
                include: true,
              },
              children: {
                propName: undefined,
                isParentProp: undefined,
                isReconnectAllowed: undefined,
                $elem: {
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
                    name: {
                      include: true,
                    },
                  },
                },
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
                  name: {
                    include: true,
                  },
                  state: {
                    include: true,
                  },
                },
              },
            },
          },
        },
        manager: {
          idProp: "id",
          nameProp: "name",
          tagName: "Manager",
          isReference: true,
          refType: "refByName",
          ifProperty: {
            isParentProp: undefined,
            propName: undefined,
            isReconnectAllowed: undefined,
          },
          $props: {
            id: {
              include: true,
            },
            name: {
              include: true,
            },
            children: {
              propName: undefined,
              isParentProp: undefined,
              isReconnectAllowed: undefined,
              $elem: {
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
                  name: {
                    include: true,
                  },
                },
              },
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
                name: {
                  include: true,
                },
                state: {
                  include: true,
                },
              },
            },
          },
        },
      },
    },
  }