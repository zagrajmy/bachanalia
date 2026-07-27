import gql from "graphql-tag";

export const PostQuery = gql`
  query PostQuery($id: ID!, $preview: Boolean = false) {
    post(id: $id, idType: DATABASE_ID, asPreview: $preview) {
      content
      date
      title
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
      author {
        node {
          name
        }
      }
    }
  }
`;
