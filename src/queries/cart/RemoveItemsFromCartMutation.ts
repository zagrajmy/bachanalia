import { graphql } from "@/gql";

export const RemoveItemsFromCartMutation = graphql(`
  mutation RemoveItemsFromCartMutation($input: RemoveItemsFromCartInput!) {
    removeItemsFromCart(input: $input) {
      cart {
        ...CartFields
      }
    }
  }
`);
