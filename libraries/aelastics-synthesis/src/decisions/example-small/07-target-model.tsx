/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"
import {
  Column,
  RelSchema,
  Table,
} from "./../09-relational-schema/REL-components"

export const RelationalSchema_Company = (store: ModelStore) => (
  <RelSchema name="CompanyRelationalSchema" store={store}>
    <Table name="person">
      <Column name="person_id" type="INTEGER" isKey={true} />
      <Column name="name" type="VARCHAR" />
    </Table>

    <Table name="company">
      <Column name="company_id" type="INTEGER" isKey={true} />
      <Column name="company_name" type="VARCHAR" />
    </Table>

    <Table name="employment">
      <Column name="person_id"
              type="INTEGER"
              isForeignKey={true}
              isKey={true}
              references={<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/person/person_id" />}
      />
      <Column name="company_id"
              type="INTEGER"
              isForeignKey={true}
              isKey={true}
              references={<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/company/company_id" />} />
    </Table>
  </RelSchema>
)
