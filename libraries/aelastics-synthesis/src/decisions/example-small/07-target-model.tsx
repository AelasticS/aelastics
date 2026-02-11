/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"
import {
  Column,
  Domain,
  RelSchema,
  Table,
} from "./../09-relational-schema/REL-components"

export const RelationalSchema_Company = (store: ModelStore) => (
  <RelSchema name="CompanyRelationalSchema">
    <Table name="Person">
      <Column name="PersonId" domain={<Domain $refByName="number" />} isKey={true} />
      <Column name="FirstName" domain={<Domain $refByName="varchar" />} />
      <Column name="LastName" domain={<Domain $refByName="varchar" />} />
    </Table>

    <Table name="Company">
      <Column name="CompanyId" domain={<Domain $refByName="number" />} isKey={true} />
      <Column name="CompanyName" domain={<Domain $refByName="varchar" />} />
      <Column name="Address" domain={<Domain $refByName="varchar" />} />
    </Table>

    <Table name="WorksIn">
      <Column name="PersonId"
              domain={<Domain $refByName="number" />}
              isKey={true}
              isForeignKey={true}
              references={<Column $refByName="//www.aelastic.com/CompanyRelationalSchema/Person/PersonId" />}
      />
      <Column name="CompanyId"
              domain={<Domain $refByName="number" />}
              isKey={true}
              isForeignKey={true}
              references={<Column $refByName="//www.aelastic.com/CompanyRelationalSchema/Company/CompanyId" />} />
    </Table>
  </RelSchema>
)
