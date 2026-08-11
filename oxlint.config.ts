import base, { overrides } from "@hasparus/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  ignorePatterns: [".next", "src/gql"],
  rules: {
    /**
     * `disallowTemplateShorthand` is right about `${x}` alone and its fix is
     * wrong about everything else: it replaces the whole literal with
     * `String(x)`, so `${x}\n` loses the newline. It cost us the space RFC 5545
     * wants on a folded ICS line. Pending the same change upstream.
     */
    "no-implicit-coercion": ["warn", { boolean: false, disallowTemplateShorthand: false }],
    /**
     * On a string, `||` is usually the point: an empty `NEXT_DIST_DIR`, a
     * label trimmed to nothing and a blank thumbnail all have to fall through
     * to the next branch, which `??` would skip.
     */
    "typescript/prefer-nullish-coalescing": ["warn", { ignorePrimitives: { string: true } }],
    "perfectionist/sort-jsx-props": "off",
    /**
     * Alphabetical order buries the discriminant, and the discriminant is what
     * the reader switches on, so it keeps the front of the type.
     */
    "perfectionist/sort-object-types": [
      "warn",
      {
        groups: ["discriminant", "unknown"],
        customGroups: [{ groupName: "discriminant", elementNamePattern: "^(ok|type|kind)$" }],
      },
    ],
    "perfectionist/sort-objects": "off",
    "unicorn/no-useless-undefined": "off",
  },
  overrides: [
    ...overrides,
    {
      /**
       * Build scripts and the mock server report to a terminal, so saying so is
       * the job rather than a leftover. Nothing under `src` prints.
       */
      files: ["scripts/**", "mocks/**"],
      rules: {
        "no-console": "off",
        "unicorn/no-process-exit": "off",
      },
    },
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
