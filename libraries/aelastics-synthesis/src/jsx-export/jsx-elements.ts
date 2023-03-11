export abstract class JSX_Element {
  constructor(readonly name: string) {}

  abstract pushJSX(stringArray: string[], level: number, indent: number): void;

  getJSX(level: number, indent: number = 1): string {
    let localStringArray = new Array<string>();
    this.pushJSX(localStringArray, level, indent);
    return localStringArray.join("");
  }
}

export class Complex_JSX_Element extends JSX_Element {
  private readonly properties: Property[] = [];
  private readonly subElements: Complex_JSX_Element[] = [];
  private readonly references: Reference_JSX_Element[] = [];

  addProperty(name: string, value: JSX_Element) {
    this.properties.push(new Property(name, value));
  }
  getProperty(name: string) {
    return this.properties.find((p) => p.name === name);
  }

  addsubElement(value: Complex_JSX_Element) {
    this.subElements.push(value);
  }
  addReference(value: Reference_JSX_Element) {
    this.references.push(value);
  }

  getProperties(): string {
    let s = this.properties.reduce(
      (prev, current) =>
        `${prev}${current.name}=${current.reference.getJSX(0)} `,
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
    if (this.subElements.length === 0) {
      stringArray.push(
        `${" ".repeat(level * indent)}<${this.name} ${this.getProperties()}/>\n`
      );
    } else {
      stringArray.push(
        `${" ".repeat(level * indent)}<${this.name} ${this.getProperties()}>\n`
      );
      // sub elemnts
      this.pushSubElements(stringArray, level + 1, indent);
      // references
      this.pushReferences(stringArray, level + 1, indent);
      // closed tag
      stringArray.push(`${" ".repeat(level * indent)}</${this.name}>\n`);
    }
  }

  public toJSX(indent: number = 2): string {
    return this.getJSX(0, indent);
  }
}

export class Property extends JSX_Element {
  constructor(readonly name: string, readonly reference: JSX_Element) {
    super(name);
  }
  pushJSX(stringArray: string[]): void {
    stringArray.push(`<${this.name} $refByName="${this.reference.name}"/>`);
  }
}

/**
 *
 */
export class Reference_JSX_Element extends JSX_Element {
  constructor(
    readonly tagName: string,
    readonly refByType: "refByID" | "refByName",
    readonly refValue: string
  ) {
    super(tagName);
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
  constructor(readonly value: any) {
    super(value);
  }

  pushJSX(stringArray: string[]): void {
    stringArray.push(`"${this.value}"`);
  }
}
