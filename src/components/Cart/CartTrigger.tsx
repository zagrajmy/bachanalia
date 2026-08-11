"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CART_PATH } from "./paths";
import { loadCart, useCart } from "./store";

const CartSheet = dynamic(async () => import("./CartSheet").then((module) => module.CartSheet));

/**
 * The static layout only pays for the cart itself once there is a cart to show.
 * The product form can fill the same store and activate this without another
 * request; a returning buyer is discovered by the one lightweight API read.
 */
export function CartTrigger() {
  const { cart, open } = useCart();
  const pathname = usePathname();
  const [startedEmpty, setStartedEmpty] = useState<boolean>();
  const onCartPage = pathname === CART_PATH;

  useEffect(() => {
    if (!onCartPage) void loadCart();
  }, [onCartPage]);

  useEffect(() => {
    if (cart && startedEmpty === undefined) setStartedEmpty(cart.isEmpty);
  }, [cart, startedEmpty]);

  if (onCartPage || (!open && (cart?.isEmpty ?? true))) return null;

  return <CartSheet animateEntrance={startedEmpty === true} />;
}
