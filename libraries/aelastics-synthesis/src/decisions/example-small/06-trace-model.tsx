/** @jsx hm */

import { hm } from "../../jsx/handle";
import { ModelStore } from '../../index';
import * as tmC from "../8.trace-model/trace-model-meta.model-components";
import { EERSchema } from "../../test/eer-model/EER-components";

export const traceModel = (store: ModelStore) => (
    <tmC.TraceModel name="CompanySchemaTrace"
        transformationName="CompanySchemaTransformation"
        sourceModel={<EERSchema $refByName="//www.aelastics.org/CompanySchema" />}
        targetModel={<EERSchema $refByName="//www.aelastics.org/CompanyRelationalSchema" />}
        store={store}>
        <tmC.TraceEntry ruleName="entityToTable"
            source={["//www.aelastics.org/CompanySchema/Person"]}
            target={["//www.aelastics.org/CompanyRelationalSchema/Person"]} />

    </tmC.TraceModel>
)