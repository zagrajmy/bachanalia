import type { CodegenConfig } from "@graphql-codegen/cli";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const SCHEMA_FILE = "src/gql/schema.gql";

const refreshFromWordPress = process.env.WP_SCHEMA_REFRESH === "1";

const config: CodegenConfig = {
  overwrite: true,
  documents: ["src/**/*.{ts,tsx}", "!src/gql/**", "scripts/**/*.ts"],
  schema: refreshFromWordPress
    ? {
        [`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/graphql`]: {
          headers: {
            "User-Agent": "Codegen",
          },
        },
      }
    : SCHEMA_FILE,
  generates: {
    "src/gql/": {
      preset: "client",
      presetConfig: { fragmentMasking: false },
      /**
       * The WordPress client sends a query as text, so codegen emits it as
       * text: no AST, no printer, no graphql runtime in the bundle.
       */
      config: {
        documentMode: "string",
        /** Enum arguments are written as the string literals the API takes. */
        enumsAsTypes: true,
      },
    },
    ...(refreshFromWordPress && {
      [SCHEMA_FILE]: {
        plugins: ["schema-ast"],
      },
    }),
  },
};

export default config;
