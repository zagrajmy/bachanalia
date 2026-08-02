import gql from "graphql-tag";

/**
 * The enabled gateways are WooCommerce's answer, not a list kept here — the
 * shop currently returns BLIK, Paynow's fast transfer and bank transfer, and
 * a payment method this side invented would be refused with "Invalid payment
 * method" after the buyer had filled the whole form.
 */
export const PaymentGatewaysQuery = gql`
  query PaymentGatewaysQuery {
    paymentGateways(where: { all: false }) {
      nodes {
        id
        title
        description
      }
    }
  }
`;
