import { redirect } from "next/navigation";

import { fetchShop, noclegiDestination } from "@/components/Shop/products";

export const revalidate = 10_800;

export default async function NoclegiPage() {
  redirect(noclegiDestination(await fetchShop()));
}
