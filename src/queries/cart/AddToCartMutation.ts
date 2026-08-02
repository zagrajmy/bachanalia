import gql from "graphql-tag";

import { CartFields } from "./CartFields";

/**
 * `variationId` alone is enough for WooCommerce to price the line, but the
 * `variation` attribute pairs are what it stores against the item and prints
 * on the order, so both go. Local (per-product) attributes take their bare
 * name — "antologia", not "attribute_antologia" — and the option string
 * exactly as the variation reports it.
 */
export const AddToCartMutation = gql`
  mutation AddToCartMutation($input: AddToCartInput!) {
    addToCart(input: $input) {
      cart {
        ...CartFields
      }
    }
  }
  ${CartFields}
`;
