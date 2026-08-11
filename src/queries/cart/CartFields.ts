import { graphql } from "@/gql";

/**
 * Every mutation answers with the whole cart, so one selection covers add,
 * update, remove and the plain read. Totals are WooCommerce's own formatted
 * strings — the shop decides what it charges, this side only prints it.
 *
 * `variation` sits on the `CartItem` interface, not on a concrete type, so a
 * SIMPLE and a VARIABLE line come back through the same selection. Its
 * `attributes` are what the buyer actually picked; the cart line has to show
 * them or someone gets the wrong shirt.
 */
export const CartFields = graphql(`
  fragment CartFields on Cart {
    isEmpty
    subtotal
    total
    shippingTotal
    discountTotal
    needsShippingAddress
    chosenShippingMethods
    availableShippingMethods {
      rates {
        id
        label
        cost
      }
    }
    contents(first: 100) {
      itemCount
      nodes {
        key
        quantity
        subtotal
        total
        product {
          node {
            databaseId
            name
            slug
            image {
              sourceUrl(size: THUMBNAIL)
              altText
            }
            ... on ProductWithAttributes {
              attributes(first: 10) {
                nodes {
                  name
                  label
                }
              }
            }
            # Or the stepper offers a second unit WooCommerce will refuse.
            ... on InventoriedProduct {
              soldIndividually
            }
          }
        }
        variation {
          node {
            databaseId
            name
          }
          attributes {
            name
            label
            value
          }
        }
      }
    }
  }
`);
