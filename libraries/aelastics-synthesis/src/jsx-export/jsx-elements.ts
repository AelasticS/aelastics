export abstract class JSX_Element {
  constructor(readonly name: string = "no name") {}
  abstract printOut(stringArray: string[], level: number): void;
}

export class Complex_JSX_Element extends JSX_Element {
  private readonly properties: Property[] = [];
  private readonly subElements: JSX_Element[] = [];

  addProperty(name: string, value: JSX_Element) {
    this.properties.push(new Property(name, value));
  }

  addsubElement(value: JSX_Element) {
    this.subElements.push(value);
  }

  printOutProperties(stringArray: string[], level: number) {
    this.properties.forEach((v, i) => {
      stringArray.push(
        ` ${v.name}= ${v.reference.printOut(stringArray, level)} `
      );
    });
  }

  printOutSubElements(stringArray: string[], level: number) {
    this.subElements.forEach((v, i) => {
        v.printOut(stringArray, level)
      });
  }

  printOut(stringArray: string[], level: number): void {
    // open tag with properties
    stringArray.push(
      `<${this.name} ${this.printOutProperties(stringArray, -1)} />\n`
    );
    // sub elemnts
    this.printOutSubElements(stringArray, level + 1);
    // closed tag
    stringArray.push(`<${this.name}/>\n`);
  }

  public toJSX() {
    let a: string[] = [];
    this.printOut(a, 0);
    return a.join();
  }
}

export class Property extends JSX_Element {
  constructor(readonly name: string, readonly reference: JSX_Element) {
    super(name);
  }
  printOut(stringArray: string[]): void {
    stringArray.push(`<${this.name} $refByName="${this.reference.name}"/>`);
  }
}

export class Reference_JSX_Element extends JSX_Element {
  constructor(readonly reference: Complex_JSX_Element) {
    super();
  }

  printOut(stringArray: string[]): void {
    stringArray.push(`<${this.name} $refByName="${this.reference.name}"/>`);
  }
}

export class Simple_JSX_Element extends JSX_Element {
  constructor(readonly value: any) {
    super();
  }

  printOut(stringArray: string[]): void {
    stringArray.push(`"${this.value}"`);
  }
}

