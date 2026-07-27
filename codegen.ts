import type { CodegenConfig } from "@graphql-codegen/cli";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const SCHEMA_FILE = "src/gql/schema.gql";

const refreshFromWordPress = process.env.WP_SCHEMA_REFRESH === "1";

const config: CodegenConfig = {
  overwrite: true,
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
    },
    ...(refreshFromWordPress && {
      [SCHEMA_FILE]: {
        plugins: ["schema-ast"],
      },
    }),
  },
};

export default config;
