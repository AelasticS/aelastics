// #### Issue types ####
export type IOneToManyImplement = {
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

export type IPrimaryKeyStrategy = {
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
export type IEntityTransformationConfiguration = { PrimaryKeyStrategy: IPrimaryKeyStrategy, NamingConvention: INamingConvention };
export type IRelationshipTransformationConfiguration = { OneToManyImplement?: IOneToManyImplement };

// ### Transformation configurations ###
export const companyConfig: IEntityTransformationConfiguration = {
    PrimaryKeyStrategy: {
        AutoIncrement: {
            isSelected: true,
            defaultValue: undefined
        },
        UUID: {
            isSelected: false
        },
        Sequence: {
            isSelected: false
        }
    },
    NamingConvention: {
        CamelCase: {
            isSelected: true
        },
        SnakeCase: {
            isSelected: false
        }
    }
};

