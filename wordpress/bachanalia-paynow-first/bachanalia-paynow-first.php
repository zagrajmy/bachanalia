<?php
/**
 * Plugin Name: Bachanalia — Paynow na górze
 * Description: Ustawia płatność Paynow jako pierwszą i domyślną w kasie.
 * Version:     1.1.0
 * Author:      Piotr Monwid-Olechnowicz
 * License:     GPL-2.0-or-later
 * Requires PHP: 7.4
 * WC requires at least: 8.0
 * WC tested up to: 10.9
 */

defined( 'ABSPATH' ) || exit;

const BACHANALIA_PAYNOW_FIRST_GATEWAY = 'pay_by_paynow_pl_paywall';

/**
 * Puts the Paynow paywall first, which also makes it the preselected method.
 *
 * The store checks out on WooCommerce Blocks, and Blocks takes its order from
 * `WC()->payment_gateways->payment_gateways()` — "the sort order of all
 * enabled gateways" — never from `woocommerce_available_payment_gateways`.
 * That list is built in `WC_Payment_Gateways::init()` straight out of the
 * `woocommerce_gateway_order` option, so the option is the only lever both
 * checkouts obey.
 *
 * Paynow's paywall gateway has no saved position: it only becomes available
 * once "Pokaż metody płatności" is unchecked, long after anyone last dragged
 * that screen, and `init()` parks anything unpositioned at 999. Bank transfer
 * holds a real position, so it wins — and an unpaid bank transfer sits in the
 * shop until somebody reconciles it by hand.
 */
function bachanalia_paynow_first( $order ) {
	if ( ! is_array( $order ) ) {
		return $order;
	}

	$others = array_filter( $order, 'is_numeric' );
	unset( $others[ BACHANALIA_PAYNOW_FIRST_GATEWAY ] );

	if ( empty( $others ) ) {
		return $order;
	}

	/**
	 * One below every other gateway, never equal to one. `init()` indexes by
	 * position — `$this->payment_gateways[ $ordering[ $id ] ] = $gateway` — so
	 * a repeated number drops whichever gateway is written first, and that
	 * gateway disappears from the store rather than merely sorting oddly.
	 */
	$order[ BACHANALIA_PAYNOW_FIRST_GATEWAY ] = min( array_map( 'intval', $others ) ) - 1;

	return $order;
}

add_filter( 'option_woocommerce_gateway_order', 'bachanalia_paynow_first' );

/** HPOS and the Blocks checkout, so the store stops calling this uncertain. */
add_action(
	'before_woocommerce_init',
	function () {
		if ( ! class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			return;
		}

		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true );
	}
);
