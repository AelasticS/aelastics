import { IPropertyJSXAnnotType, IObjectJSXAnnotType } from "./jsx-annotation";
import {Any} from "aelastics-types"
export abstract class JSX_Element {
  public typeName:string
  public fullPathName:string
  public tagName: string
  public isSubElement:boolean = false

  constructor(type:Any, tagName: string) {
    this.typeName = type.name
    this.fullPathName = type.fullPathName
    this.tagName = tagName
  }

  abstract pushJSX(stringArray: string[], level: number, indent: number): void;

  getJSX(level: number, indent: number = 1): string {
    let localStringArray = new Array<string>();
    this.pushJSX(localStringArray, level, indent);
    return localStringArray.join("");
  }
}

export class Complex_JSX_Element extends JSX_Element {
  private readonly annotation?:IObjectJSXAnnotType
  private readonly properties: Property[] = [];
  private readonly subElements: Complex_JSX_Element[] = [];
  private readonly references: Reference_JSX_Element[] = [];
 
  constructor(type:Any, tagName:string, annotation?:IObjectJSXAnnotType) {
    super(type, tagName)
    this.annotation = annotation
  }

  addProperty(type:Any, name: string, value: JSX_Element) {
    this.properties.push(new Property(type, name, value));
  }
  getProperty(name: string) {
    return this.properties.find((p) => p.tagName === name);
  }

  addsubElement(value: Complex_JSX_Element) {
    value.isSubElement = true
    this.subElements.push(value);
  }
  addReference(value: Reference_JSX_Element) {
    this.references.push(value);
  }

  getProperties(): string {
    let s = this.properties.reduce(
      (prev, current) =>
        `${prev}${current.tagName}=${current.reference.getJSX(0)} `,
      ""
    );
    return s;
  }

  pushSubElements(stringArray: string[], level: number, indent: number) {
    this.subElements.forEach((v, i) => {
      v.pushJSX(stringArray, level, indent);
    });
  }

  pushReferences(stringArray: string[], level: number, indent: number) {
    this.references.forEach((v, i) => {
      v.pushJSX(stringArray, level, indent);
    });
  }

  pushJSX(stringArray: string[], level: number, indent: number = 1): void {
    // open tag with properties
    if (this.subElements.length === 0 && this.references.length === 0) {
      stringArray.push(
        `${" ".repeat(level * indent)}<${this.tagName} ${this.getProperties()}/>\n`
      );
    } else {
      stringArray.push(
        `${" ".repeat(level * indent)}<${this.tagName} ${this.getProperties()}>\n`
      );
      // sub elements
      this.pushSubElements(stringArray, level + 1, indent);
      // references
      this.pushReferences(stringArray, level + 1, indent);
      // closed tag
      stringArray.push(`${" ".repeat(level * indent)}</${this.tagName}>\n`);
    }
  }

  public toJSX(indent: number = 2): string {
    return this.getJSX(0, indent);
  }
}

export class Property extends JSX_Element {
  constructor(type:Any, readonly tagName: string, readonly reference: JSX_Element) {
    super(type, tagName);
  }
  pushJSX(stringArray: string[]): void {
    stringArray.push(`<${this.tagName} $refByName="${this.reference.tagName}"/>`);
  }
}

/**
 *
 */
export class Reference_JSX_Element extends JSX_Element {
  constructor(
    type:Any, 
    readonly tagName: string,
    readonly refByType: "refByID" | "refByName",
    readonly refValue: string,
    readonly annotation?:IObjectJSXAnnotType
  ) {
    super(type, tagName);
  }

  pushJSX(stringArray: string[], level: number, indent: number): void {
    stringArray.push(
      `${" ".repeat(level * indent)}<${
        this.tagName
      } ${this.refByType.toString()}="${this.refValue}"/>\n`
    );
  }
}

/**
 *
 */
export class Simple_JSX_Element extends JSX_Element {
  constructor(type:Any, readonly value: any) {
    super(type, value);
  }

  pushJSX(stringArray: string[]): void {
    stringArray.push(`"${this.value}"`);
  }
}
