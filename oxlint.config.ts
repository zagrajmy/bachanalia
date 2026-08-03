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
  overrides: [
    {
      /** Next resolves these by their default export, and codegen its config. */
      files: [
        "src/app/**/{page,layout,template,default,loading,error,global-error,not-found,robots,sitemap,manifest,icon,apple-icon,opengraph-image,twitter-image}.{ts,tsx}",
        "codegen.ts",
      ],
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
