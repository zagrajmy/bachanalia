import gql from "graphql-tag";

export const AllContentQuery = gql`
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
`;
