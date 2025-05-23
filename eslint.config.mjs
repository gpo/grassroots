import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslint from "@eslint/js";
import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import pluginRouter from "@tanstack/eslint-plugin-router";
import checkFile from "eslint-plugin-check-file";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
  includeIgnoreFile(fileURLToPath(new URL(".gitignore", import.meta.url))),
  ...pluginRouter.configs["flat/recommended"],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  {
    ignores: ["**/*.mjs", "**/*.cjs", "**/*.js", "**/*.gen.ts"],
  },
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.node,
        ...globals.jest,
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
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "react/jsx-no-useless-fragment": "error",
      "check-file/no-index": "error",
      "check-file/filename-naming-convention": [
        "error",
        {
          "grassroots-backend/src/**/*.{jsx,tsx,js,ts}": "PASCAL_CASE",
          "grassroots-frontend/src/!(hooks|routes)/**/*.{jsx,tsx,js,ts}":
            "PASCAL_CASE",
          "grassroots-frontend/src/hooks/**/*.{jsx,tsx,js,ts}": "CAMEL_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
  },
);
