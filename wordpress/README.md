# WordPress side

## `bachanalia-revalidate`

Pings the Next.js site so an edit shows up immediately instead of waiting out
the hour-long ISR window. Without it the site still works — it just lags.

Install through **Wtyczki → Dodaj wtyczkę → Wyślij wtyczkę na serwer** with
`bachanalia-revalidate.zip`, activate, then fill in **Ustawienia →
Rewalidacja strony**:

| Field  | Value                                                          |
| ------ | -------------------------------------------------------------- |
| Adres  | the Vercel URL **until the domain is rewired**, the con's domain after |
| Sekret | the `HEADLESS_SECRET` value from the Vercel project             |

Then press **Wyślij testowy sygnał**. A green notice means WordPress reached
the frontend and the secret matched.

The plugin refuses to fire while the address points at WordPress's own
hostname, which is the state before cutover — otherwise every save would PUT
into the WordPress front page.

Rebuild the zip after editing:

```sh
cd wordpress && rm -f bachanalia-revalidate.zip && zip -qr bachanalia-revalidate.zip bachanalia-revalidate
```

## bachanalia-paynow-first

Makes Paynow the first and therefore preselected method in the checkout.
Nothing to configure; activate and it applies.

```sh
cd wordpress && zip -r bachanalia-paynow-first.zip bachanalia-paynow-first
```

Upload through **Wtyczki → Dodaj wtyczkę → Wyślij wtyczkę na serwer**.

## bachanalia-checkout-handover

Sends a buyer arriving from `/transfer-session` to the real order page instead
of a bare `/checkout/` that 404s. WooGraphQL ends the transfer with
`wc_get_endpoint_url( 'checkout' )`, which hangs the endpoint off
`get_permalink()` — and the transfer runs from `pre_get_posts`, where there is
no post to take a permalink from. Nothing to configure.

```sh
cd wordpress && rm -f bachanalia-checkout-handover.zip && zip -qr bachanalia-checkout-handover.zip bachanalia-checkout-handover
```

**The handover also needs the WooGraphQL settings saved twice.** Ticking
**Enable User Session transferring URLs** does not write the four
`*_nonce_param` options, because those inputs render disabled until a URL
field is enabled, and a disabled input is not submitted. Until they exist,
`Protected_Router::get_nonce_names()` returns only `download_url`, the plugin
never looks for `_wc_checkout`, and every transfer redirects to the homepage
with no error anyone can see. Open **GraphQL → Settings → WooCommerce** and
press **Save Changes** a second time.
