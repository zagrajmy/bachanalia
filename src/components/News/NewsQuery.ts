import gql from "graphql-tag";

export const NewsQuery = gql`
  query NewsQuery($first: Int = 12) {
    posts(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        uri
        dateGmt
        excerpt
        categories(first: 3) {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            thumbnail: sourceUrl(size: THUMBNAIL)
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
