import { graphql } from "@/gql";

/**
 * One product page, one query — `generateMetadata` and the page itself share
 * this document and its variables, so the data cache serves the second one.
 *
 * A missing slug has to come back as an empty list, not an error, which is why
 * this filters a connection instead of calling `product(idType: SLUG)`:
 * WooGraphQL answers that one with `errors: ["No product ID was found…"]`, and
 * `fetchGraphQL` turns any GraphQL error into a 500 where a 404 is owed.
 *
 * `variations` is where the buyer finds out what they actually pick in
 * WooCommerce: a t-shirt size for the Golden Ticket, an anthology for the
 * supporting accreditation.
 */
export const ProductQuery = graphql(`
  query ProductQuery($slugs: [String]) {
    products(first: 1, where: { slugIn: $slugs, status: "publish" }) {
      nodes {
        databaseId
        slug
        name
        link
        description
        image {
          sourceUrl
          thumbnail: sourceUrl(size: THUMBNAIL)
          altText
          mediaDetails {
            width
            height
          }
        }
        productCategories(first: 5) {
          nodes {
            slug
            name
          }
        }
        ... on ProductWithPricing {
          price
        }
        ... on InventoriedProduct {
          stockStatus
          # WooCommerce refuses a second unit of these outright, so the
          # quantity control has no business offering one.
          soldIndividually
        }
        ... on ProductWithVariations {
          attributes(first: 10) {
            nodes {
              name
              label
            }
          }
          variations(first: 50) {
            nodes {
              databaseId
              name
              price
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
