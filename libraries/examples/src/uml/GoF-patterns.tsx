/** @jsx hm */
import { Element, ModelStore, Template, hm } from "aelastics-synthesis";
import * as uml from "./uml.jsx-comp";
import * as umlT from "./uml.meta.model.type";
import { IModelElement } from "generic-metamodel";

export type ConceptOrRef = string | Element<IModelElement>

export interface IObserverParams {
  observer: string,
  subject: string,
  concreteObservers: string[],
  concreteSubjects: string[]
}

export const Observer = (p:IObserverParams) =>  (
  <uml.Class $refByName={p.subject}>
    <uml.Property name= {p.observer}
      type={<uml.Class $refByName={p.observer} />}
      multiplicity="0..*"
    />
    {
      p.concreteSubjects.map((s) =>
        <uml.Class name={s}>
            <uml.SuperClass $refByName={p.subject} />
        </uml.Class>)
    }
    // ...

  </uml.Class> as Element<umlT.IClass>
);

export interface ICommandParams {
  observer: string,
  subject: string,
  concreteObservers: string[],
  concreteSubjects: string[]
}

export const Command = (p:ICommandParams) =>  (

  <uml.Class $refByName={p.observer}>
    <uml.Property
      type={<uml.Class $refByName={p.subject} />}
      multiplicity="0..*"
    />
  </uml.Class> as Element<umlT.IClass>
);

export interface IAbstractFactoryParams {
  observer: string,
  subject: string,
  concreteObservers: string[],
  concreteSubjects: string[]
}

export const AbstractFactory = (p:IAbstractFactoryParams) =>  (

  <uml.Class $refByName={p.observer}>
    <uml.Property
      type={<uml.Class $refByName={p.subject} />}
      multiplicity="0..*"
    />
  </uml.Class> as Element<umlT.IClass>
);

export interface ISingletonParams {
  name: string,
}

export const Singleton = (p:ISingletonParams) =>  (

  <uml.Class $refByName={p.name}>
    <uml.Property
      type={<uml.Class $refByName={p.name} />}
      multiplicity="0..*"
    />
  </uml.Class> as Element<umlT.IClass>
);


