const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// @react-three/fiber/native loads `three` with require(), which resolves to
// three.cjs. That build calls process.emitWarning (missing in React Native)
// and would also be a second copy of THREE next to the ESM one our code
// imports. Point every `three` import at the single ESM build.
const THREE_ESM = path.resolve(__dirname, "node_modules/three/build/three.module.js");
const upstream = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "three") return { type: "sourceFile", filePath: THREE_ESM };
  return (upstream ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
