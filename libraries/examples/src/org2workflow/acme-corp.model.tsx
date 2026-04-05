/** @jsx createExprNode */
import { createExprNode, ExprNode, ModelStore } from "aelastics-synthesis"
import * as org from "./org-model.meta"
import * as o from "./org-model.jsx-comps"

export const acmeCorpModel = (store: ModelStore): ExprNode<org.IOrganization> => (
  <o.Organization name="Acme Corp" MDA_level="M1" store={store}>
    <o.Board name="Executive Board">
      <o.Worker name="Alice" />
      <o.Worker name="Bob" />
      <o.Worker name="Carol" />
      <o.Department name="Technology Division">
        <o.Worker name="Dave" />
        <o.Worker name="Eve" />
        <o.Worker name="Frank" />
        <o.Manager $refByName="Dave" />
        <o.Department name="Engineering">
          <o.Worker name="Grace" />
          <o.Worker name="Heidi" />
          <o.Worker name="Ivan" />
          <o.Worker name="Judy" />
          <o.Manager $refByName="Grace" />
        </o.Department>
        <o.Department name="QA">
          <o.Worker name="Karl" />
          <o.Worker name="Leo" />
          <o.Manager $refByName="Karl" />
        </o.Department>
      </o.Department>
      <o.Department name="Sales Division">
        <o.Worker name="Mallory" />
        <o.Worker name="Niaj" />
        <o.Worker name="Oscar" />
        <o.Manager $refByName="Mallory" />
      </o.Department>
    </o.Board>
  </o.Organization>
)
