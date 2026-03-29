/** @jsx hm */
/*
 * Copyright (c) AelasticS 2023.
 */

import * as t from "aelastics-types"
import { IModel, IModelElement } from "generic-metamodel"
import { hm } from "../jsx/handle"
import { Context } from "../jsx/context"
import * as tm from "./transformation.model.type"
import { Element, ResolveElement } from "../jsx/element"
import { ModelStore } from "./../index"
import { IConfigurationModel, IChoice } from "../decisions/3.configuration-model/configuration-meta.model"
import * as tmT from "../decisions/8.trace-model/trace-meta.model"
import * as tmC from "../decisions/8.trace-model/trace-model-meta.model-components"
import { Element as CModelElement, Model } from "../types-metamodel/models-component"
import { TargetElement } from "../decisions/8.trace-model/trace-model-meta.model-components"

type IODescr = { type?: t.Any; instance?: IModel; jsx?: string }
type TransformationDescr = {
  type?: tm.IM2M_Transformation
  instance?: tm.IM2M_Trace
}

export interface IVarResolution {
  optionName: string
  choices: IChoice[]
}

// Lightweight runtime record for resolve lookups (sourceIndex, jsxIndex).
// The full trace info (source, ruleType, variabilityOption, choices, timestamps)
// lives in rawTraceEntries and is rendered into a persistent TraceModel lazily.
export interface TraceEntryRecord {
  rule: string // for lookup by ruleName
  targets: IModelElement[] // populated by resolveTargetForJSX during render
  _jsxElements: Element<IModelElement>[] // for resolveJSXElement / resolveAllJSXElements
}

// Raw data stored during template() execution; converted to trace JSX
// in createTraceModel() when output.instance is available.
export interface RawTraceEntryData {
  sourceModelElement: IModelElement
  jsxElements: Element<IModelElement>[]
  ruleName: string
  ruleType: "RegularRule" | "VariabilityPoint"
  variabilityOption?: string
  choices?: IChoice[]
}

export const _privatePop = Symbol("privatePop")
export const _privatePush = Symbol("privatePush")

export class Stack<T> {
  private stack: Array<T> = []

  private [_privatePop]: () => T | undefined = () => {
    return this.stack.pop()
  }

  private [_privatePush]: (element: T) => void = (element: T) => {
    this.stack.push(element)
  }

  public peek(): T | undefined {
    return this.stack[this.stack.length - 1]
  }

  public isEmpty(): boolean {
    return this.stack.length === 0
  }

  public depth(): number {
    return this.stack.length
  }
}

export class M2MContext extends Context {
  public input: IODescr = {}
  public output: IODescr = {}
  public transformation: TransformationDescr = {}
  public currentElementDecision: Stack<IChoice[]> = new Stack<IChoice[]>()
  public traceModel?: Element<tmT.ITraceModel>

  // Fast O(1) lookup by source element
  public readonly sourceIndex: Map<IModelElement, TraceEntryRecord[]> = new Map()

  // Fast O(1) lookup by JSX element — private, used only by resolveTargetForJSX()
  private readonly jsxIndex: Map<Element<IModelElement>, TraceEntryRecord> = new Map()

  // Raw trace data collected during template(); converted to JSX lazily in createTraceModel()
  public readonly rawTraceEntries: RawTraceEntryData[] = []

  // Stack for nested VarPoint calls — VarPoint pushes/pops, E2E reads lastVarResolution
  public readonly varResolutionStack: Stack<IVarResolution> = new Stack<IVarResolution>()

  // Last VarResolution — set by VarPoint in finally, read and cleared by E2E
  public lastVarResolution?: IVarResolution

  constructor() {
    super()
  }

  public makeTrace(
    sourceModelElement: IModelElement,
    jsxElements: Element<IModelElement>[],
    ruleName: string,
    ruleType: "RegularRule" | "VariabilityPoint",
    variabilityOption?: string,
    choices?: IChoice[]
  ) {
    if (ruleType === "VariabilityPoint" && (!variabilityOption || !choices)) {
      throw new Error("VariabilityPoint trace entry requires variabilityOption and choices")
    }

    // Store raw data — JSX entries will be created lazily in createTraceModel()
    // when output.instance is available and targetElementNamespace can be resolved.
    this.rawTraceEntries.push({
      sourceModelElement,
      jsxElements,
      ruleName,
      ruleType,
      variabilityOption,
      choices,
    })

    const entry: TraceEntryRecord = {
      rule: ruleName,
      targets: [],
      _jsxElements: jsxElements,
    }

    // sourceIndex
    const existing = this.sourceIndex.get(sourceModelElement)
    if (existing) {
      existing.push(entry)
    } else {
      this.sourceIndex.set(sourceModelElement, [entry])
    }

    // jsxIndex — register each JSX element from the array
    for (const jsx of jsxElements) {
      this.jsxIndex.set(jsx, entry)
    }
  }

  public resolveTargetForJSX(jsxElement: Element<IModelElement>, modelElement: IModelElement): void {
    const entry = this.jsxIndex.get(jsxElement)
    if (entry) {
      entry.targets.push(modelElement)
    }
  }

  public resolveTarget(source: IModelElement, ruleName?: string, targetType?: t.Any): IModelElement | undefined {
    const entries = this.sourceIndex.get(source)
    if (!entries) return undefined

    const entry = ruleName ? entries.find((e) => e.rule === ruleName) : entries[0]
    if (!entry) return undefined

    if (targetType) {
      return entry.targets.find((target) => this.store.isTypeOf(target, targetType))
    }

    return entry.targets[0]
  }

  public resolveAllTargets(source: IModelElement, ruleName?: string, targetType?: t.Any): IModelElement[] {
    const entries = this.sourceIndex.get(source)
    if (!entries) return []

    const entry = ruleName ? entries.find((e) => e.rule === ruleName) : entries[0]
    if (!entry) return []

    if (targetType) {
      return entry.targets.filter((target) => this.store.isTypeOf(target, targetType))
    }

    return entry.targets
  }

  public resolveJSXElement(input: IModelElement, ruleName?: string, targetType?: t.Any): Element<IModelElement> {
    const entries = this.sourceIndex.get(input)
    if (!entries) throw new Error(`Target JSXElement for ${input} source model element does not exist!`)

    const entry = ruleName ? entries.find((e) => e.rule === ruleName) : entries[0]

    if (!entry || entry._jsxElements.length === 0) {
      throw new Error(`Target JSXElement for ${input} source model element does not exist!`)
    }

    if (targetType) {
      const idx = entry.targets.findIndex((target) => this.store.isTypeOf(target, targetType))
      if (idx === -1) {
        throw new Error(
          `Target JSXElement of type ${targetType.name} for ${input} source model element does not exist!`
        )
      }
      return entry._jsxElements[idx]
    }

    return entry._jsxElements[0]
  }

  public resolveAllJSXElements(input: IModelElement, ruleName?: string, targetType?: t.Any): Element<IModelElement>[] {
    const entries = this.sourceIndex.get(input)
    if (!entries) throw new Error(`Target JSXElements for ${input} source model element do not exist!`)

    const entry = ruleName ? entries.find((e) => e.rule === ruleName) : entries[0]

    if (!entry || entry._jsxElements.length === 0) {
      throw new Error(`Target JSXElements for ${input} source model element do not exist!`)
    }

    if (targetType) {
      return entry._jsxElements.filter((_, idx) => this.store.isTypeOf(entry.targets[idx], targetType))
    }

    return entry._jsxElements
  }
}

export interface IM2M<
  S extends IModel,
  D extends IModel,
  EM extends { [key: string]: IModel } = {},
  CM extends IConfigurationModel = never,
> {
  context: M2MContext
  extra?: EM
  configModel?: CM

  template(props: S): Element<S, D>

  transform(source: S): D
}

export abstract class abstractM2M<
  S extends IModel,
  D extends IModel,
  EM extends { [key: string]: IModel } = {},
  CM extends IConfigurationModel = never,
> implements IM2M<S, D, EM, CM> {
  // transformation type
  public context: M2MContext = new M2MContext()
  public configModel?: CM
  public extra?: EM

  public constructor(store?: ModelStore, extra?: EM, configModel?: CM) {
    if (store) this.context.pushStore(store)
    this.extra = extra
    this.configModel = configModel
  }

  abstract template(props: S): Element<S, D>

  public transform(source: S): D {
    const targetJSXTree = this.template(source)
    const targetModel = targetJSXTree.render<D>(this.context)

    this.context.input.instance = source
    this.context.output.instance = targetModel

    // Infer types from runtime objects — supplement M2M_Transformation.
    // Wrapped in try/catch: cross-schema transformations may not have all types
    // registered in the same schema context, so getTypeOf may fail for the output.
    try {
      this.context.input.type = this.context.store.getTypeOf(source)
      this.context.output.type = this.context.store.getTypeOf(targetModel)
      if (this.context.transformation.type) {
        this.context.transformation.type.from = this.context.input.type!.name
        this.context.transformation.type.to = this.context.output.type!.name
      }
    } catch (_e) {
      // Type inference failed for cross-schema types — from/to remain unset
    }

    this.context.traceModel = this.createTraceModel()
    console.log("Generated Trace Model JSX:\n", this.renderToJsx(this.context.traceModel))
    const traceModel = this.context.traceModel.render<tmT.ITraceModel>(this.context)

    // Serialize the target model to JSX notation
    this.context.output.jsx = this.renderToJsx(targetJSXTree)
    console.log("Generated JSX:\n", this.context.output.jsx)

    return targetModel
  }

  /**
   * Serializes an Element<> JSX tree into a human-readable JSX string.
   * Traverses the element tree directly — no annotations needed.
   */
  private renderToJsx(element: Element<any>, level: number = 0, indent: number = 2): string {
    if (!element) return ""

    const lines: string[] = []
    const pad = " ".repeat(level * indent)

    // Handle ResolveElement specially
    if (element instanceof ResolveElement) {
      const resolveProps = element.props as any
      const inputName = resolveProps.input?.name ?? "unknown"
      const ruleAttr = resolveProps.ruleName ? ` ruleName="${resolveProps.ruleName}"` : ""
      lines.push(`${pad}<Resolve input={${inputName}}${ruleAttr}>`)
      lines.push(`${pad}${" ".repeat(indent)}{(target) => ...}`)
      lines.push(`${pad}</Resolve>`)
      return lines.join("\n")
    }

    const tagName = element.name ?? element.type.name

    // Build props string
    const propsStr = this.formatJsxProps(element.props, level, indent)

    // Collect renderable children
    const childLines: string[] = []
    for (const child of element.children) {
      if (child === null || child === undefined) continue
      if (typeof child === "string") {
        childLines.push(`${" ".repeat((level + 1) * indent)}${child}`)
      } else if (Array.isArray(child)) {
        for (const el of child) {
          if (el && el instanceof Element) {
            childLines.push(this.renderToJsx(el, level + 1, indent))
          }
        }
      } else if (typeof child === "function") {
        childLines.push(`${" ".repeat((level + 1) * indent)}{() => ...}`)
      } else if (child instanceof Element) {
        childLines.push(this.renderToJsx(child, level + 1, indent))
      }
    }

    if (childLines.length === 0) {
      lines.push(`${pad}<${tagName}${propsStr} />`)
    } else {
      lines.push(`${pad}<${tagName}${propsStr}>`)
      lines.push(...childLines)
      lines.push(`${pad}</${tagName}>`)
    }

    return lines.join("\n")
  }

  /**
   * Formats element props as JSX attribute string.
   * Skips internal infrastructure props (store) and handles
   * refs, primitives, nested Element values and arrays.
   */
  private formatJsxProps(props: any, _level: number = 0, indent: number = 2): string {
    if (!props) return ""

    const skipKeys = new Set(["store", "children"])
    const parts: string[] = []

    for (const [key, value] of Object.entries(props)) {
      if (skipKeys.has(key)) continue
      if (value === undefined || value === null) continue

      if (value instanceof Element) {
        // Inline nested Element prop — render compactly
        const inlineJsx = this.renderToJsx(value, 0, indent).trim()
        parts.push(`${key}={${inlineJsx}}`)
      } else if (typeof value === "string") {
        parts.push(`${key}="${value}"`)
      } else if (typeof value === "number" || typeof value === "boolean") {
        parts.push(`${key}={${value}}`)
      } else if (Array.isArray(value)) {
        const items = value.map((v) => {
          if (v instanceof Element) return this.renderToJsx(v, 0, indent).trim()
          if (typeof v === "string") return `"${v}"`
          if (typeof v === "object" && v !== null && "name" in v) return v.name
          return String(v)
        })
        parts.push(`${key}={[${items.join(", ")}]}`)
      } else if (typeof value === "object") {
        // Object references (e.g. $ref pointing to IModelElement)
        if ("name" in value) {
          parts.push(`${key}={${(value as any).name}}`)
        } else {
          parts.push(`${key}={...}`)
        }
      }
    }

    return parts.length > 0 ? " " + parts.join(" ") : ""
  }

  private createTraceModel(): Element<tmT.ITraceModel> {
    // Now output.instance is available — build trace JSX entries from raw data
    const targetElementNamespace = this.context.output.instance
      ? `${this.context.output.instance.path}/${this.context.output.instance.name}`
      : ""

    const traceJSXEntries = this.context.rawTraceEntries.map((raw) => {
      const sourceElementNamespace = raw.sourceModelElement.path

      const targetElements = raw.jsxElements.map((jsx) => (
        <TargetElement $refByName={`${targetElementNamespace}/${jsx.props.name}`} />
      ))

      if (raw.ruleType === "VariabilityPoint") {
        return (
          <tmC.VarPointTraceEntry
            source={<CModelElement $refByName={`${sourceElementNamespace}/${raw.sourceModelElement.name}`} />}
            rule={raw.ruleName}
            ruleType={"VariabilityPoint"}
            variabilityOption={raw.variabilityOption}
            choices={raw.choices}
            targets={targetElements}
          />
        )
      } else {
        return (
          <tmC.TraceEntry
            source={<CModelElement $refByName={`${sourceElementNamespace}/${raw.sourceModelElement.name}`} />}
            rule={raw.ruleName}
            ruleType={raw.ruleType}
            targets={targetElements}
          />
        )
      }
    })

    return (
      <tmC.TraceModel
        name={`${this.context.input.instance?.name} to ${this.context.output.instance?.name}`}
        store={this.context.store}
        timestamp={new Date().toISOString()}
        source={<Model $refByName={`${this.context.input.instance!.path}/${this.context.input.instance!.name}`} />}
        config={this.configModel ? <Model $refByName={`${this.configModel.path}/${this.configModel.name}`} /> : null}
        targets={[<Model $refByName={`${this.context.output.instance!.path}/${this.context.output.instance!.name}`} />]}
      >
        {traceJSXEntries}
      </tmC.TraceModel>
    )
  }
}
