"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const tslib_1 = require("tslib");
const sdk_1 = require("@prisma/sdk");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const generate_code_1 = tslib_1.__importDefault(require("../generator/generate-code"));
const removeDir_1 = tslib_1.__importDefault(require("../utils/removeDir"));
const helpers_1 = require("../generator/helpers");
function parseStringBoolean(stringBoolean) {
    return stringBoolean ? stringBoolean === "true" : undefined;
}
async function generate(options) {
    const outputDir = sdk_1.parseEnvValue(options.generator.output);
    await fs_1.promises.mkdir(outputDir, { recursive: true });
    await removeDir_1.default(outputDir, true);
    const prismaClientProvider = options.otherGenerators.find(it => sdk_1.parseEnvValue(it.provider) === "prisma-client-js");
    const prismaClientPath = sdk_1.parseEnvValue(prismaClientProvider.output);
    const prismaClientDmmf = require(prismaClientPath)
        .dmmf;
    const generatorConfig = options.generator.config;
    const config = {
        emitDMMF: parseStringBoolean(generatorConfig.emitDMMF),
        emitTranspiledCode: parseStringBoolean(generatorConfig.emitTranspiledCode),
        simpleResolvers: parseStringBoolean(generatorConfig.simpleResolvers),
        useOriginalMapping: parseStringBoolean(generatorConfig.useOriginalMapping),
        outputDirPath: outputDir,
        relativePrismaOutputPath: helpers_1.toUnixPath(path_1.default.relative(outputDir, prismaClientPath)),
        absolutePrismaOutputPath: prismaClientPath.includes("node_modules")
            ? "@prisma/client"
            : undefined,
        useUncheckedScalarInputs: parseStringBoolean(generatorConfig.useUncheckedScalarInputs),
    };
    if (config.emitDMMF) {
        await Promise.all([
            fs_1.promises.writeFile(path_1.default.resolve(outputDir, "./dmmf.json"), JSON.stringify(options.dmmf, null, 2)),
            fs_1.promises.writeFile(path_1.default.resolve(outputDir, "./prisma-client-dmmf.json"), JSON.stringify(prismaClientDmmf, null, 2)),
        ]);
    }
    // TODO: replace with `options.dmmf` when the spec match prisma client output
    await generate_code_1.default(prismaClientDmmf, config);
    return "";
}
exports.generate = generate;
//# sourceMappingURL=prisma-generator.js.map