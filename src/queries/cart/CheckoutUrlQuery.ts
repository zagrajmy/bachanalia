import gql from "graphql-tag";

/**
 * WooGraphQL hands back a nonced `/transfer-session` URL that carries this
 * cart into WooCommerce's own checkout. The field only exists once *User
 * Session transferring URLs* and its *Checkout URL* box are enabled in
 * WPGraphQL for WooCommerce, so it is asked for on its own: a schema without
 * it fails validation, and that must not take the cart down with it.
 */
export const CheckoutUrlQuery = gql`
  query CheckoutUrlQuery {
    customer {
      checkoutUrl
    }
  }
`;
