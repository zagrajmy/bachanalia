<?php
/**
 * Plugin Name: Bachanalia — rewalidacja strony
 * Description: Po zapisaniu wpisu lub strony odświeża stronę Next.js, żeby zmiana była widoczna od razu.
 * Version:     1.0.0
 * Author:      Piotr Monwid-Olechnowicz
 * License:     GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

const BACHANALIA_REVALIDATE_URL_OPTION    = 'bachanalia_frontend_url';
const BACHANALIA_REVALIDATE_SECRET_OPTION = 'bachanalia_headless_secret';

/**
 * Next runs with trailingSlash: true. Without the slash it answers 308, and
 * wp_remote_request does not follow redirects for PUT — the ping vanishes.
 */
const BACHANALIA_REVALIDATE_PATH = '/api/revalidate/';

function bachanalia_frontend_url() {
	return untrailingslashit( trim( (string) get_option( BACHANALIA_REVALIDATE_URL_OPTION, '' ) ) );
}

/**
 * Until the domain is rewired, the frontend lives on its Vercel URL and this
 * site still answers on the con's domain. Pointing the setting at ourselves
 * would make WordPress PUT into its own front page on every save, so refuse.
 */
function bachanalia_targets_self( $url ) {
	$target = wp_parse_url( $url, PHP_URL_HOST );
	$home   = wp_parse_url( home_url(), PHP_URL_HOST );

	return $target && $home && strtolower( $target ) === strtolower( $home );
}

/**
 * $blocking is false for the save hooks — an editor should never wait on
 * Vercel to finish — and true for the test button, which has to report back.
 */
function bachanalia_revalidate( $blocking = false ) {
	$url    = bachanalia_frontend_url();
	$secret = (string) get_option( BACHANALIA_REVALIDATE_SECRET_OPTION, '' );

	if ( '' === $url || '' === $secret || bachanalia_targets_self( $url ) ) {
		return new WP_Error( 'bachanalia_not_configured', 'Adres strony lub sekret nie są ustawione.' );
	}

	return wp_remote_request(
		$url . BACHANALIA_REVALIDATE_PATH,
		array(
			'method'   => 'PUT',
			'timeout'  => 15,
			'blocking' => (bool) $blocking,
			'headers'  => array(
				'Content-Type'          => 'application/json',
				'X-Headless-Secret-Key' => $secret,
			),
			'body'     => wp_json_encode( array( 'tags' => array( 'wordpress' ) ) ),
		)
	);
}

/** Hooks pass their own arguments (menu id, attachment id); swallow them. */
function bachanalia_revalidate_hook() {
	$result = bachanalia_revalidate();

	if ( is_wp_error( $result ) ) {
		error_log( 'bachanalia revalidate: ' . $result->get_error_message() );
	}
}

/** Fires on publish, edit, unpublish and trash alike. */
function bachanalia_on_transition( $new_status, $old_status, $post ) {
	if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
		return;
	}

	if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
		return;
	}

	if ( ! in_array( $post->post_type, array( 'post', 'page', 'product' ), true ) ) {
		return;
	}

	bachanalia_revalidate_hook();
}
add_action( 'transition_post_status', 'bachanalia_on_transition', 10, 3 );
add_action( 'wp_update_nav_menu', 'bachanalia_revalidate_hook' );
add_action( 'delete_attachment', 'bachanalia_revalidate_hook' );

/* -------------------------------------------------------------- settings -- */

add_action(
	'admin_menu',
	function () {
		add_options_page(
			'Rewalidacja strony',
			'Rewalidacja strony',
			'manage_options',
			'bachanalia-revalidate',
			'bachanalia_settings_page'
		);
	}
);

add_action(
	'admin_init',
	function () {
		register_setting( 'bachanalia_revalidate', BACHANALIA_REVALIDATE_URL_OPTION, array( 'sanitize_callback' => 'esc_url_raw' ) );
		register_setting( 'bachanalia_revalidate', BACHANALIA_REVALIDATE_SECRET_OPTION, array( 'sanitize_callback' => 'sanitize_text_field' ) );
	}
);

function bachanalia_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$notice = '';

	if ( isset( $_POST['bachanalia_test'] ) && check_admin_referer( 'bachanalia_test' ) ) {
		$result = bachanalia_revalidate( true );

		if ( is_wp_error( $result ) ) {
			$notice = array( 'error', $result->get_error_message() );
		} else {
			$code   = wp_remote_retrieve_response_code( $result );
			$notice = 200 === $code
				? array( 'success', 'Połączenie działa — strona została odświeżona.' )
				: array( 'error', sprintf( 'Strona odpowiedziała kodem %s: %s', $code, wp_remote_retrieve_body( $result ) ) );
		}
	}

	$url = bachanalia_frontend_url();
	?>
	<div class="wrap">
		<h1>Rewalidacja strony</h1>

		<?php if ( $notice ) : ?>
			<div class="notice notice-<?php echo esc_attr( $notice[0] ); ?>"><p><?php echo esc_html( $notice[1] ); ?></p></div>
		<?php endif; ?>

		<?php if ( $url && bachanalia_targets_self( $url ) ) : ?>
			<div class="notice notice-warning"><p>
				Adres wskazuje na tę samą domenę co WordPress, więc rewalidacja jest wyłączona.
				Do czasu przepięcia domeny wpisz tu adres <code>*.vercel.app</code>, a po przepięciu — docelowy adres konwentu.
			</p></div>
		<?php endif; ?>

		<form method="post" action="options.php">
			<?php settings_fields( 'bachanalia_revalidate' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="<?php echo esc_attr( BACHANALIA_REVALIDATE_URL_OPTION ); ?>">Adres strony Next.js</label></th>
					<td>
						<input type="url" class="regular-text" id="<?php echo esc_attr( BACHANALIA_REVALIDATE_URL_OPTION ); ?>"
							name="<?php echo esc_attr( BACHANALIA_REVALIDATE_URL_OPTION ); ?>"
							value="<?php echo esc_attr( get_option( BACHANALIA_REVALIDATE_URL_OPTION, '' ) ); ?>"
							placeholder="https://bachanalia.vercel.app">
						<p class="description">Bez ukośnika na końcu. Po przepięciu domeny zmień na docelowy adres.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="<?php echo esc_attr( BACHANALIA_REVALIDATE_SECRET_OPTION ); ?>">Sekret</label></th>
					<td>
						<input type="password" class="regular-text" id="<?php echo esc_attr( BACHANALIA_REVALIDATE_SECRET_OPTION ); ?>"
							name="<?php echo esc_attr( BACHANALIA_REVALIDATE_SECRET_OPTION ); ?>"
							value="<?php echo esc_attr( get_option( BACHANALIA_REVALIDATE_SECRET_OPTION, '' ) ); ?>"
							autocomplete="off">
						<p class="description">Musi być identyczny ze zmienną <code>HEADLESS_SECRET</code> w projekcie na Vercelu.</p>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Zapisz' ); ?>
		</form>

		<hr>

		<form method="post">
			<?php wp_nonce_field( 'bachanalia_test' ); ?>
			<p>Sprawdź, czy WordPress dogaduje się ze stroną.</p>
			<?php submit_button( 'Wyślij testowy sygnał', 'secondary', 'bachanalia_test' ); ?>
		</form>
	</div>
	<?php
}
