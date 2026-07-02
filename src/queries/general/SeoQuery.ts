import gql from "graphql-tag";

export const SeoQuery = gql`
  query SeoQuery($slug: ID!, $idType: ContentNodeIdTypeEnum, $preview: Boolean = false) {
    contentNode(id: $slug, idType: $idType, asPreview: $preview) {
      ... on NodeWithTitle {
        title
      }
    }
  }
`;
