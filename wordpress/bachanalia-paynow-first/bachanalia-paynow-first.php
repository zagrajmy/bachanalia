<?php
/**
 * Plugin Name: Bachanalia — Paynow na górze
 * Description: Ustawia płatność Paynow jako pierwszą i domyślną w kasie.
 * Version:     1.0.0
 * Author:      Piotr Monwid-Olechnowicz
 * License:     GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

const BACHANALIA_PAYNOW_GATEWAY = 'pay_by_paynow_pl_paywall';

/**
 * WooCommerce sorts gateways by the positions saved on the settings screen and
 * preselects the first available one. The paywall gateway only appears once
 * "Pokaż metody płatności" is unchecked, so it was never dragged into that
 * saved order and sorts behind bank transfer — which left the slowest way to
 * pay for a ticket selected by default, and the order unpaid until somebody
 * reconciled a transfer by hand.
 *
 * Reordering here rather than in the database keeps the decision in the repo,
 * and it survives a plugin update rewriting its own gateway list.
 */
add_filter(
	'woocommerce_available_payment_gateways',
	function ( $gateways ) {
		if ( ! isset( $gateways[ BACHANALIA_PAYNOW_GATEWAY ] ) ) {
			return $gateways;
		}

		$paynow = $gateways[ BACHANALIA_PAYNOW_GATEWAY ];
		unset( $gateways[ BACHANALIA_PAYNOW_GATEWAY ] );

		return array( BACHANALIA_PAYNOW_GATEWAY => $paynow ) + $gateways;
	},
	100
);
