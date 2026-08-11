import { graphql } from "@/gql";

/**
 * WooGraphQL hands back a nonced `/transfer-session` URL that carries this
 * cart into WooCommerce's own checkout. The field only exists once *User
 * Session transferring URLs* and its *Checkout URL* box are enabled in
 * WPGraphQL for WooCommerce, so it is asked for on its own: the cart must not
 * go down with a setting someone can switch off.
 */
export const CheckoutUrlQuery = graphql(`
  query CheckoutUrlQuery {
    customer {
      checkoutUrl
    }
  }
`);
