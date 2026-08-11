import { graphql } from "@/gql";
import type { ContentQueryQuery } from "@/gql/graphql";

/**
 * One query per content page: the title metadata needs, the type the router
 * switches on, and the body the templates render. WordPress rate-limits the
 * burst a prerender makes, so the pages are worth more than the bytes.
 */
export const ContentQuery = graphql(`
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
`);

type ContentNodeUnion = NonNullable<ContentQueryQuery["contentNode"]>;

/**
 * `contentNode` is an interface, so codegen splits the result into one member
 * per concrete type and only some of them carry the inline fragments. Every
 * member is assignable to this.
 */
export type ContentNodeResult = Partial<
  Omit<Extract<ContentNodeUnion, { __typename?: "Page" }>, "__typename">
> &
  Pick<ContentNodeUnion, "contentTypeName" | "databaseId" | "date">;
