import gql from "graphql-tag";

/**
 * WooGraphQL runs the classic `process_payment()` path, so whatever a gateway
 * hands back — a Paynow URL, or WooCommerce's own order-received page for
 * bank transfer — arrives in `redirect`. `order` is the fallback: with an
 * order number and key we can send the buyer to WooCommerce's pay page even
 * if a gateway returns success and no redirect at all.
 *
 * Verified against order 3502 (`bacs`, 1 zł, 1 August 2026): `result` came
 * back "success" and `redirect` carried the order-received URL.
 */
export const CheckoutMutation = gql`
  mutation CheckoutMutation($input: CheckoutInput!) {
    checkout(input: $input) {
      result
      redirect
      order {
        databaseId
        orderNumber
        orderKey
        status
        total
        paymentMethodTitle
        needsPayment
      }
    }
  }
`;
