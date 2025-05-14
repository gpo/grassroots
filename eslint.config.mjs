import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslint from "@eslint/js";
import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import pluginRouter from "@tanstack/eslint-plugin-router";

export default tseslint.config(
  {
    ignores: ["**/*.mjs", "**/*.cjs", "**/*.js"],
  },
  includeIgnoreFile(fileURLToPath(new URL(".gitignore", import.meta.url))),
  ...pluginRouter.configs["flat/recommended"],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
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
    },
  },
);
