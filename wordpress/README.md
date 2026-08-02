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
