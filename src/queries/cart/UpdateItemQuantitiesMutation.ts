import gql from "graphql-tag";

import { CartFields } from "./CartFields";

/** Quantity 0 removes the line, which is what the stepper's lower bound means. */
export const UpdateItemQuantitiesMutation = gql`
  mutation UpdateItemQuantitiesMutation($input: UpdateItemQuantitiesInput!) {
    updateItemQuantities(input: $input) {
      cart {
        ...CartFields
      }
    }
  }
  ${CartFields}
`;
