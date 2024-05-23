import { JSX_Export as jsx } from "aelastics-synthesis";
import { Trans as tr } from "aelastics-types";
import * as t from "aelastics-types";

type calcType = [
  tagName: string,
  reftType: "refByName" | "refByID",
  refValue: string
];

function calculate(
  elAnot: jsx.IObjectJSXAnnotType,
  currNode: t.Node
): calcType {
  // calculate later needed values
  let tagName = elAnot?.tagName ? elAnot.tagName : currNode.type.name;
  let [refType, prop]: ["refByName" | "refByID", string] =
    !elAnot || elAnot?.refType === "refByName"
      ? ["refByName", elAnot?.nameProp]
      : ["refByID", elAnot?.idProp];
  let refValue = currNode.instance ? currNode.instance[prop] : undefined;
  return [tagName, refType, refValue];
}

const toJSX_Element = new tr.ProcessorBuilder()
  .onInit(
    new tr.InitBuilder()
      .onTypeCategory("Object", (result, currNode, annot) => {
        let elAnot: jsx.IObjectJSXAnnotType =
          currNode.getCurrentAnnotationElement(annot);
        let [tagName, refType, refValue] = calculate(elAnot, currNode);
        result = new jsx.Complex_JSX_Element(currNode.type, tagName, elAnot);
        result.isSubElement = true;
        return [result, "continue"];
      })
      .onTypeCategory("Array", (result, currNode) => {
        return [result, "continue"];
      })
      .build()
  )
  .onStep(
    new tr.StepBuilder()
      .onTypeCategory(
        "Object",
        (result, currNode, currItem: jsx.Complex_JSX_Element, annot) => {
          if (result instanceof jsx.Complex_JSX_Element) {
            let elAnot: jsx.IObjectJSXAnnotType =
              currNode.getCurrentAnnotationElement(annot);
            let [tagName, refType, refValue] = calculate(elAnot, currNode);
            if (elAnot?.isReference) {
              result.addReference(
                new jsx.Reference_JSX_Element(
                  currNode.type,
                  tagName,
                  refType,
                  refValue,
                  elAnot
                )
              );
              return [result, "continue"];
            }
            if (!currItem.isSubElement) {
              // but not added as sub-element, redefine tagName
              currItem.tagName = tagName;
              result.addsubElement(currItem);
            } // add as reference
            else
              result.addReference(
                new jsx.Reference_JSX_Element(
                  currNode.type,
                  tagName,
                  refType,
                  refValue,
                  elAnot
                )
              );
          }
          return [result, "continue"];
        }
      )
      .onTypeCategory("Simple", (result, currNode, currItem, annot) => {
        if (
          result instanceof jsx.Complex_JSX_Element &&
          currNode instanceof t.Node &&
          currNode.extra.propName
        ) {
          let elAnot: jsx.ISimpleJSXAnnotType =
            currNode.getCurrentAnnotationElement(annot);
          if (!elAnot || elAnot.include)
            result.addProperty(
              currNode.type,
              currNode.extra.propName,
              new jsx.Simple_JSX_Element(currNode.type, currItem)
            );
        }
        return [result, "continue"];
      })
      .onTypeCategory("Array", (result, currNode, currItem, annot) => {
        let elAnot: jsx.IPropertyJSXAnnotType =
          currNode.getCurrentAnnotationElement(annot);

        return [result, "continue"];
      })
      .build()
  )
  .onResult(
    new tr.ResultBuilder()
      .onTypeCategory("Object", (result, currNode) => {
        result.isSubElement = false;
        return [result, "continue"];
      })
      .onTypeCategory("Array", (result, currNode) => {
        return [result, "continue"];
      })
      .build()
  )
  .build();

export function generate_JSX_Elements<T extends t.ObjectType<any, any>>(
  ta: jsx.Typed_JSX_Annotation<T>
) {
  // create transformer to JSX model
  let transducer = tr
    .transducer()
    .recurse("makeItem")
    .processAnnotations(ta)
    .doWithAnnotations(toJSX_Element, ta)
    .doFinally(tr.identityReducer());
  // execute transformer on the type level
  let res = ta.type.transduce<jsx.Complex_JSX_Element>(transducer, ta.type, undefined, undefined, true);
  return res
}
