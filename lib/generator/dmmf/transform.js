"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRelationModel = exports.transformEnums = exports.transformModelWithFields = exports.transformBareModel = exports.transformMappings = exports.transformSchema = void 0;
const tslib_1 = require("tslib");
const helpers_1 = require("./helpers");
const helpers_2 = require("../helpers");
const pluralize_1 = tslib_1.__importDefault(require("pluralize"));
const config_1 = require("../config");
function transformSchema(datamodel, dmmfDocument) {
    var _a, _b, _c, _d;
    const inputObjectTypes = [
        ...((_a = datamodel.inputObjectTypes.prisma) !== null && _a !== void 0 ? _a : []),
        ...((_b = datamodel.inputObjectTypes.model) !== null && _b !== void 0 ? _b : []),
    ];
    const outputObjectTypes = [
        ...((_c = datamodel.outputObjectTypes.prisma) !== null && _c !== void 0 ? _c : []),
        ...((_d = datamodel.outputObjectTypes.model) !== null && _d !== void 0 ? _d : []),
    ];
    return {
        inputTypes: inputObjectTypes
            .filter(uncheckedScalarInputsFilter(dmmfDocument))
            .map(transformInputType(dmmfDocument)),
        outputTypes: outputObjectTypes.map(transformOutputType(dmmfDocument)),
        rootMutationType: datamodel.rootMutationType,
        rootQueryType: datamodel.rootQueryType,
    };
}
exports.transformSchema = transformSchema;
function transformMappings(mapping, dmmfDocument, options) {
    return mapping.map(transformMapping(dmmfDocument, options));
}
exports.transformMappings = transformMappings;
function transformBareModel(model) {
    var _a;
    const attributeArgs = helpers_1.parseDocumentationAttributes(model.documentation, "type", "model");
    return {
        ...model,
        typeName: (_a = attributeArgs.name) !== null && _a !== void 0 ? _a : helpers_2.pascalCase(model.name),
        fields: [],
        docs: helpers_2.cleanDocsString(model.documentation),
    };
}
exports.transformBareModel = transformBareModel;
function transformModelWithFields(dmmfDocument) {
    return (model) => {
        return {
            ...transformBareModel(model),
            fields: model.fields.map(transformField(dmmfDocument)),
        };
    };
}
exports.transformModelWithFields = transformModelWithFields;
function transformField(dmmfDocument) {
    return (field) => {
        const attributeArgs = helpers_1.parseDocumentationAttributes(field.documentation, "field", "field");
        const location = field.kind === "enum"
            ? "enumTypes"
            : field.kind === "object"
                ? "inputObjectTypes"
                : "scalar";
        const typeInfo = {
            location,
            isList: field.isList,
            type: field.type,
        };
        const fieldTSType = helpers_2.getFieldTSType(dmmfDocument, typeInfo, field.isRequired, false);
        const typeGraphQLType = helpers_2.getTypeGraphQLType(typeInfo, dmmfDocument);
        const { output = false, input = false } = helpers_1.parseDocumentationAttributes(field.documentation, "omit", "field");
        return {
            ...field,
            location,
            typeFieldAlias: attributeArgs.name,
            fieldTSType,
            typeGraphQLType,
            docs: helpers_2.cleanDocsString(field.documentation),
            isOmitted: { output, input },
        };
    };
}
function uncheckedScalarInputsFilter(dmmfDocument) {
    const { useUncheckedScalarInputs } = dmmfDocument.options;
    return (inputType) => {
        return useUncheckedScalarInputs
            ? true
            : !inputType.name.includes("Unchecked");
    };
}
function transformInputType(dmmfDocument) {
    return (inputType) => {
        const modelName = helpers_2.getModelNameFromInputType(inputType.name);
        const modelType = modelName
            ? dmmfDocument.datamodel.models.find(it => it.name === modelName)
            : undefined;
        return {
            ...inputType,
            typeName: helpers_2.getInputTypeName(inputType.name, dmmfDocument),
            fields: inputType.fields
                .filter(field => field.deprecation === undefined)
                .map(field => {
                var _a;
                const modelField = modelType === null || modelType === void 0 ? void 0 : modelType.fields.find(it => it.name === field.name);
                const typeName = (_a = modelField === null || modelField === void 0 ? void 0 : modelField.typeFieldAlias) !== null && _a !== void 0 ? _a : field.name;
                const selectedInputType = selectInputTypeFromTypes(dmmfDocument)(field.inputTypes);
                const typeGraphQLType = helpers_2.getTypeGraphQLType(selectedInputType, dmmfDocument);
                const fieldTSType = helpers_2.getFieldTSType(dmmfDocument, selectedInputType, field.isRequired, true);
                return {
                    ...field,
                    selectedInputType,
                    typeName,
                    typeGraphQLType,
                    fieldTSType,
                    hasMappedName: field.name !== typeName,
                };
            }),
        };
    };
}
function transformOutputType(dmmfDocument) {
    return (outputType) => {
        const typeName = getMappedOutputTypeName(dmmfDocument, outputType.name);
        return {
            ...outputType,
            typeName,
            fields: outputType.fields
                .filter(field => field.deprecation === undefined)
                .map(field => {
                const isFieldRequired = field.isNullable !== true;
                const outputTypeInfo = {
                    ...field.outputType,
                    type: getMappedOutputTypeName(dmmfDocument, field.outputType.type),
                };
                const fieldTSType = helpers_2.getFieldTSType(dmmfDocument, outputTypeInfo, isFieldRequired, false);
                const typeGraphQLType = helpers_2.getTypeGraphQLType(outputTypeInfo, dmmfDocument);
                const args = field.args.map(arg => {
                    const selectedInputType = selectInputTypeFromTypes(dmmfDocument)(arg.inputTypes);
                    const typeGraphQLType = helpers_2.getTypeGraphQLType(selectedInputType, dmmfDocument);
                    const fieldTSType = helpers_2.getFieldTSType(dmmfDocument, selectedInputType, arg.isRequired, true);
                    return {
                        ...arg,
                        selectedInputType,
                        fieldTSType,
                        typeGraphQLType,
                        hasMappedName: arg.name !== typeName,
                        // TODO: add proper mapping in the future if needed
                        typeName: arg.name,
                    };
                });
                const argsTypeName = args.length > 0
                    ? `${typeName}${helpers_2.pascalCase(field.name)}Args`
                    : undefined;
                return {
                    ...field,
                    isRequired: isFieldRequired,
                    outputType: outputTypeInfo,
                    fieldTSType,
                    typeGraphQLType,
                    args,
                    argsTypeName,
                };
            }),
        };
    };
}
function getMappedOutputTypeName(dmmfDocument, outputTypeName) {
    if (outputTypeName.startsWith("Aggregate")) {
        return `Aggregate${dmmfDocument.getModelTypeName(outputTypeName.replace("Aggregate", ""))}`;
    }
    const dedicatedTypeSuffix = [
        "CountAggregateOutputType",
        "MinAggregateOutputType",
        "MaxAggregateOutputType",
        "AvgAggregateOutputType",
        "SumAggregateOutputType",
        "GroupByOutputType",
        "CountOutputType",
    ].find(type => outputTypeName.includes(type));
    if (dedicatedTypeSuffix) {
        const modelName = outputTypeName.replace(dedicatedTypeSuffix, "");
        const operationName = outputTypeName
            .replace(modelName, "")
            .replace("OutputType", "");
        return `${dmmfDocument.getModelTypeName(modelName)}${operationName}`;
    }
    return outputTypeName;
}
function transformMapping(dmmfDocument, options) {
    return (mapping) => {
        var _a;
        const { model, plural, ...availableActions } = mapping;
        const modelTypeName = (_a = dmmfDocument.getModelTypeName(model)) !== null && _a !== void 0 ? _a : model;
        const actions = Object.entries(availableActions)
            .filter(([actionKind, fieldName]) => fieldName && getOperationKindName(actionKind))
            .map(([modelAction, fieldName]) => {
            const kind = modelAction;
            const actionOutputType = dmmfDocument.schema.outputTypes.find(type => type.fields.some(field => field.name === fieldName));
            if (!actionOutputType) {
                throw new Error(`Cannot find type with field ${fieldName} in root types definitions!`);
            }
            const method = actionOutputType.fields.find(field => field.name === fieldName);
            const argsTypeName = method.args.length > 0
                ? `${helpers_2.pascalCase(`${kind}${dmmfDocument.getModelTypeName(mapping.model)}`)}Args`
                : undefined;
            const outputTypeName = method.outputType.type;
            const actionResolverName = `${helpers_2.pascalCase(kind)}${modelTypeName}Resolver`;
            const returnTSType = helpers_2.getFieldTSType(dmmfDocument, method.outputType, method.isRequired, false, mapping.model, modelTypeName);
            const typeGraphQLType = helpers_2.getTypeGraphQLType(method.outputType, dmmfDocument, mapping.model, modelTypeName);
            return {
                name: getMappedActionName(kind, modelTypeName, options),
                fieldName,
                kind: kind,
                operation: getOperationKindName(kind),
                method,
                argsTypeName,
                outputTypeName,
                actionResolverName,
                returnTSType,
                typeGraphQLType,
            };
        });
        const resolverName = `${modelTypeName}CrudResolver`;
        return {
            model,
            modelTypeName,
            plural,
            actions,
            collectionName: helpers_2.camelCase(mapping.model),
            resolverName,
        };
    };
}
function selectInputTypeFromTypes(dmmfDocument) {
    return (inputTypes) => {
        const { useUncheckedScalarInputs } = dmmfDocument.options;
        let possibleInputTypes;
        possibleInputTypes = inputTypes.filter(it => it.location === "inputObjectTypes");
        if (possibleInputTypes.length === 0) {
            possibleInputTypes = inputTypes.filter(it => it.location === "enumTypes");
        }
        if (possibleInputTypes.length === 0) {
            possibleInputTypes = inputTypes;
        }
        const selectedInputType = possibleInputTypes.find(it => it.isList) ||
            (useUncheckedScalarInputs &&
                possibleInputTypes.find(it => it.type.includes("Unchecked"))) ||
            possibleInputTypes[0];
        let inputType = selectedInputType.type;
        if (selectedInputType.location === "enumTypes") {
            const enumDef = dmmfDocument.enums.find(it => it.name === inputType);
            inputType = enumDef.typeName;
        }
        else if (selectedInputType.location === "inputObjectTypes") {
            inputType = helpers_2.getInputTypeName(inputType, dmmfDocument);
        }
        return {
            ...selectedInputType,
            type: inputType,
        };
    };
}
function getMappedActionName(actionName, typeName, options) {
    const defaultMappedActionName = `${actionName}${typeName}`;
    if (options.useOriginalMapping) {
        return defaultMappedActionName;
    }
    const hasNoPlural = typeName === pluralize_1.default(typeName);
    if (hasNoPlural) {
        return defaultMappedActionName;
    }
    switch (actionName) {
        case "findUnique": {
            return helpers_2.camelCase(typeName);
        }
        case "findMany": {
            return pluralize_1.default(helpers_2.camelCase(typeName));
        }
        default: {
            return defaultMappedActionName;
        }
    }
}
function getOperationKindName(actionName) {
    if (config_1.supportedQueryActions.includes(actionName)) {
        return "Query";
    }
    if (config_1.supportedMutationActions.includes(actionName)) {
        return "Mutation";
    }
    // throw new Error(`Unsupported operation kind: '${actionName}'`);
}
function transformEnums(dmmfDocument) {
    return (enumDef) => {
        const modelName = enumDef.name.includes("ScalarFieldEnum")
            ? enumDef.name.replace("ScalarFieldEnum", "")
            : undefined;
        const typeName = modelName
            ? `${dmmfDocument.getModelTypeName(modelName)}ScalarFieldEnum`
            : enumDef.name;
        const enumValues = enumDef.values;
        return {
            ...enumDef,
            docs: "documentation" in enumDef
                ? helpers_2.cleanDocsString(enumDef.documentation)
                : undefined,
            typeName,
            valuesMap: enumValues.map(enumValue => {
                const enumValueName = typeof enumValue === "string" ? enumValue : enumValue.name;
                return {
                    value: enumValueName,
                    name: (modelName &&
                        dmmfDocument.getModelFieldAlias(modelName, enumValueName)) ||
                        enumValueName,
                };
            }),
        };
    };
}
exports.transformEnums = transformEnums;
function generateRelationModel(dmmfDocument) {
    return (model) => {
        const outputType = dmmfDocument.schema.outputTypes.find(type => type.name === model.name);
        if (!outputType) {
            console.log(dmmfDocument.schema.outputTypes, model);
        }
        const resolverName = `${model.typeName}RelationsResolver`;
        const relationFields = model.fields
            .filter(field => field.relationName && !field.isOmitted.output)
            .map(field => {
            const outputTypeField = outputType.fields.find(it => it.name === field.name);
            const argsTypeName = outputTypeField.args.length > 0
                ? `${model.typeName}${helpers_2.pascalCase(field.name)}Args`
                : undefined;
            return {
                ...field,
                outputTypeField,
                argsTypeName,
            };
        });
        return {
            model,
            outputType,
            relationFields,
            resolverName,
        };
    };
}
exports.generateRelationModel = generateRelationModel;
//# sourceMappingURL=transform.js.map