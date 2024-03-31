export const snapshot = {
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
          annotation: undefined,
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
          annotation: undefined,
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
          annotation: undefined,
        },
      ],
      references: [
      ],
      annotation: undefined,
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
          annotation: undefined,
        },
      ],
      references: [
      ],
      annotation: undefined,
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
          annotation: undefined,
        },
      ],
      references: [
      ],
      annotation: undefined,
    },
  ],
  references: [
    {
      isSubElement: false,
      typeName: "Employee",
      fullPathName: "/DefaultSchema/OrgSchema/Employee",
      tagName: "Employee",
      refByType: "refByName",
      refValue: undefined,
      annotation: undefined,
    },
  ],
  annotation: undefined,
}