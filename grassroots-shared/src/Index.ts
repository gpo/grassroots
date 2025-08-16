import fs from "fs";
import path from "path";

const srcPath = path.join(__dirname, "src");
const modules: Record<string, unknown> = {};

fs.readdirSync(srcPath)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const name = path.basename(file, ".js");
    modules[name] = require(path.join(srcPath, file));
  });

module.exports = modules;
