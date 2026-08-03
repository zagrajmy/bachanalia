<?php
/**
 * Plugin Name: Bachanalia — przekazanie do kasy
 * Description: Po przeniesieniu sesji ze sklepu headless kieruje kupującego na właściwą stronę zamówienia zamiast na nieistniejące /checkout/.
 * Version:     1.1.0
 * Author:      Piotr Monwid-Olechnowicz
 * License:     GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

/**
 * WooGraphQL ends a session transfer with `wc_get_endpoint_url( 'checkout' )`.
 * That helper appends the endpoint to `get_permalink()`, and the transfer runs
 * from `pre_get_posts` where there is no post to take a permalink from — so it
 * returns a bare `/checkout/`, which 404s on a site whose checkout page lives
 * at `/index.php/zamowienie/`.
 *
 * `wc_get_checkout_url()` asks WooCommerce for the page it was actually
 * configured with, which is right whatever the permalink structure is.
 *
 * Scoped to the case that is broken: an endpoint resolved with no permalink to
 * hang it off. Everywhere else WooCommerce is passed a real page and its own
 * answer stands.
 *
 * Every parameter has a default. WooCommerce core passes four, but a filter is
 * a public square — anything may `apply_filters( 'woocommerce_get_endpoint_url',
 * $url )` with fewer, and a required parameter turns that into an
 * ArgumentCountError. A fatal in a GraphQL response prints `<br /><b>Fatal
 * error</b>` ahead of the JSON and takes the whole static build down with it.
 *
 * `wc_get_checkout_url()` ends in `apply_filters( 'woocommerce_get_checkout_url' )`,
 * and a plugin on that hook is free to ask for an endpoint URL in turn, so the
 * guard is what keeps the two from calling each other forever.
 *
 * @param string $url       The URL WooCommerce built.
 * @param string $endpoint  The endpoint being resolved.
 * @param string $value     Endpoint value, unused here.
 * @param string $permalink The page the endpoint was hung off, if any.
 *
 * @return string
 */
function bachanalia_checkout_handover_url( $url, $endpoint = '', $value = '', $permalink = '' ) {
	static $inside = false;

	if ( $inside || 'checkout' !== $endpoint || ! empty( $permalink ) ) {
		return $url;
	}

	$inside   = true;
	$checkout = wc_get_checkout_url();
	$inside   = false;

	return $checkout ? $checkout : $url;
}
add_filter( 'woocommerce_get_endpoint_url', 'bachanalia_checkout_handover_url', 10, 4 );
