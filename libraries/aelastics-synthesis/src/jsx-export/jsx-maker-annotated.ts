import * as jsx from "./jsx-elements";
import * as t from "aelastics-types";
import { Trans as tr } from "aelastics-types";
import { AnnotationTypes as a } from "aelastics-types";
import { IPropertyJSXAnnotType, IObjectJSXAnnotType, ISimpleJSXAnnotType } from "./jsx-annotation";


const builder = new tr.TransformerBuilder();

const transform2JSXAnnot = builder
  .onInit(
    new tr.InitBuilder()
      .onTypeCategory("Object", (result, currNode, annot) => {
        let elAnot: IObjectJSXAnnotType = currNode.getCurrentAnnotationElement(annot);  
        if (elAnot?.tagName) 
          result = new jsx.Complex_JSX_Element(currNode.type, elAnot.tagName, elAnot);
        else {
          if(!currNode.instance.objectClassification) 
                result = new jsx.Complex_JSX_Element(currNode.type, currNode.type.name, elAnot);
            else
              result = new jsx.Complex_JSX_Element(currNode.type, currNode.instance.objectClassification, elAnot);
        }
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
          // calculate later needed values
          let tagName = elAnot?.tagName ? elAnot.tagName : currItem.tagName
          let [refType, prop]: ["refByName" | "refByID", string] = !elAnot || elAnot?.refType === "refByName"
            ? ["refByName", elAnot?.nameProp] : ["refByID", elAnot?.idProp]
          let refValue = currItem.getProperty(prop)?.reference.tagName!

          if (currNode.isRevisited && currItem instanceof jsx.Complex_JSX_Element) {
            // node is already visited 
            if (!currItem.isSubElement) {// but not added as subelement, redefine tagName
              if (elAnot?.tagName)  // take the tagName to be from annotation or object type
                currItem.tagName = elAnot.tagName
              else
                currItem.tagName = currNode.type.name
              result.addsubElement(currItem)
            }
            else // add as reference
              result.addReference(new jsx.Reference_JSX_Element(currNode.type,tagName, refType, refValue, elAnot))
          } else {
            // node is visited for the first time
            if (elAnot?.isReference) {
              result.addReference(new jsx.Reference_JSX_Element(currNode.type, tagName, refType, refValue, elAnot));
            }
            else // no annotation, add subelement
              result.addsubElement(currItem);
          }
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
  annotation: a.TypedAnnotation
): jsx.JSX_Element => {
  // create transformer to JSX model
  let transduser = tr
    .transducer()
    .recurse("makeItem")
    .processAnnotations(annotation)
    .doWithAnnotations(transform2JSXAnnot, annotation)
    .doFinally(tr.identityReducer());
  // execute transformer
  return annotation.type.transduce(transduser, obj);
};
