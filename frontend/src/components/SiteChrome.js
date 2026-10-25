"use client";

import { usePathname } from "next/navigation";

// The admin panel has its own shell, so the shop header, footer and mobile tab bar are left out there.
export default function SiteChrome({ header, footer, extras, children }) {
  const admin = usePathname()?.startsWith("/admin");
  if (admin) return children;
  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
      {extras}
    </>
  );
}
