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


describe("Test", ()=>{
    test("test1", ()=> {
        expect(1).toEqual(1)
    })
})