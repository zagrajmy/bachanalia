import gql from "graphql-tag";

import { CartFields } from "./CartFields";

export const RemoveItemsFromCartMutation = gql`
  mutation RemoveItemsFromCartMutation($input: RemoveItemsFromCartInput!) {
    removeItemsFromCart(input: $input) {
      cart {
        ...CartFields
      }
    }
  }
  ${CartFields}
`;
