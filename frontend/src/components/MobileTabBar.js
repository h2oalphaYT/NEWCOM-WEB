"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

// Bottom tab bar shown on phones only, so the main destinations stay one thumb-tap away.
const tabs = [
  { href: "/", label: "Home", d: "M3 11 12 3l9 8v10h-6v-6H9v6H3z" },
  { href: "/products", label: "Shop", d: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { href: "/pc-builder", label: "Build PC", d: "M7 3h10v18H7zM10 7h4M12 17h.01" },
  { href: "/services", label: "Support", d: "M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.2A8 8 0 1 1 21 12z" },
  { href: "/cart", label: "Cart", d: "M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6", cart: true },
];

export default function MobileTabBar() {
  const path = usePathname();
  const { count } = useCart();
  const active = (h) => (h === "/" ? path === "/" : path.startsWith(h));

  return (
    <nav className="tabbar no-print" aria-label="Quick navigation">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={active(t.href) ? "on" : ""} aria-current={active(t.href) ? "page" : undefined}>
          <span className="tb-ico">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={t.d} /></svg>
            {t.cart && count > 0 && <span className="tb-badge">{count}</span>}
          </span>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
