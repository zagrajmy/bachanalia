import base, { overrides } from "@hasparus/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  ignorePatterns: [".next", "src/gql"],
  rules: {
    "perfectionist/sort-jsx-props": "off",
    "perfectionist/sort-objects": "off",
    "unicorn/no-useless-undefined": "off",
  },
  overrides: [
    ...overrides,
    {
      /** graphql-codegen resolves its config by the default export. */
      files: ["codegen.ts"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
  settings: {
    "better-tailwindcss": {
      detectComponentClasses: true,
      entryPoint: "src/app/globals.css",
    },
  },
});
