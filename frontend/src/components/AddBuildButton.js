"use client";

import { useCart } from "@/components/CartProvider";

// Adds a whole pre-built PC to the cart as one line ("PB-<slug>"); the server prices it at checkout.
export default function AddBuildButton({ item }) {
  const cart = useCart();
  return <button className="btn btn-primary btn-xl" onClick={() => cart.add(item)}>Add to cart</button>;
}
