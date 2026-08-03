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
    /** Next and graphql-codegen read these by their default export. */
    {
      files: [
        "**/app/**/{page,layout,template,default,loading,error,global-error,not-found,robots,sitemap,manifest}.{ts,tsx}",
        "**/app/**/{icon,apple-icon,opengraph-image,twitter-image}{,[0-9]}.{ts,tsx}",
        "codegen.ts",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },
    /**
     * A Playwright locator is not a DOM node: `innerText()` reads what the
     * page renders, `textContent()` reads the source. The rule's fix swaps one
     * for the other and rewrites the assertion.
     */
    {
      files: ["e2e/**/*.spec.ts"],
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
