"use client";

import { useEffect, useRef, useState } from "react";
import ProductArt from "@/components/ProductArt";
import { brandAccent } from "@/lib/catalog";

// Product picture with fallbacks: the item's own image, then a real photo of its product type
// (when the item has no image or it fails to load), then the drawn illustration.
export default function ProductImage({ p, eager = false }) {
  const [src, setSrc] = useState(p.img || p.fallbackImg);
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  const fail = () => (src !== p.fallbackImg && p.fallbackImg ? setSrc(p.fallbackImg) : setFailed(true));

  // an image that failed before React hydrated never fires onError, so check once on mount
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!src || failed) return <ProductArt kind={p.kind} accent={brandAccent[p.brand] || "#E31E24"} />;
  return (
    <img
      ref={ref}
      className={src === p.fallbackImg ? "pimg fallback" : "pimg"}
      src={src}
      alt={p.name}
      loading={eager ? "eager" : "lazy"}
      onError={fail}
    />
  );
}
