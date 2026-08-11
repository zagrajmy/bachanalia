import { graphql } from "@/gql";

/**
 * The authoritative variation table for one product, used to turn the
 * attributes a form posted into the `variationId` WooCommerce insists on.
 * The browser sends that id when it can; this is the answer when it cannot,
 * and it is the answer WooCommerce itself would give.
 *
 * Filters a connection rather than calling `product(idType: SLUG)`, which
 * answers an unknown slug with a GraphQL error instead of an empty list.
 */
export const ProductVariationsQuery = graphql(`
  query ProductVariationsQuery($slugs: [String]) {
    products(first: 1, where: { slugIn: $slugs, status: "publish" }) {
      nodes {
        databaseId
        ... on ProductWithVariations {
          variations(first: 100) {
            nodes {
              databaseId
              stockStatus
              attributes(first: 5) {
                nodes {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`);
