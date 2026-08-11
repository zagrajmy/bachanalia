import { redirect } from "next/navigation";

import { fetchShop, noclegiDestination } from "@/components/Shop/products";

/**
 * The beds are a WooCommerce product whose slug names the edition, so the nav
 * cannot point at one and stay right. It points here instead, and here reads
 * the catalogue.
 */
export const revalidate = 10_800;

export default async function NoclegiPage() {
  redirect(noclegiDestination(await fetchShop()));
}
