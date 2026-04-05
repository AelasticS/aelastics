/** @jsx createExprNode */

import { createExprNode } from "../../jsx/handle"
import { ModelStore } from "../../index"
import {
  EERSchema,
  Kernel,
  Attribute,
  Domain,
  Relationship,
  OrdinaryMapping,
  Subtype,
  Specialization,
  SpecializationMapping,
} from "../../test/eer-model/EER-components"

export const createUniversityModel = (store: ModelStore) => {
  return (
    <EERSchema name="University" MDA_level="M1" store={store}>
      {/* Person Hierarchy used for multi-level inheritance strategies */}
      <Kernel name="Person">
        <Attribute name="personId" isKey={true}>
          <Domain name="number" />
        </Attribute>
        <Attribute name="name" isKey={false}>
          <Domain name="string" />
        </Attribute>
      </Kernel>

      <Subtype name="Student">
        <Specialization>
          <SpecializationMapping>
            <Subtype $refByName="Person" />
          </SpecializationMapping>
        </Specialization>
        <Attribute name="indexNumber" isKey={false}>
          <Domain $refByName="string" />
        </Attribute>
      </Subtype>

      <Subtype name="Staff">
        <Specialization>
          <SpecializationMapping>
            <Subtype $refByName="Person" />
          </SpecializationMapping>
        </Specialization>
        <Attribute name="salary" isKey={false}>
          <Domain $refByName="number" />
        </Attribute>
      </Subtype>

      <Subtype name="Professor">
        <Specialization>
          <SpecializationMapping>
            <Subtype $refByName="Staff" />
          </SpecializationMapping>
        </Specialization>
        <Attribute name="title" isKey={false}>
          <Domain $refByName="string" />
        </Attribute>
      </Subtype>

      <Kernel name="Course">
        <Attribute name="courseId" isKey={true}>
          <Domain $refByName="number" />
        </Attribute>
        <Attribute name="courseTitle" isKey={false}>
          <Domain $refByName="string" />
        </Attribute>
      </Kernel>

      <Kernel name="Department">
        <Attribute name="deptId" isKey={true}>
          <Domain $refByName="number" />
        </Attribute>
        <Attribute name="deptName" isKey={false}>
          <Domain $refByName="string" />
        </Attribute>
      </Kernel>

      {/* M:N Relationship */}
      <Relationship name="Enrolls">
        <OrdinaryMapping
          name="student_enrolls"
          lb="0"
          ub="M"
          domain={<Subtype $refByName="Student"></Subtype>}
        />
        <OrdinaryMapping
          name="course_enrollments"
          lb="0"
          ub="M"
          domain={<Kernel $refByName="Course"></Kernel>}
        />
      </Relationship>

      {/* 0:1 to 0:M Relationship: Student belongs to Department */}
      <Relationship name="BelongsTo">
        <OrdinaryMapping
          name="students"
          lb="0"
          ub="M"
          domain={<Kernel $refByName="Department"></Kernel>}
        />
        <OrdinaryMapping
          name="department"
          lb="0"
          ub="1"
          domain={<Subtype $refByName="Student"></Subtype>}
        />
      </Relationship>

    </EERSchema>
  )
}
