import { ModelStore } from '../../index';
import { CpxTemplate, Element, Template, WithRefProps } from "../../jsx/element";
import * as tm from './trace-meta.model';

export type ITraceModelProps = WithRefProps<tm.ITraceModel> & { store?: ModelStore };

export const TraceModel: CpxTemplate<ITraceModelProps, tm.ITraceModel> = (props) => {
    return new Element(tm.TraceModel, props, undefined);
}

export const TraceEntry: Template<tm.ITraceEntry> = (props) => {
    return new Element(tm.TraceEntry, props, 'traceRecords');
}