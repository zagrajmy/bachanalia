import { graphql } from "@/gql";

/** Quantity 0 removes the line, which is what the stepper's lower bound means. */
export const UpdateItemQuantitiesMutation = graphql(`
  mutation UpdateItemQuantitiesMutation($input: UpdateItemQuantitiesInput!) {
    updateItemQuantities(input: $input) {
      cart {
        ...CartFields
      }
    }
  }
`);
