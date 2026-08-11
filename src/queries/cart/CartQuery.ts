import { graphql } from "@/gql";

/**
 * Read-only, but it still travels over POST with the session header: the cart
 * belongs to one buyer and must never touch a shared cache or a URL.
 */
export const CartQuery = graphql(`
  query CartQuery {
    cart {
      ...CartFields
    }
  }
`);
