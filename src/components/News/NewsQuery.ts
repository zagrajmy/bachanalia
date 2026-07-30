import gql from "graphql-tag";

export const NewsQuery = gql`
  query NewsQuery($first: Int = 12) {
    posts(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        uri
        date
        excerpt
        categories(first: 1) {
          nodes {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;
