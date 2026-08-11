import { graphql } from "@/gql";
import type { FeedQueryQuery } from "@/gql/graphql";

/** The Facebook feed the organisers mirror onto a WordPress page. */
export const FeedQuery = graphql(`
  query FeedQuery($uri: String!) {
    nodeByUri(uri: $uri) {
      ... on Page {
        content
      }
    }
  }
`);

/**
 * `nodeByUri` resolves to any content type WordPress serves, and only a Page
 * carries the mirrored feed. Anything else at that URI reads as no feed.
 */
export function feedContent(result: FeedQueryQuery) {
  const node = result.nodeByUri;

  return node && "content" in node ? (node.content ?? "") : "";
}
