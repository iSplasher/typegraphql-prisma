import { SourceFile } from "ts-morph";
import { DMMF } from "./dmmf/types";
export declare function generateEnhanceMap(sourceFile: SourceFile, modelMappings: DMMF.ModelMapping[], relationModels: DMMF.RelationModel[], models: DMMF.Model[], inputs: DMMF.InputType[], outputs: DMMF.OutputType[]): void;
