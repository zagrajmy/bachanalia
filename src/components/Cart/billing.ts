import type { BillingFieldName, BillingValues, FieldErrors } from "./types";

/**
 * The fields WooCommerce refuses a Polish order without. The shop sells to
 * Poland only, so the country is fixed rather than offered — a country picker
 * with one entry is a question with one answer.
 */
export const BILLING_COUNTRY = "PL";

export type BillingField = {
  name: BillingFieldName;
  label: string;
  type: "text" | "email" | "tel";
  autoComplete: string;
  /** Two fields share a row on wide screens; the rest run full width. */
  half?: boolean;
  inputMode?: "text" | "email" | "tel" | "numeric";
};

export const BILLING_FIELDS: BillingField[] = [
  { name: "firstName", label: "Imię", type: "text", autoComplete: "given-name", half: true },
  { name: "lastName", label: "Nazwisko", type: "text", autoComplete: "family-name", half: true },
  { name: "email", label: "Adres e-mail", type: "email", autoComplete: "email", half: true },
  { name: "phone", label: "Telefon", type: "tel", autoComplete: "tel", half: true },
  { name: "address1", label: "Ulica i numer", type: "text", autoComplete: "address-line1" },
  {
    name: "postcode",
    label: "Kod pocztowy",
    type: "text",
    autoComplete: "postal-code",
    half: true,
    inputMode: "numeric",
  },
  { name: "city", label: "Miejscowość", type: "text", autoComplete: "address-level2", half: true },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTCODE = /^\d{2}-\d{3}$/;

const digits = (value: string) => value.replace(/\D/g, "");

export function validateBilling(values: BillingValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.firstName.trim()) errors.firstName = "Podaj imię.";
  if (!values.lastName.trim()) errors.lastName = "Podaj nazwisko.";

  if (!values.email.trim()) errors.email = "Podaj adres e-mail.";
  else if (!EMAIL.test(values.email.trim())) errors.email = "Ten adres e-mail nie wygląda na pełny.";

  if (!values.phone.trim()) errors.phone = "Podaj numer telefonu.";
  else if (digits(values.phone).length < 9) errors.phone = "Numer telefonu ma dziewięć cyfr.";

  if (!values.address1.trim()) errors.address1 = "Podaj ulicę i numer.";

  if (!values.postcode.trim()) errors.postcode = "Podaj kod pocztowy.";
  else if (!POSTCODE.test(values.postcode.trim())) errors.postcode = "Kod pocztowy w formacie 00-000.";

  if (!values.city.trim()) errors.city = "Podaj miejscowość.";

  return errors;
}

export function readBilling(get: (name: string) => string | undefined): BillingValues {
  const value = (name: BillingFieldName) => (get(name) ?? "").trim();

  return {
    firstName: value("firstName"),
    lastName: value("lastName"),
    email: value("email"),
    phone: value("phone"),
    address1: value("address1"),
    postcode: value("postcode"),
    city: value("city"),
  };
}

export const hasErrors = (errors: FieldErrors) => Object.keys(errors).length > 0;
