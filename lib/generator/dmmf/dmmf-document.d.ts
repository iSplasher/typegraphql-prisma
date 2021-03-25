import { DMMF as PrismaDMMF } from "@prisma/client/runtime";
import { DMMF } from "./types";
import { GenerateCodeOptions } from "../options";
export declare class DmmfDocument implements DMMF.Document {
    options: GenerateCodeOptions;
    private models;
    datamodel: DMMF.Datamodel;
    schema: DMMF.Schema;
    enums: DMMF.Enum[];
    modelMappings: DMMF.ModelMapping[];
    relationModels: DMMF.RelationModel[];
    constructor({ datamodel, schema, mappings }: PrismaDMMF.Document, options: GenerateCodeOptions);
    getModelTypeName(modelName: string): string | undefined;
    isModelName(typeName: string): boolean;
    isModelTypeName(typeName: string): boolean;
    getModelFieldAlias(modelName: string, fieldName: string): string | undefined;
}
