export declare namespace DMMF {
    interface Document {
        datamodel: Datamodel;
        schema: Schema;
        modelMappings: ModelMapping[];
    }
    interface Enum {
        name: string;
        dbName?: string | null;
        typeName: string;
        docs: string | undefined;
        valuesMap: Array<{
            name: string;
            value: string;
        }>;
    }
    interface Datamodel {
        models: Model[];
        enums: Enum[];
    }
    interface UniqueIndex {
        name: string;
        fields: string[];
    }
    interface Model {
        name: string;
        isEmbedded: boolean;
        dbName: string | null;
        fields: Field[];
        uniqueFields: string[][];
        uniqueIndexes: UniqueIndex[];
        idFields: string[];
        typeName: string;
        docs: string | undefined;
    }
    type FieldKind = "scalar" | "object" | "enum" | "unsupported";
    type FieldNamespace = "model" | "prisma";
    type FieldLocation = "scalar" | "inputObjectTypes" | "outputObjectTypes" | "enumTypes";
    interface Field {
        name: string;
        isRequired: boolean;
        isList: boolean;
        isUnique: boolean;
        isId: boolean;
        type: string;
        dbNames?: string[] | null;
        isGenerated: boolean;
        hasDefaultValue: boolean;
        default?: FieldDefault | string | boolean | number;
        relationToFields?: any[];
        relationOnDelete?: string;
        relationName?: string;
        location: FieldLocation;
        typeFieldAlias?: string;
        typeGraphQLType: string;
        fieldTSType: string;
        docs: string | undefined;
        isOmitted: {
            input: boolean;
            output: boolean;
        };
    }
    interface FieldDefault {
        name: string;
        args: any[];
    }
    interface Schema {
        rootQueryType?: string;
        rootMutationType?: string;
        inputTypes: InputType[];
        outputTypes: OutputType[];
        enums: Enum[];
    }
    interface Query {
        name: string;
        args: SchemaArg[];
        output: QueryOutput;
    }
    interface QueryOutput {
        name: string;
        isRequired: boolean;
        isList: boolean;
    }
    type ArgType = string | InputType | Enum;
    interface SchemaArgInputType {
        isList: boolean;
        location: FieldLocation;
        namespace?: FieldNamespace;
        type: string;
    }
    interface SchemaArg {
        name: string;
        comment?: string;
        isNullable: boolean;
        isRequired: boolean;
        deprecation?: Deprecation;
        selectedInputType: SchemaArgInputType;
        typeName: string;
        typeGraphQLType: string;
        fieldTSType: string;
        hasMappedName: boolean;
    }
    interface OutputType {
        name: string;
        isEmbedded?: boolean;
        fields: OutputSchemaField[];
        typeName: string;
    }
    interface SchemaField {
        name: string;
        outputType: TypeInfo;
        args: SchemaArg[];
        deprecation?: Deprecation;
        typeGraphQLType: string;
        fieldTSType: string;
        isRequired: boolean;
    }
    interface Deprecation {
        sinceVersion: string;
        reason: string;
        plannedRemovalVersion?: string;
    }
    interface TypeInfo {
        type: string;
        isList: boolean;
        location: FieldLocation;
        namespace?: FieldNamespace;
    }
    interface OutputSchemaField extends SchemaField {
        argsTypeName: string | undefined;
    }
    interface InputType {
        name: string;
        constraints: {
            maxNumFields: number | null;
            minNumFields: number | null;
        };
        fields: SchemaArg[];
        typeName: string;
    }
    interface ModelMapping {
        model: string;
        plural: string;
        actions: Action[];
        collectionName: string;
        resolverName: string;
        modelTypeName: string;
    }
    interface Action {
        name: string;
        fieldName: string;
        kind: ModelAction;
        operation: "Query" | "Mutation";
        method: OutputSchemaField;
        argsTypeName: string | undefined;
        outputTypeName: string;
        actionResolverName: string;
        returnTSType: string;
        typeGraphQLType: string;
    }
    enum ModelAction {
        findUnique = "findUnique",
        findFirst = "findFirst",
        findMany = "findMany",
        create = "create",
        createMany = "createMany",
        update = "update",
        updateMany = "updateMany",
        upsert = "upsert",
        delete = "delete",
        deleteMany = "deleteMany",
        groupBy = "groupBy",
        aggregate = "aggregate"
    }
    interface RelationModel {
        model: Model;
        outputType: OutputType;
        relationFields: RelationField[];
        resolverName: string;
    }
    interface RelationField extends Field {
        outputTypeField: OutputSchemaField;
        argsTypeName: string | undefined;
    }
}
