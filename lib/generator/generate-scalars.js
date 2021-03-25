"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCustomScalars = void 0;
const imports_1 = require("./imports");
function generateCustomScalars(sourceFile, options) {
    imports_1.generatePrismaNamespaceImport(sourceFile, options);
    imports_1.generateGraphQLScalarTypeImport(sourceFile);
    sourceFile.addStatements(/* ts */ `
    export const DecimalJSScalar = new GraphQLScalarType({
      name: "Decimal",
      description: "GraphQL Scalar representing the Prisma.Decimal type, based on Decimal.js library.",
      serialize: (value: unknown) => {
        if (!(value instanceof Prisma.Decimal)) {
          throw new Error(\`[DecimalError] Invalid argument: \${typeof value}. Expected Prisma.Decimal instance.\`);
        }
        return value.toString();
      },
      parseValue: (value: unknown) => {
        if (!(typeof value === "string")) {
          throw new Error(\`[DecimalError] Invalid argument: \${typeof value}. Expected string.\`);
        }
        return new Prisma.Decimal(value);
      },
    });
  `);
}
exports.generateCustomScalars = generateCustomScalars;
//# sourceMappingURL=generate-scalars.js.map