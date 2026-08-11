import { graphql } from "@/gql";

/**
 * `variationId` alone is enough for WooCommerce to price the line, but the
 * `variation` attribute pairs are what it stores against the item and prints
 * on the order, so both go. Local (per-product) attributes take their bare
 * name — "antologia", not "attribute_antologia" — and the option string
 * exactly as the variation reports it.
 */
export const AddToCartMutation = graphql(`
  mutation AddToCartMutation($input: AddToCartInput!) {
    addToCart(input: $input) {
      cart {
        ...CartFields
      }
    }
  }
`);
