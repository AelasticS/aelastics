import { ElementIssue, IIssue, Issue, Option } from "./../1.decision-model/decision-meta.model"
import * as t from "aelastics-types"
import { string } from "aelastics-types"

// #### Decision model types ####
export const RelationSchemaDesignIssues_TypeSchema = t.schema("RelationSchemaDesignIssues_TypeSchema")

export const OneToManyImplementIssue2 = t.subtype(Issue,
  {
    ForeignKey: Option,
    JoinTable: Option,
  },
  "OneToManyImplementIssue",
  RelationSchemaDesignIssues_TypeSchema,
)
export type IOneToManyImplementIssue = t.TypeOf<typeof OneToManyImplementIssue2>;


// export const OneToManyImplementIssue: IIssue = ({
//
// } as any) as IIssue

// export const OneToManyImplementIssue: string = "OneToManyImplementIssue"|"";

export enum Issues {
  OneToManyImplement = "OneToManyImplement",
  PrimaryKeyStrategy = "PrimaryKeyStrategy",
  NamingConvention = "NamingConvention",
}

export enum OneToManyImplementIssueOption {
  ForeinKey = "ForeignKey",
  JoinTable = "JoinTable"
}

// #### Config types ####
export type IOneToManyImplementConfig = {
  ForeignKey: {
    isSelected: true
    defaultValue: never
  },
  JoinTable: {
    isSelected: false
  }
} | {
  ForeignKey: {
    isSelected: false
  },
  JoinTable: {
    isSelected: true
    defaultValue: never
  }
};

export type IPrimaryKeyStrategyConfig = {
  AutoIncrement: {
    isSelected: true
    defaultValue?: never
  },
  UUID: {
    isSelected: false
  },
  Sequence: {
    isSelected: false
  }
} | {
  AutoIncrement: {
    isSelected: false
  },
  UUID: {
    isSelected: true
    defaultValue?: never
  },
  Sequence: {
    isSelected: false
  }
} | {
  AutoIncrement: {
    isSelected: false
  },
  UUID: {
    isSelected: false
  },
  Sequence: {
    isSelected: true
    defaultValue?: never
  }
};

export type INamingConvention = {
  CamelCase: {
    isSelected: true
    defaultValue?: never
  },
  SnakeCase: {
    isSelected: false
  }
} | {
  CamelCase: {
    isSelected: false
  },
  SnakeCase: {
    isSelected: true
    defaultValue?: never
  }
}

// ### Binding types ###
export type IEntityTransformationConfiguration = {
  PrimaryKeyStrategy: IPrimaryKeyStrategyConfig,
  NamingConvention: INamingConvention
};
export type IRelationshipTransformationConfiguration = { OneToManyImplement?: IOneToManyImplementConfig };

// ### Transformation configurations ###
export const companyConfig: IEntityTransformationConfiguration = {
  PrimaryKeyStrategy: {
    AutoIncrement: {
      isSelected: true,
      defaultValue: undefined,
    },
    UUID: {
      isSelected: false,
    },
    Sequence: {
      isSelected: false,
    },
  },
  NamingConvention: {
    CamelCase: {
      isSelected: true,
    },
    SnakeCase: {
      isSelected: false,
    },
  },
}

// export type Issue = "OneToManyImplement" | "PrimaryKeyStrategy" | "NamingConvention";
// export enum IssueEnum {
//   OneToManyImplement = "OneToManyImplement",
//   PrimaryKeyStrategy = "PrimaryKeyStrategy",
//   NamingConvention = "NamingConvention",
// }

