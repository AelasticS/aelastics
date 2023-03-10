import * as jsx from "./jsx-elements"
import {Trans as t} from "aelastics-types"

let builder = new t.TransformerBuilder()

let trf = builder
.onInit(
    new t.InitBuilder()
    .build()
)
.onStep(
    new t.StepBuilder()
    .build()
)
.onResult(
    new t.ResultBuilder()
    .build()
)
.build() 