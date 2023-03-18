import * as jm from "./jsx-maker-annotated"
import { ChildType, dep1, Employee, Organization } from "./examples-for-test";
import { JSX_Annotation } from "./jsx-annotatation";


// annotataions for Child
const childAnnot: JSX_Annotation<typeof ChildType> = {
    idProp:"name",
    nameProp:"name",
    tagName:undefined,
    isReference:undefined,
    refType:undefined,
    ifProperty:{
      isParentProp:undefined,
      propName:undefined,
      isReconnectAllowed:undefined,
    },
    $props:{
        name:{include:true}
    }
}

// annotataions for Employee
const empAnnot: JSX_Annotation<typeof Employee> = {
    idProp: "id",
    nameProp: "name",
    tagName:undefined,
    isReference:false,
    refType:undefined,
    ifProperty:{
      isParentProp:undefined,
      propName:undefined,
      isReconnectAllowed:undefined,
    },
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
            isReference:false,
            refType:undefined,
            ifProperty:{
              isParentProp:undefined,
              propName:undefined,
              isReconnectAllowed:undefined,
            },
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
  isReference:false,
  refType:undefined,
  ifProperty:{
    isParentProp:undefined,
    propName:undefined,
    isReconnectAllowed:undefined,
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
    manager: {  // take from empAnot except tagName
      idProp:empAnnot.idProp,
      nameProp:empAnnot.nameProp,
      tagName: "Manager",
      isReference:true,
      refType:"refByName",
      ifProperty:{
        isParentProp:undefined,
        propName:undefined,
        isReconnectAllowed:undefined,
      },
      $props:empAnnot.$props
    },
  },
};

describe ("Test jsx-maker-annotated", ()=> {

  test("without annotation", ()=>{
    let cpx = jm.make(dep1, {type:Organization, value:orgAnnot})
    expect(cpx).toEqual( testData)
})

    test("with annotation", ()=>{
        let cpx = jm.make(dep1, {type:Organization, value:orgAnnot})
        expect(cpx).toEqual( testData)
    })
})

var testData = {
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