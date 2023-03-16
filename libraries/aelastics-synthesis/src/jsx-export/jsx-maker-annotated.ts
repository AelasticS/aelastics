import * as jsx from "./jsx-elements";
import * as t from "aelastics-types";
import { Trans as tr } from "aelastics-types";
import { AnnotationTypes as a } from "aelastics-types";

const builder = new tr.TransformerBuilder();

const transform2JSXAnnot = builder
  .onInit(
    new tr.InitBuilder()
      .onTypeCategory("Object", (result, currNode, annot) => {
        result = new jsx.Complex_JSX_Element(currNode.type.name);
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
      .onTypeCategory("Object", (result, currNode, currItem) => {
        if (result instanceof jsx.Complex_JSX_Element) {
          if (
            currNode.isRevisited &&
            currItem instanceof jsx.Complex_JSX_Element
          ) {
            result.addReference(
              new jsx.Reference_JSX_Element(
                currItem.name,
                "refByName",
                currItem.getProperty("name")?.reference.name!
              )
            );
          } else result.addsubElement(currItem);
        }
        return [result, "continue"];
      })
      .onTypeCategory("Simple", (result, currItem, currNode) => {
        if (
          result instanceof jsx.Complex_JSX_Element &&
          currNode instanceof t.Node &&
          currNode.extra.propName
        ) {
          result.addProperty(
            currNode.extra.propName,
            new jsx.Simple_JSX_Element(currItem)
          );
        }
        return [result, "continue"];
      })
      .onTypeCategory("Array", (result, currItem, currNode) => {
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
  annotation: a.TypedAnnotation
): jsx.JSX_Element => {
  // create transformer to JSX model
  let transduser = tr
    .transducer()
    .recurse("makeItem")
    .processAnnotations(annotation)
    .do(transform2JSXAnnot)
    .doFinally(tr.identityReducer());
  // execute transformer
  return annotation.type.transduce(transduser, obj);
};
