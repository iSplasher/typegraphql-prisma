import { DMMF as PrismaDMMF } from "@prisma/client/runtime";
import { GenerateCodeOptions } from "./options";
export default function generateCode(dmmf: PrismaDMMF.Document, options: GenerateCodeOptions, log?: (msg: string) => void): Promise<void>;
