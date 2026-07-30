import gql from "graphql-tag";

import { ContentNode, Post } from "@/gql/graphql";

/**
 * One query per content page: the title metadata needs, the type the router
 * switches on, and the body the templates render. WordPress rate-limits the
 * burst a prerender makes, so the pages are worth more than the bytes.
 */
export const ContentQuery = gql`
  query ContentQuery($slug: ID!, $idType: ContentNodeIdTypeEnum!, $preview: Boolean = false) {
    contentNode(id: $slug, idType: $idType, asPreview: $preview) {
      contentTypeName
      databaseId
      date
      ... on NodeWithTitle {
        title
      }
      ... on NodeWithContentEditor {
        content
      }
      ... on NodeWithFeaturedImage {
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

/**
 * `contentNode` is an interface, so the inline fragments are optional on the
 * result even though every type we render implements all three.
 */
export type ContentNodeResult = Partial<Pick<Post, "content" | "featuredImage" | "title">> &
  Pick<ContentNode, "contentTypeName" | "databaseId" | "date">;
