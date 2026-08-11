import { graphql } from "@/gql";

export const AllContentQuery = graphql(`
  query AllContentQuery {
    pages(first: 100, where: { status: PUBLISH }) {
      nodes {
        uri
        modifiedGmt
      }
    }
    posts(first: 200, where: { status: PUBLISH }) {
      nodes {
        uri
        modifiedGmt
      }
    }
  }
`);
