"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArgsImports = exports.generateResolversOutputsImports = exports.generateOutputsImports = exports.generateInputsImports = exports.generateEnumsImports = exports.generateModelsImports = exports.generateResolversIndexFile = exports.generateResolversActionsBarrelFile = exports.generateResolversBarrelFile = exports.generateIndexFile = exports.generateOutputsBarrelFile = exports.generateInputsBarrelFile = exports.generateEnumsBarrelFile = exports.generateModelsBarrelFile = exports.generateArgsIndexFile = exports.generateArgsBarrelFile = exports.generatePrismaNamespaceImport = exports.generateHelpersFileImport = exports.generateCustomScalarsImport = exports.generateGraphQLScalarTypeImport = exports.generateGraphQLScalarsImport = exports.generateGraphQLFieldsImport = exports.generateTypeGraphQLImport = void 0;
const tslib_1 = require("tslib");
const ts_morph_1 = require("ts-morph");
const path_1 = tslib_1.__importDefault(require("path"));
const config_1 = require("./config");
function generateTypeGraphQLImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "type-graphql",
        namespaceImport: "TypeGraphQL",
    });
}
exports.generateTypeGraphQLImport = generateTypeGraphQLImport;
function generateGraphQLFieldsImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "graphql-fields",
        defaultImport: "graphqlFields",
    });
    sourceFile.addImportDeclaration({
        moduleSpecifier: "graphql",
        namedImports: ["GraphQLResolveInfo"],
    });
}
exports.generateGraphQLFieldsImport = generateGraphQLFieldsImport;
function generateGraphQLScalarsImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "graphql-scalars",
        namespaceImport: "GraphQLScalars",
    });
}
exports.generateGraphQLScalarsImport = generateGraphQLScalarsImport;
function generateGraphQLScalarTypeImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "graphql",
        namedImports: ["GraphQLScalarType"],
    });
}
exports.generateGraphQLScalarTypeImport = generateGraphQLScalarTypeImport;
function generateCustomScalarsImport(sourceFile, level = 0) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: (level === 0 ? "./" : "") +
            path_1.default.posix.join(...Array(level).fill(".."), "scalars"),
        namedImports: ["DecimalJSScalar"],
    });
}
exports.generateCustomScalarsImport = generateCustomScalarsImport;
function generateHelpersFileImport(sourceFile, level = 0) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: (level === 0 ? "./" : "") +
            path_1.default.posix.join(...Array(level).fill(".."), "helpers"),
        namedImports: [
            "transformFields",
            "getPrismaFromContext",
            "transformCountFieldIntoSelectRelationsCount",
        ],
    });
}
exports.generateHelpersFileImport = generateHelpersFileImport;
function generatePrismaNamespaceImport(sourceFile, options, level = 0) {
    var _a;
    sourceFile.addImportDeclaration({
        moduleSpecifier: (_a = options.absolutePrismaOutputPath) !== null && _a !== void 0 ? _a : (level === 0 ? "./" : "") +
            path_1.default.posix.join(...Array(level).fill(".."), options.relativePrismaOutputPath),
        namedImports: ["Prisma"],
    });
}
exports.generatePrismaNamespaceImport = generatePrismaNamespaceImport;
function generateArgsBarrelFile(sourceFile, argsTypeNames) {
    sourceFile.addExportDeclarations(argsTypeNames
        .sort()
        .map(argTypeName => ({
        moduleSpecifier: `./${argTypeName}`,
        namedExports: [argTypeName],
    })));
}
exports.generateArgsBarrelFile = generateArgsBarrelFile;
function generateArgsIndexFile(sourceFile, typeNames) {
    sourceFile.addExportDeclarations(typeNames
        .sort()
        .map(typeName => ({
        moduleSpecifier: `./${typeName}/args`,
    })));
}
exports.generateArgsIndexFile = generateArgsIndexFile;
function generateModelsBarrelFile(sourceFile, modelNames) {
    sourceFile.addExportDeclarations(modelNames
        .sort()
        .map(modelName => ({
        moduleSpecifier: `./${modelName}`,
        namedExports: [modelName],
    })));
}
exports.generateModelsBarrelFile = generateModelsBarrelFile;
function generateEnumsBarrelFile(sourceFile, enumTypeNames) {
    sourceFile.addExportDeclarations(enumTypeNames
        .sort()
        .map(enumTypeName => ({
        moduleSpecifier: `./${enumTypeName}`,
        namedExports: [enumTypeName],
    })));
}
exports.generateEnumsBarrelFile = generateEnumsBarrelFile;
function generateInputsBarrelFile(sourceFile, inputTypeNames) {
    sourceFile.addExportDeclarations(inputTypeNames
        .sort()
        .map(inputTypeName => ({
        moduleSpecifier: `./${inputTypeName}`,
        namedExports: [inputTypeName],
    })));
}
exports.generateInputsBarrelFile = generateInputsBarrelFile;
function generateOutputsBarrelFile(sourceFile, outputTypeNames, hasSomeArgs) {
    sourceFile.addExportDeclarations(outputTypeNames
        .sort()
        .map(outputTypeName => ({
        moduleSpecifier: `./${outputTypeName}`,
        namedExports: [outputTypeName],
    })));
    if (hasSomeArgs) {
        sourceFile.addExportDeclaration({ moduleSpecifier: `./${config_1.argsFolderName}` });
    }
}
exports.generateOutputsBarrelFile = generateOutputsBarrelFile;
function generateIndexFile(sourceFile, hasSomeRelations) {
    sourceFile.addExportDeclarations([
        { moduleSpecifier: `./${config_1.enumsFolderName}` },
        { moduleSpecifier: `./${config_1.modelsFolderName}` },
        { moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.crudResolversFolderName}` },
        ...(hasSomeRelations
            ? [
                {
                    moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.relationsResolversFolderName}`,
                },
            ]
            : []),
        { moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.inputsFolderName}` },
        { moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.outputsFolderName}` },
        { moduleSpecifier: `./enhance` },
        { moduleSpecifier: `./scalars` },
    ]);
    sourceFile.addImportDeclarations([
        {
            moduleSpecifier: `type-graphql`,
            namedImports: ["NonEmptyArray"],
        },
        {
            moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.crudResolversFolderName}/resolvers-crud.index`,
            namespaceImport: "crudResolversImport",
        },
        ...(hasSomeRelations
            ? [
                {
                    moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.relationsResolversFolderName}/resolvers.index`,
                    namespaceImport: "relationResolversImport",
                },
            ]
            : []),
    ]);
    sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: ts_morph_1.VariableDeclarationKind.Const,
        declarations: [
            {
                name: "crudResolvers",
                initializer: `Object.values(crudResolversImport) as unknown as NonEmptyArray<Function>`,
            },
        ],
    });
    if (hasSomeRelations) {
        sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: ts_morph_1.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "relationResolvers",
                    initializer: `Object.values(relationResolversImport) as unknown as NonEmptyArray<Function>`,
                },
            ],
        });
    }
    sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: ts_morph_1.VariableDeclarationKind.Const,
        declarations: [
            {
                name: "resolvers",
                initializer: `[...crudResolvers${hasSomeRelations ? ", ...relationResolvers" : ""}] as unknown as NonEmptyArray<Function>`,
            },
        ],
    });
}
exports.generateIndexFile = generateIndexFile;
function generateResolversBarrelFile(type, sourceFile, resolversData) {
    resolversData
        .sort((a, b) => a.modelName > b.modelName ? 1 : a.modelName < b.modelName ? -1 : 0)
        .forEach(({ modelName, resolverName }) => {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${modelName}/${resolverName}`,
            namedExports: [resolverName],
        });
    });
}
exports.generateResolversBarrelFile = generateResolversBarrelFile;
function generateResolversActionsBarrelFile(sourceFile, resolversData) {
    resolversData
        .sort((a, b) => a.modelName > b.modelName ? 1 : a.modelName < b.modelName ? -1 : 0)
        .forEach(({ modelName, actionResolverNames }) => {
        if (actionResolverNames) {
            actionResolverNames.forEach(actionResolverName => {
                sourceFile.addExportDeclaration({
                    moduleSpecifier: `./${modelName}/${actionResolverName}`,
                    namedExports: [actionResolverName],
                });
            });
        }
    });
}
exports.generateResolversActionsBarrelFile = generateResolversActionsBarrelFile;
function generateResolversIndexFile(sourceFile, type, hasSomeArgs) {
    if (type === "crud") {
        sourceFile.addExportDeclarations([
            { moduleSpecifier: `./resolvers-actions.index` },
            { moduleSpecifier: `./resolvers-crud.index` },
        ]);
    }
    else {
        sourceFile.addExportDeclarations([
            { moduleSpecifier: `./resolvers.index` },
        ]);
    }
    if (hasSomeArgs) {
        sourceFile.addExportDeclarations([{ moduleSpecifier: `./args.index` }]);
    }
}
exports.generateResolversIndexFile = generateResolversIndexFile;
exports.generateModelsImports = createImportGenerator(config_1.modelsFolderName);
exports.generateEnumsImports = createImportGenerator(config_1.enumsFolderName);
exports.generateInputsImports = createImportGenerator(config_1.inputsFolderName);
exports.generateOutputsImports = createImportGenerator(config_1.outputsFolderName);
// TODO: unify with generateOutputsImports
exports.generateResolversOutputsImports = createImportGenerator(`${config_1.resolversFolderName}/${config_1.outputsFolderName}`);
exports.generateArgsImports = createImportGenerator(config_1.argsFolderName);
function createImportGenerator(elementsDirName) {
    return (sourceFile, elementsNames, level = 1) => {
        const distinctElementsNames = [...new Set(elementsNames)].sort();
        for (const elementName of distinctElementsNames) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: (level === 0 ? "./" : "") +
                    path_1.default.posix.join(...Array(level).fill(".."), elementsDirName, elementName),
                // TODO: refactor to default exports
                // defaultImport: elementName,
                namedImports: [elementName],
            });
        }
    };
}
//# sourceMappingURL=imports.js.map