import gql from "graphql-tag";

/**
 * The whole catalogue in one trip. WordPress rate-limits bursts, so 22
 * products cost far less as a single 10 kB response than as a request per
 * category, and `generateStaticParams` reads the same document.
 *
 * Prices and stock come off `ProductWithPricing` / `InventoriedProduct`, never
 * `SimpleProduct` — every accreditation but one is VARIABLE, and a
 * SimpleProduct fragment returns null for all of them.
 */
export const ProductsQuery = gql`
  query ProductsQuery {
    products(first: 100, where: { status: "publish", orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        slug
        name
        link
        image {
          sourceUrl
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
        }
      }
    }
  }
`;
