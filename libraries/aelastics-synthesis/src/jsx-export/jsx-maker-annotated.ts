import * as jsx from "./jsx-elements";
import * as t from "aelastics-types";
import { Trans as tr } from "aelastics-types";
import { AnnotationTypes as a } from "aelastics-types";
import { IPropertyJSXAnnotType, IObjectJSXAnnotType, ISimpleJSXAnnotType, Typed_JSX_Annotation } from "./jsx-annotation";


const builder = new tr.TransformerBuilder();

type calcType = [tagName: string, reftType: "refByName" | "refByID", refValue: string]

function calculate(elAnot: IObjectJSXAnnotType, currNode: t.Node): calcType {
  // calculate later needed values
  let tagName = elAnot?.tagName ? elAnot.tagName : currNode.type.name
  let [refType, prop]: ["refByName" | "refByID", string] = !elAnot || elAnot?.refType === "refByName"
    ? ["refByName", elAnot?.nameProp] : ["refByID", elAnot?.idProp]
  let refValue = currNode.instance[prop]
  return [tagName, refType, refValue]
}


const transform2JSXAnnot = builder
  .onInit(
    new tr.InitBuilder()
      .onTypeCategory("Object", (result, currNode, annot) => {
        let elAnot: IObjectJSXAnnotType = currNode.getCurrentAnnotationElement(annot);
        let [tagName, refType, refValue] = calculate(elAnot, currNode)
        result = new jsx.Complex_JSX_Element(currNode.type, tagName, elAnot);
        //debugger;
        // if(currNode.extra?.role=== "asRoot")
            result.isSubElement=true
        //if (elAnot?.tagName && !elAnot.isReference) 
        // if (!elAnot?.isReference)
        // result = new jsx.Complex_JSX_Element(currNode.type, tagName, elAnot);
        // else {
        //   //         if(!currNode.instance.objectClassification) 
        //   //   result = new jsx.Complex_JSX_Element(currNode.type, currNode.type.name, elAnot);
        //   // else
        //   //   result = new jsx.Complex_JSX_Element(currNode.type, currNode.instance.objectClassification, elAnot);
        //   result = new jsx.Reference_JSX_Element(currNode.type, tagName, refType, refValue, elAnot)
        // }
        return [result, "continue"];
      })
      .onTypeCategory("Array", (result, currNode) => {
        // result = currNode.parent?.acc
        return [result, "continue"];
      })
      .build()
  )
  .onStep(
    new tr.StepBuilder()
      .onTypeCategory("Object", (result, currNode, currItem: jsx.Complex_JSX_Element, annot) => {

        if (result instanceof jsx.Complex_JSX_Element) {
          let elAnot: IObjectJSXAnnotType = currNode.getCurrentAnnotationElement(annot);
          let [tagName, refType, refValue] = calculate(elAnot, currNode)
          if (elAnot?.isReference) {
            result.addReference(new jsx.Reference_JSX_Element(currNode.type, tagName, refType, refValue, elAnot));
            return [result, "continue"];
          }
          // if (currItem.isRevisited) {
            // if (currItem instanceof jsx.Reference_JSX_Element)
            //   result.addReference(currItem)
            // else if (currNode.isRevisited && currItem instanceof jsx.Complex_JSX_Element) {
            // node is already visited 
            if (!currItem.isSubElement) {// but not added as sub-element, redefine tagName
              currItem.tagName = tagName
              result.addsubElement(currItem)
            }
            else // add as reference
              result.addReference(new jsx.Reference_JSX_Element(currNode.type, tagName, refType, refValue, elAnot))
          // } else {
          //   // node is visited for the first time
          //   // if (elAnot?.isReference) {
          //   //   result.addReference(new jsx.Reference_JSX_Element(currNode.type, tagName, refType, refValue, elAnot));
          //   // }
          //   // else // no annotation, add subelement
          //   result.addsubElement(currItem);
          // }
        }
        return [result, "continue"];
      })
      .onTypeCategory("Simple", (result, currNode, currItem, annot) => {
        if (
          result instanceof jsx.Complex_JSX_Element &&
          currNode instanceof t.Node &&
          currNode.extra.propName
        ) {
          let elAnot: ISimpleJSXAnnotType = currNode.getCurrentAnnotationElement(annot);
          if (!elAnot || elAnot.include)
            result.addProperty(currNode.type, currNode.extra.propName, new jsx.Simple_JSX_Element(currNode.type, currItem));
        }
        return [result, "continue"];
      })
      .onTypeCategory("Array", (result, currNode, currItem, annot) => {
        let elAnot: IPropertyJSXAnnotType = currNode.getCurrentAnnotationElement(annot);

        return [result, "continue"];
      })
      .build()
  )
  .onResult(
    new tr.ResultBuilder()
      .onTypeCategory("Object", (result, currNode) => {
        result.isSubElement=false
        return [result, "continue"];
      })
      .onTypeCategory("Array", (result, currNode) => {
        return [result, "continue"];
      })
      .build()
  )
  .build();

export const make = (
  obj: t.ObjectLiteral,
  objType: t.ObjectType<any, any>
): jsx.JSX_Element => {
  // create transformer to JSX model
  let transducers = tr
    .transducer()
    .recurse("makeItem")
    .do(transform2JSXAnnot)
    .doFinally(tr.identityReducer());
  // execute transformer
  return objType.transduce(transducers, obj);
};


export const makeWith = (
  obj: t.ObjectLiteral,
  annotation: Typed_JSX_Annotation<any>
): jsx.JSX_Element => {
  // create transformer to JSX model
  let transducer = tr
    .transducer()
    .recurse("makeItem")
    .processAnnotations(annotation)
    .doWithAnnotations(transform2JSXAnnot, annotation)
    .doFinally(tr.identityReducer());
  // execute transformer
  return annotation.type.transduce(transducer, obj);
};
