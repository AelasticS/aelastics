/*
 * Copyright (c) A. AelasticS 2020.
 */

import { Any } from "./DefinitionAPI";
import { ExtraInfo } from "../type/Type";
import { VisitedNodes } from "./VisitedMap";
import { AnnotationProcessor } from "../transducers/AnnotationProcessor";
import { TypedAnnotation } from "../annotations/Annotation";

/**
 * Represents a node in a data structure that is aware of its type and annotations.
 */
export class Node {
  instance: any;
  type: Any;
  acc?: any;
  typeLevel: boolean;
  extra: ExtraInfo;
  parent?: Node;
  visited: VisitedNodes;
  annotationProcessor: Map<TypedAnnotation, AnnotationProcessor>;
  private _revisited: boolean = false;

  /**
   * Constructs a new Node.
   *
   * @param i The instance data of the node.
   * @param t The type descriptor of the node.
   * @param acc Accumulator for carrying additional data.
   * @param e Extra info associated with the node.
   * @param parent The parent node in the hierarchy, if any.
   * @param typeLevel Indicates if the node processing is at type level.
   */
  constructor(
    i: any,
    t: Any,
    acc?: any,
    e: ExtraInfo = { role: "asRoot", optional: false },
    parent?: Node,
    typeLevel: boolean = false
  ) {
    this.instance = i;
    this.type = t;
    this.acc = acc;
    this.extra = e;
    this.parent = parent;
    this.visited = this.parent !== undefined ? this.parent.visited : new VisitedNodes();
    this.typeLevel = this.parent !== undefined ? this.parent.typeLevel : typeLevel;
    this.annotationProcessor = parent ? parent.annotationProcessor : new Map();
  }

  /**
   * Returns whether the node has been revisited.
   */
  get isRevisited(): boolean {
    return this._revisited;
  }

  /**
   * Sets the revisited status of the node.
   */
  set isRevisited(b: boolean) {
    this._revisited = b;
  }

  /**
   * Retrieves the current annotation element for a given annotation type.
   *
   * @param a The annotation type.
   * @returns The current annotation element, if any.
   */
  getCurrentAnnotationElement(a: TypedAnnotation): any {
    return this.annotationProcessor.get(a)?.currentAnnotationElement;
  }

  /**
   * Retrieves the AnnotationProcessor for a given annotation type.
   *
   * @param a The annotation type.
   * @returns The corresponding AnnotationProcessor, if present.
   */
  getAnnotationProcessor(a: TypedAnnotation): AnnotationProcessor | undefined {
    return this.annotationProcessor.get(a);
  }

  /**
   * Factory method to create a Node. Reuses existing Node if input is already a Node,
   * otherwise creates a new Node based on provided parameters.
   *
   * @param input The input data or existing Node.
   * @param type The type descriptor.
   * @param acc Accumulator for carrying additional data.
   * @param e Extra info, defaults to undefined.
   * @param parent The parent Node, if any.
   * @param typeLevel Indicates if the node processing is at type level.
   * @returns A new or existing Node instance.
   */
  static makeNode(
    input: any | Node,
    type: Any,
    acc: any,
    e?: ExtraInfo,
    parent?: Node,
    typeLevel: boolean = false
  ): Node {
    if (input instanceof Node) return input;
      if (input && input["@@aelastics/type"] !== "") {
      const subType = type.ownerSchema.getType(input["@@aelastics/type"]);
      if (subType) {
        return new Node(input, subType, acc, e, parent, typeLevel);
      }
    }
    return new Node(input, type, acc, e, parent, typeLevel);
  }
}
