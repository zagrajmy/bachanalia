import { describe, expect, it } from "bun:test";

import { BILLING_FIELDS, hasErrors, readBilling, validateBilling } from "./billing";
import type { BillingValues } from "./types";

const filled: BillingValues = {
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan@example.com",
  phone: "600 100 200",
  address1: "Wojska Polskiego 69",
  postcode: "65-762",
  city: "Zielona Góra",
};

describe("validateBilling", () => {
  it("passes an address WooCommerce would accept", () => {
    expect(validateBilling(filled)).toEqual({});
    expect(hasErrors(validateBilling(filled))).toBe(false);
  });

  it("names every empty field rather than one at a time", () => {
    const errors = validateBilling({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address1: "",
      postcode: "",
      city: "",
    });

    expect(Object.keys(errors).sort()).toEqual(BILLING_FIELDS.map((f) => f.name).sort());
  });

  it("catches the e-mail WooCommerce would reject after the whole form was filled", () => {
    expect(validateBilling({ ...filled, email: "jan@example" }).email).toBeTruthy();
  });

  it("wants a Polish postcode in the shape the shop stores", () => {
    expect(validateBilling({ ...filled, postcode: "65762" }).postcode).toBeTruthy();
    expect(validateBilling({ ...filled, postcode: "65-762" }).postcode).toBeUndefined();
  });

  it("reads a phone number through its spaces", () => {
    expect(validateBilling({ ...filled, phone: "+48 600 100 200" }).phone).toBeUndefined();
    expect(validateBilling({ ...filled, phone: "600" }).phone).toBeTruthy();
  });

  it("treats whitespace as empty", () => {
    expect(validateBilling({ ...filled, city: "   " }).city).toBeTruthy();
  });
});

describe("readBilling", () => {
  it("trims what the buyer typed, so a trailing space never reaches the order", () => {
    const values = readBilling((name) => (name === "firstName" ? "  Jan  " : "x"));

    expect(values.firstName).toBe("Jan");
  });

  it("reads a missing field as empty rather than undefined", () => {
    expect(readBilling(() => undefined).email).toBe("");
  });
});
