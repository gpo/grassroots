import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslint from "@eslint/js";
import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import pluginRouter from "@tanstack/eslint-plugin-router";
import checkFile from "eslint-plugin-check-file";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintNestJs from "@darraghor/eslint-plugin-nestjs-typed";
import * as GrassrootsEslintRules from "./eslint_rules/dist/Index.js";
import reactRefresh from "eslint-plugin-react-refresh";
import vitest from "@vitest/eslint-plugin";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginRxJs from "@smarttools/eslint-plugin-rxjs";

export default tseslint.config(
  includeIgnoreFile(fileURLToPath(new URL(".gitignore", import.meta.url))),
  ...pluginRouter.configs["flat/recommended"],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  eslintNestJs.configs.flatRecommended,
  ...GrassrootsEslintRules.configs.flatRecommended,
  reactRefresh.configs.recommended,
  vitest.configs.recommended,
  eslintPluginImport.flatConfigs.recommended,
  eslintPluginImport.flatConfigs.typescript,
  eslintPluginRxJs.configs.recommended,
  {
    ignores: [
      "**/*.mjs",
      "**/*.cjs",
      "**/*.js",
      "**/*.gen.ts",
      "grassroots-backend/src/migrations/",
      "eslint_rules/dist",
      "eslint_rules/vitest.config.ts",
      "grassroots-backend/vitest.config.ts",
    ],
  },
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      ecmaVersion: 5,
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "check-file": checkFile,
      rxjs: eslintPluginRxJs,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        { allowConstantLoopConditions: "always" },
      ],
      "react/jsx-no-useless-fragment": "error",
      "check-file/no-index": "error",
      "check-file/filename-naming-convention": [
        "error",
        {
          "grassroots-backend/src/**/*.{jsx,tsx,js,ts}": "PASCAL_CASE",
          "eslint_rules/src/**/*.{jsx,tsx,js,ts}": "PASCAL_CASE",
          "grassroots-frontend/src/**/*.{jsx,tsx,js,ts}": "PASCAL_CASE",
          "grassroots-frontend/src/hooks/**/*.{jsx,tsx,js,ts}": "CAMEL_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      // We use autoTagControllers currently.
      "@darraghor/nestjs-typed/controllers-should-supply-api-tags": "off",
      // The nest Swagger CLI adds these automatically in most cases.
      "@darraghor/nestjs-typed/api-method-should-specify-api-response": "off",
      // This is currently reporting a bunch of false positives.
      "@darraghor/nestjs-typed/injectable-should-be-provided": "off",
      // Allow an error message.
      "vitest/valid-expect": ["error", { maxArgs: 2 }],
      // Always require the .js extension for local imports. This is required for
      // nodenext module resolution which we need to use on the backend, and we might as
      // well be consistent.
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "always",
          jsx: "always",
          ts: "always",
          tsx: "always",
        },
      ],
      // These have false positives in our repo.
      "import/no-unresolved": "off",
      "import/namespace": "off",
      "rxjs/no-ignored-error": "error",
    },
    settings: {
      vitest: {
        typecheck: true,
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
);
