import base from "@hasparus/oxlint-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  ignorePatterns: [".next", "src/gql"],
  rules: {
    "perfectionist/sort-jsx-props": "off",
    "perfectionist/sort-objects": "off",
    "unicorn/no-useless-undefined": "off",
  },
  /**
   * The first two are upstream in @hasparus/oxlint-config now; drop them here
   * once a release carrying them is installed.
   */
  overrides: [
    {
      files: [
        "src/app/**/{page,layout,template,default,loading,error,global-error,not-found,robots,sitemap,manifest,icon,apple-icon,opengraph-image,twitter-image}.{ts,tsx}",
        "codegen.ts",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },
    {
      files: ["e2e/**"],
      rules: {
        "unicorn/prefer-dom-node-text-content": "off",
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
