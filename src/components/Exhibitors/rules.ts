import { print } from "graphql/language/printer";

import { ContentNodeResult, ContentQuery } from "@/queries/general/ContentQuery";
import { fetchGraphQL } from "@/utils/fetchGraphQL";

/**
 * The organisers publish the rules as a PDF embedded in a WordPress page and
 * upload a new file every edition, so the link is read out of that page rather
 * than pinned here. `-2` is WordPress's own suffix: the 2023 page under the
 * unsuffixed slug is a "szczegóły wkrótce" stub nobody replaced.
 */
const EXHIBITOR_RULES_URI = "/index.php/regulamin-wystawcow-2/";

export async function fetchExhibitorRulesPdf(): Promise<string | null> {
  const { contentNode } = await fetchGraphQL<{
    contentNode: ContentNodeResult | null;
  }>(print(ContentQuery), { slug: EXHIBITOR_RULES_URI, idType: "URI" });

  return contentNode?.content?.match(/https?:\/\/[^"'\s]+\.pdf/i)?.[0] ?? null;
}
