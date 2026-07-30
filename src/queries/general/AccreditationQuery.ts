import gql from "graphql-tag";

/**
 * `ProductWithPricing` covers both shapes: the day passes are SIMPLE, the
 * three-day and Golden Ticket are VARIABLE, and a fragment on SimpleProduct
 * alone would silently return null prices for half the taryfikator.
 */
export const AccreditationQuery = gql`
  query AccreditationQuery($slugs: [String]) {
    products(first: 20, where: { slugIn: $slugs }) {
      nodes {
        slug
        link
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
