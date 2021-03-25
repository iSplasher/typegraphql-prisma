"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocumentationAttributes = exports.attributeArgsRegex = exports.attributeNameRegex = exports.fieldAttributeRegex = exports.modelAttributeRegex = void 0;
exports.modelAttributeRegex = /(@@TypeGraphQL\.)+([A-z])+(\()+(.+)+(\))+/;
exports.fieldAttributeRegex = /(@TypeGraphQL\.)+([A-z])+(\()+(.+)+(\))+/;
exports.attributeNameRegex = /(?:\.)+([A-Za-z])+(?:\()+/;
exports.attributeArgsRegex = /(?:\()+([A-Za-z])+\:+(.+)+(?:\))+/;
function parseDocumentationAttributes(documentation, expectedAttributeName, expectedAttributeKind) {
    var _a, _b, _c, _d, _e;
    const attributeRegex = expectedAttributeKind === "model"
        ? exports.modelAttributeRegex
        : exports.fieldAttributeRegex;
    const attribute = (_a = documentation === null || documentation === void 0 ? void 0 : documentation.match(attributeRegex)) === null || _a === void 0 ? void 0 : _a[0];
    const attributeName = (_c = (_b = attribute === null || attribute === void 0 ? void 0 : attribute.match(exports.attributeNameRegex)) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.slice(1, -1);
    if (attributeName !== expectedAttributeName) {
        return {};
    }
    const rawAttributeArgs = (_e = (_d = attribute === null || attribute === void 0 ? void 0 : attribute.match(exports.attributeArgsRegex)) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.slice(1, -1);
    const splitRawArgsArray = rawAttributeArgs === null || rawAttributeArgs === void 0 ? void 0 : rawAttributeArgs.split(",").map(it => it.trim());
    const parsedAttributeArgs = splitRawArgsArray &&
        Object.fromEntries(splitRawArgsArray.map(it => {
            const [key, value] = it.split(": ");
            return [key, JSON.parse(value)];
        }));
    return parsedAttributeArgs !== null && parsedAttributeArgs !== void 0 ? parsedAttributeArgs : {};
}
exports.parseDocumentationAttributes = parseDocumentationAttributes;
//# sourceMappingURL=helpers.js.map