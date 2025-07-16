// Based on https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/main/src/index.ts.

import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { TSESLint } from "@typescript-eslint/utils";
import * as parserBase from "@typescript-eslint/parser";
import type { FlatConfig, Linter } from "@typescript-eslint/utils/ts-eslint";
import rules from "./rules/Index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const { name, version } = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf8"),
) as {
  name: string;
  version: string;
};
// Most of this is copied and simplified from https://github.com/typescript-eslint/typescript-eslint/blob/v8.22.0/packages/typescript-eslint/src/configs/recommended.ts

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder

const meta = {
  name,
  version,
};
export const parser: TSESLint.FlatConfig.Parser = {
  meta: parserBase.meta,
  parseForESLint: parserBase.parseForESLint,
};

const recommended: Partial<Linter.RulesRecord> = {
  "grassroots/dto-and-entity-style": "error",
  "grassroots/entity-use": "error",
};

const flatBaseConfig = (
  plugin: FlatConfig.Plugin,
  parser: FlatConfig.Parser,
): FlatConfig.Config => {
  const baseConfig: FlatConfig.Config = {
    name: "grassroots/base",
    languageOptions: {
      parser,
      sourceType: "module",
    },
    plugins: {
      grassroots: plugin,
    },
  };
  return baseConfig;
};

const plugin: TSESLint.FlatConfig.Plugin = { rules, meta };
const configs: TSESLint.FlatConfig.SharedConfigs = {
  flatRecommended: [
    {
      ...flatBaseConfig(plugin, parser),
      ...{
        name: "grassroots/recommended",
        rules: recommended,
      },
    },
  ],
};
export { plugin, rules, configs };
