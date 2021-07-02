"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ts_morph_1 = require("ts-morph");
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("./helpers");
const enum_1 = tslib_1.__importDefault(require("./enum"));
const model_type_class_1 = tslib_1.__importDefault(require("./model-type-class"));
const relations_1 = tslib_1.__importDefault(require("./resolvers/relations"));
const type_class_1 = require("./type-class");
const full_crud_1 = tslib_1.__importDefault(require("./resolvers/full-crud"));
const config_1 = require("./config");
const imports_1 = require("./imports");
const dmmf_document_1 = require("./dmmf/dmmf-document");
const args_class_1 = tslib_1.__importDefault(require("./args-class"));
const separate_action_1 = tslib_1.__importDefault(require("./resolvers/separate-action"));
const prisma_version_1 = require("../utils/prisma-version");
const generate_enhance_1 = require("./generate-enhance");
const generate_scalars_1 = require("./generate-scalars");
const generate_helpers_1 = require("./generate-helpers");
const baseCompilerOptions = {
    target: ts_morph_1.ScriptTarget.ES2019,
    module: ts_morph_1.ModuleKind.CommonJS,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    esModuleInterop: true,
};
async function generateCode(dmmf, options, log = helpers_1.noop) {
    var _a;
    prisma_version_1.ensureInstalledCorrectPrismaPackage();
    const baseDirPath = options.outputDirPath;
    const emitTranspiledCode = (_a = options.emitTranspiledCode) !== null && _a !== void 0 ? _a : options.outputDirPath.includes("node_modules");
    const project = new ts_morph_1.Project({
        compilerOptions: {
            ...baseCompilerOptions,
            ...(emitTranspiledCode && { declaration: true }),
        },
    });
    const resolversDirPath = path_1.default.resolve(baseDirPath, config_1.resolversFolderName);
    log("Transforming dmmfDocument...");
    const dmmfDocument = new dmmf_document_1.DmmfDocument(dmmf, options);
    log("Generating enums...");
    const datamodelEnumNames = dmmfDocument.datamodel.enums.map(enumDef => enumDef.typeName);
    dmmfDocument.datamodel.enums.forEach(enumDef => enum_1.default(project, baseDirPath, enumDef));
    dmmfDocument.schema.enums
        // skip enums from datamodel
        .filter(enumDef => !datamodelEnumNames.includes(enumDef.typeName))
        .forEach(enumDef => enum_1.default(project, baseDirPath, enumDef));
    const emittedEnumNames = [
        ...new Set([
            ...dmmfDocument.schema.enums.map(it => it.typeName),
            ...dmmfDocument.datamodel.enums.map(it => it.typeName),
        ]),
    ];
    const enumsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.enumsFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateEnumsBarrelFile(enumsBarrelExportSourceFile, emittedEnumNames);
    log("Generating models...");
    dmmfDocument.datamodel.models.forEach(model => {
        const modelOutputType = dmmfDocument.schema.outputTypes.find(type => type.name === model.name);
        return model_type_class_1.default(project, baseDirPath, model, modelOutputType, dmmfDocument);
    });
    const modelsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.modelsFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateModelsBarrelFile(modelsBarrelExportSourceFile, dmmfDocument.datamodel.models.map(it => it.typeName));
    log("Generating output types...");
    const rootTypes = dmmfDocument.schema.outputTypes.filter(type => ["Query", "Mutation"].includes(type.name));
    const modelNames = dmmfDocument.datamodel.models.map(model => model.name);
    const outputTypesToGenerate = dmmfDocument.schema.outputTypes.filter(
    // skip generating models and root resolvers
    type => !modelNames.includes(type.name) && !rootTypes.includes(type));
    const outputTypesFieldsArgsToGenerate = outputTypesToGenerate
        .map(it => it.fields)
        .reduce((a, b) => a.concat(b), [])
        .filter(it => it.argsTypeName);
    outputTypesToGenerate.forEach(type => type_class_1.generateOutputTypeClassFromType(project, resolversDirPath, type, dmmfDocument));
    const outputsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.outputsFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateOutputsBarrelFile(outputsBarrelExportSourceFile, outputTypesToGenerate.map(it => it.typeName), outputTypesFieldsArgsToGenerate.length > 0);
    if (outputTypesFieldsArgsToGenerate.length > 0) {
        log("Generating output types args...");
        outputTypesFieldsArgsToGenerate.forEach(async (field) => {
            args_class_1.default(project, path_1.default.resolve(resolversDirPath, config_1.outputsFolderName), field.args, field.argsTypeName, dmmfDocument, 2);
        });
        const outputsArgsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.outputsFolderName, config_1.argsFolderName, "index.ts"), undefined, { overwrite: true });
        imports_1.generateArgsBarrelFile(outputsArgsBarrelExportSourceFile, outputTypesFieldsArgsToGenerate.map(it => it.argsTypeName));
    }
    log("Generating input types...");
    dmmfDocument.schema.inputTypes.forEach(type => type_class_1.generateInputTypeClassFromType(project, resolversDirPath, type, dmmfDocument, options));
    const inputsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.inputsFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateInputsBarrelFile(inputsBarrelExportSourceFile, dmmfDocument.schema.inputTypes.map(it => it.typeName));
    if (dmmfDocument.relationModels.length > 0) {
        log("Generating relation resolvers...");
        dmmfDocument.relationModels.forEach(relationModel => relations_1.default(project, baseDirPath, dmmfDocument, relationModel));
        const relationResolversBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.relationsResolversFolderName, "resolvers.index.ts"), undefined, { overwrite: true });
        imports_1.generateResolversBarrelFile("relations", relationResolversBarrelExportSourceFile, dmmfDocument.relationModels.map(relationModel => ({
            resolverName: relationModel.resolverName,
            modelName: relationModel.model.typeName,
        })));
        if (dmmfDocument.relationModels.length > 0) {
            log("Generating relation resolver args...");
            dmmfDocument.relationModels.forEach(async (relationModelData) => {
                const resolverDirPath = path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.relationsResolversFolderName, relationModelData.model.typeName);
                relationModelData.relationFields
                    .filter(field => field.argsTypeName)
                    .forEach(async (field) => {
                    args_class_1.default(project, resolverDirPath, field.outputTypeField.args, field.argsTypeName, dmmfDocument);
                });
                const argTypeNames = relationModelData.relationFields
                    .filter(it => it.argsTypeName !== undefined)
                    .map(it => it.argsTypeName);
                if (argTypeNames.length) {
                    const barrelExportSourceFile = project.createSourceFile(path_1.default.resolve(resolverDirPath, config_1.argsFolderName, "index.ts"), undefined, { overwrite: true });
                    imports_1.generateArgsBarrelFile(barrelExportSourceFile, argTypeNames);
                }
            });
        }
        const relationModelsWithArgs = dmmfDocument.relationModels.filter(relationModelData => relationModelData.relationFields.some(it => it.argsTypeName !== undefined));
        if (relationModelsWithArgs.length > 0) {
            const relationResolversArgsIndexSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.relationsResolversFolderName, "args.index.ts"), undefined, { overwrite: true });
            imports_1.generateArgsIndexFile(relationResolversArgsIndexSourceFile, relationModelsWithArgs.map(relationModelData => relationModelData.model.typeName));
        }
        const relationResolversIndexSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.relationsResolversFolderName, "index.ts"), undefined, { overwrite: true });
        imports_1.generateResolversIndexFile(relationResolversIndexSourceFile, "relations", relationModelsWithArgs.length > 0);
    }
    log("Generating crud resolvers...");
    dmmfDocument.modelMappings.forEach(async (mapping) => {
        const model = dmmfDocument.datamodel.models.find(model => model.name === mapping.model);
        full_crud_1.default(project, baseDirPath, mapping, model, dmmfDocument);
        mapping.actions.forEach(async (action) => {
            const model = dmmfDocument.datamodel.models.find(model => model.name === mapping.model);
            separate_action_1.default(project, baseDirPath, model, action, mapping, dmmfDocument);
        });
    });
    const generateMappingData = dmmfDocument.modelMappings.map(mapping => {
        const model = dmmfDocument.datamodel.models.find(model => model.name === mapping.model);
        return {
            modelName: model.typeName,
            resolverName: mapping.resolverName,
            actionResolverNames: mapping.actions.map(it => it.actionResolverName),
        };
    });
    const crudResolversBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.crudResolversFolderName, "resolvers-crud.index.ts"), undefined, { overwrite: true });
    imports_1.generateResolversBarrelFile("crud", crudResolversBarrelExportSourceFile, generateMappingData);
    const crudResolversActionsBarrelExportSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.crudResolversFolderName, "resolvers-actions.index.ts"), undefined, { overwrite: true });
    imports_1.generateResolversActionsBarrelFile(crudResolversActionsBarrelExportSourceFile, generateMappingData);
    const crudResolversIndexSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.crudResolversFolderName, "index.ts"), undefined, { overwrite: true });
    imports_1.generateResolversIndexFile(crudResolversIndexSourceFile, "crud", true);
    log("Generating crud resolvers args...");
    dmmfDocument.modelMappings.forEach(async (mapping) => {
        const actionsWithArgs = mapping.actions.filter(it => it.argsTypeName !== undefined);
        if (actionsWithArgs.length) {
            const model = dmmfDocument.datamodel.models.find(model => model.name === mapping.model);
            const resolverDirPath = path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.crudResolversFolderName, model.typeName);
            actionsWithArgs.forEach(async (action) => {
                args_class_1.default(project, resolverDirPath, action.method.args, action.argsTypeName, dmmfDocument);
            });
            const barrelExportSourceFile = project.createSourceFile(path_1.default.resolve(resolverDirPath, config_1.argsFolderName, "index.ts"), undefined, { overwrite: true });
            imports_1.generateArgsBarrelFile(barrelExportSourceFile, actionsWithArgs.map(it => it.argsTypeName));
        }
    });
    const crudResolversArgsIndexSourceFile = project.createSourceFile(path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.crudResolversFolderName, "args.index.ts"), undefined, { overwrite: true });
    imports_1.generateArgsIndexFile(crudResolversArgsIndexSourceFile, dmmfDocument.modelMappings
        .filter(mapping => mapping.actions.some(it => it.argsTypeName !== undefined))
        .map(mapping => mapping.modelTypeName));
    log("Generate enhance map");
    const enhanceSourceFile = project.createSourceFile(baseDirPath + "/enhance.ts", undefined, { overwrite: true });
    generate_enhance_1.generateEnhanceMap(enhanceSourceFile, dmmfDocument.modelMappings, dmmfDocument.relationModels, dmmfDocument.datamodel.models, dmmfDocument.schema.inputTypes, outputTypesToGenerate);
    log("Generate custom scalars");
    const scalarsSourceFile = project.createSourceFile(baseDirPath + "/scalars.ts", undefined, { overwrite: true });
    generate_scalars_1.generateCustomScalars(scalarsSourceFile, dmmfDocument.options);
    log("Generate custom scalars");
    const helpersSourceFile = project.createSourceFile(baseDirPath + "/helpers.ts", undefined, { overwrite: true });
    generate_helpers_1.generateHelpersFile(helpersSourceFile);
    log("Generating index file");
    const indexSourceFile = project.createSourceFile(baseDirPath + "/index.ts", undefined, { overwrite: true });
    imports_1.generateIndexFile(indexSourceFile, dmmfDocument.relationModels.length > 0);
    log("Emitting generated code files");
    if (emitTranspiledCode) {
        await project.emit();
    }
    else {
        for (const file of project.getSourceFiles()) {
            file.formatText({ indentSize: 2 });
        }
        await project.save();
    }
}
exports.default = generateCode;
//# sourceMappingURL=generate-code.js.map