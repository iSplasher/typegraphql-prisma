"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crudResolversFolderName = exports.relationsResolversFolderName = exports.argsFolderName = exports.resolversFolderName = exports.outputsFolderName = exports.inputsFolderName = exports.enumsFolderName = exports.modelsFolderName = exports.supportedMutationActions = exports.supportedQueryActions = exports.baseKeys = void 0;
exports.baseKeys = ["model", "plural"];
exports.supportedQueryActions = [
    "findUnique",
    "findFirst",
    "findMany",
    "aggregate",
    "groupBy",
];
exports.supportedMutationActions = [
    "create",
    "createMany",
    "delete",
    "update",
    "deleteMany",
    "updateMany",
    "upsert",
];
exports.modelsFolderName = "models";
exports.enumsFolderName = "enums";
exports.inputsFolderName = "inputs";
exports.outputsFolderName = "outputs";
exports.resolversFolderName = "resolvers";
exports.argsFolderName = "args";
exports.relationsResolversFolderName = "relations";
exports.crudResolversFolderName = "crud";
//# sourceMappingURL=config.js.map