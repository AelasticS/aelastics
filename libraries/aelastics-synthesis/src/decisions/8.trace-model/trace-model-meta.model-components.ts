import { ModelStore } from "../../index"
import { CpxTemplate, ExprNode, Template, WithRefProps } from "../../jsx/element"
import * as tm from "./trace-meta.model"

export type ITraceModelProps = WithRefProps<tm.ITraceModel> & { store?: ModelStore };

export const TraceModel: CpxTemplate<ITraceModelProps, tm.ITraceModel> = (props) => {
  return new ExprNode(tm.TraceModel, props, undefined)
}

export const TraceEntry: Template<tm.ITraceEntry> = (props) => {
  return new ExprNode(tm.TraceEntry, props, "traceEntries")
}

export const VarPointTraceEntry: Template<tm.IVarPointTraceEntry> = (props) => {
  return new ExprNode(tm.VariabilityPointTraceEntry, props, "traceEntries")
}

export const TargetElement: Template<tm.ITraceEntry> = (props) => {
  return new ExprNode(tm.TraceEntry, props, "targets")
}