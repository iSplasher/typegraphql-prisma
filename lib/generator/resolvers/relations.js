"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ts_morph_1 = require("ts-morph");
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("../helpers");
const config_1 = require("../config");
const imports_1 = require("../imports");
function generateRelationsResolverClassesFromModel(project, baseDirPath, dmmfDocument, { model, relationFields, resolverName }) {
    const rootArgName = helpers_1.camelCase(model.typeName);
    const singleIdField = model.fields.find(field => field.isId);
    const singleUniqueField = model.fields.find(field => field.isUnique);
    const singleFilterField = singleIdField !== null && singleIdField !== void 0 ? singleIdField : singleUniqueField;
    const compositeIdFields = model.idFields.map(idField => model.fields.find(field => idField === field.name));
    const compositeUniqueFields = model.uniqueFields[0]
        ? model.uniqueFields[0].map(uniqueField => model.fields.find(field => uniqueField === field.name))
        : [];
    const compositeFilterFields = compositeIdFields.length > 0 ? compositeIdFields : compositeUniqueFields;
    const resolverDirPath = path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.relationsResolversFolderName, model.typeName);
    const filePath = path_1.default.resolve(resolverDirPath, `${resolverName}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    imports_1.generateTypeGraphQLImport(sourceFile);
    imports_1.generateModelsImports(sourceFile, [...relationFields.map(field => field.type), model.name].map(typeName => dmmfDocument.isModelName(typeName)
        ? dmmfDocument.getModelTypeName(typeName)
        : typeName), 3);
    const argTypeNames = relationFields
        .filter(it => it.argsTypeName !== undefined)
        .map(it => it.argsTypeName);
    imports_1.generateArgsImports(sourceFile, argTypeNames, 0);
    imports_1.generateHelpersFileImport(sourceFile, 3);
    sourceFile.addClass({
        name: resolverName,
        isExported: true,
        decorators: [
            {
                name: "TypeGraphQL.Resolver",
                arguments: [`_of => ${model.typeName}`],
            },
        ],
        methods: relationFields.map(field => {
            var _a;
            let whereConditionString = "";
            // TODO: refactor to AST
            if (singleFilterField) {
                whereConditionString = `
            ${singleFilterField.name}: ${rootArgName}.${singleFilterField.name},
          `;
            }
            else if (compositeFilterFields.length > 0) {
                whereConditionString = `
            ${compositeFilterFields.map(it => it.name).join("_")}: {
              ${compositeFilterFields
                    .map(idField => `${idField.name}: ${rootArgName}.${idField.name},`)
                    .join("\n")}
            },
          `;
            }
            else {
                throw new Error(`Unexpected error happened on generating 'whereConditionString' for ${model.typeName} relation resolver`);
            }
            return {
                name: (_a = field.typeFieldAlias) !== null && _a !== void 0 ? _a : field.name,
                isAsync: true,
                returnType: `Promise<${field.fieldTSType}>`,
                decorators: [
                    {
                        name: "TypeGraphQL.FieldResolver",
                        arguments: [
                            `_type => ${field.typeGraphQLType}`,
                            ts_morph_1.Writers.object({
                                nullable: `${!field.isRequired}`,
                                ...(field.docs && { description: `"${field.docs}"` }),
                            }),
                        ],
                    },
                ],
                parameters: [
                    {
                        name: rootArgName,
                        type: model.typeName,
                        decorators: [{ name: "TypeGraphQL.Root", arguments: [] }],
                    },
                    {
                        name: "ctx",
                        // TODO: import custom `ContextType`
                        type: "any",
                        decorators: [{ name: "TypeGraphQL.Ctx", arguments: [] }],
                    },
                    ...(!field.argsTypeName
                        ? []
                        : [
                            {
                                name: "args",
                                type: field.argsTypeName,
                                decorators: [{ name: "TypeGraphQL.Args", arguments: [] }],
                            },
                        ]),
                ],
                // TODO: refactor to AST
                statements: [
                    /* ts */ `return getPrismaFromContext(ctx).${helpers_1.camelCase(model.name)}.findUnique({
              where: {${whereConditionString}},
            }).${field.name}(${field.argsTypeName ? "args" : "{}"});`,
                ],
            };
        }),
    });
}
exports.default = generateRelationsResolverClassesFromModel;
//# sourceMappingURL=relations.js.map