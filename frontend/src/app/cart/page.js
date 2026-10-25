"use client";

import { useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/components/CartProvider";
import { productHref, resolve } from "@/lib/catalog";
import { lkr } from "@/lib/site";

const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];
const methods = [
  { k: "card", t: "Credit or debit card", s: "Paid securely on the bank's payment page. Card details never touch this site. [Needs gateway account]" },
  { k: "koko", t: "KOKO: 3 interest-free instalments", s: "Pay a third today and the rest over two months. [Needs KOKO merchant account]" },
  { k: "mintpay", t: "Mintpay: split into 3", s: "Interest-free split payments. [Needs Mintpay merchant account]" },
  { k: "bank", t: "Direct bank transfer", s: "Bank details are shown after you place the order. [Confirm account details]" },
  { k: "store", t: "Reserve and pay in store", s: "We hold the items for you at our Colombo showroom." },
];
const empty = { name: "", email: "", phone: "", address: "", city: "", province: "", district: "" };

function errorsFor(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Enter your full name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!/^(\+94|0)?7\d{8}$/.test(f.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a Sri Lankan mobile number, e.g. 077 123 4567.";
  if (!f.address.trim()) e.address = "Enter your street address.";
  if (!f.city.trim()) e.city = "Enter your town or city.";
  if (!f.province) e.province = "Choose a province.";
  if (!f.district.trim()) e.district = "Enter your district.";
  return e;
}

// Cart and checkout from the redesign mockup. Checkout is a demo: nothing is sent or charged.
export default function CartPage() {
  const cart = useCart();
  const [step, setStep] = useState("cart");
  const [msg, setMsg] = useState("");
  const [f, setF] = useState(empty);
  const [touched, setTouched] = useState(false);
  const [pay, setPay] = useState("");
  const [payErr, setPayErr] = useState("");

  const lines = cart.lines.map((l) => ({ ...l, p: resolve(l) })).filter((l) => l.p);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const sub = lines.reduce((a, l) => a + l.qty * l.p.price, 0);
  const errs = errorsFor(f);
  const stepIdx = { cart: 0, details: 1, pay: 2, done: 3 }[step];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const fields = [
    ["name", "Full name", "name"], ["email", "Email", "email"], ["phone", "Mobile number", "tel"],
    ["address", "Street address", "street-address", true], ["city", "Town or city", "address-level2"],
    ["province", "Province"], ["district", "District", "off"],
  ];

  return (
    <div className="wrap">
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>{step === "cart" ? "Shopping cart" : step === "done" ? "Order placed" : "Checkout"}</h1>
      <ol className="csteps">
        {["Cart", "Details", "Payment"].map((t, i) => (
          <li key={t} style={{ color: i <= stepIdx ? "var(--ink)" : "var(--mute)" }}>
            <span style={{ background: i < stepIdx ? "#15803D" : i === stepIdx ? "#E31E24" : "var(--line)", color: i <= stepIdx ? "#fff" : "var(--mute)" }}>{i + 1}</span>{t}
          </li>
        ))}
      </ol>

      <div className="builder">
        <div style={{ flex: "1 1 560px", minWidth: 0 }}>
          {step === "cart" && (
            <div className="step">
              {lines.length === 0 && (
                <div className="empty" style={{ padding: "64px 24px" }}>
                  <strong style={{ fontSize: 20 }}>Your cart is empty</strong>
                  <p>Add hardware from the catalogue to get started.</p>
                  <Link className="btn btn-primary" href="/products">Continue shopping</Link>
                </div>
              )}
              {lines.map(({ id, qty, p }) => (
                <div key={id} className="cline">
                  <div className="cline-art"><ProductImage p={p} /></div>
                  <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                    <Link href={productHref(id)} style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>{p.name}</Link>
                    <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>SKU {id} · {lkr(p.price)} each</div>
                    <button className="cline-rm" onClick={() => { cart.remove(id); setMsg(""); }}>Remove</button>
                  </div>
                  <div role="group" aria-label={`Quantity for ${p.name}`} className="qty">
                    <button onClick={() => { if (qty > 1) { cart.setQty(id, qty - 1); setMsg(""); } }} aria-label="Decrease">−</button>
                    <span aria-live="polite">{qty}</span>
                    <button onClick={() => (qty >= p.max ? setMsg(`Only ${p.max} of this item can be ordered right now.`) : cart.setQty(id, qty + 1))} aria-label="Increase">+</button>
                  </div>
                  <div style={{ width: 130, textAlign: "right", fontWeight: 800, fontSize: 16 }}>{lkr(p.price * qty)}</div>
                </div>
              ))}
              {msg && <div role="status" style={{ marginTop: 12, fontSize: 13, color: "#B45309" }}>{msg}</div>}
              <Link href="/products" style={{ display: "inline-flex", alignItems: "center", minHeight: 48, marginTop: 12, fontWeight: 600, color: "var(--link)" }}>← Continue shopping</Link>
            </div>
          )}

          {step === "details" && (
            <form className="step" noValidate onSubmit={(e) => { e.preventDefault(); if (Object.keys(errs).length) setTouched(true); else { setTouched(false); setStep("pay"); } }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Contact and delivery</h2>
              <p className="sub" style={{ fontSize: 14, marginTop: 6 }}>Guest checkout. No account needed.</p>
              <div className="cform">
                {fields.map(([k, label, ac, wide]) => {
                  const bad = touched && errs[k];
                  return (
                    <label key={k} className="fl" style={{ gridColumn: wide ? "1 / -1" : "auto" }}>{label}
                      {k === "province" ? (
                        <select className="in" value={f[k]} onChange={set(k)} aria-invalid={!!bad}>
                          <option value="">Select…</option>
                          {provinces.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input className="in" type="text" value={f[k]} onChange={set(k)} autoComplete={ac} aria-invalid={!!bad} style={{ borderColor: bad ? "#B91C1C" : undefined }} />
                      )}
                      <span className="err" role="alert">{bad || ""}</span>
                    </label>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>Delivery method</div>
              <label className="pay" style={{ marginTop: 8 }}><input type="radio" name="dm" defaultChecked /><span><strong>Standard delivery</strong><span>Fee calculated once delivery rates are connected. Shown as LKR 0 in this prototype.</span></span></label>
              <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="btn" onClick={() => setStep("cart")}>Back to cart</button>
                <button type="submit" className="btn btn-primary">Continue to payment</button>
              </div>
            </form>
          )}

          {step === "pay" && (
            <div className="step">
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Payment method</h2>
              <p className="sub" style={{ fontSize: 14, marginTop: 6 }}>Only methods Newcom supports will appear here. These are examples; no payment is taken in this prototype.</p>
              <div role="radiogroup" aria-label="Payment method" style={{ marginTop: 20, display: "grid", gap: 10 }}>
                {methods.map((m) => (
                  <label key={m.k} className="pay" style={{ borderColor: pay === m.k ? "#E31E24" : undefined, background: pay === m.k ? "var(--tint)" : undefined }}>
                    <input type="radio" name="pm" checked={pay === m.k} onChange={() => { setPay(m.k); setPayErr(""); }} />
                    <span><strong>{m.t}</strong><span>{m.s}</span></span>
                  </label>
                ))}
              </div>
              {payErr && <div role="alert" className="err" style={{ marginTop: 10 }}>{payErr}</div>}
              <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="btn" onClick={() => setStep("details")}>Back</button>
                <button className="btn btn-primary" onClick={() => { if (!pay) setPayErr("Choose a payment method to continue."); else { setStep("done"); cart.clear(); } }}>Place demo order</button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="step done">
              <div className="done-tick"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg></div>
              <h2 style={{ marginTop: 20, fontSize: 26, fontWeight: 800 }}>Demo order recorded</h2>
              <p>Thank you, {f.name.split(" ")[0] || "customer"}. Nothing was charged or sent. A live store would email a confirmation to {f.email || "your email"} and show the real order number and tracking here.</p>
              <Link className="btn btn-dark" href="/" style={{ marginTop: 20 }}>Back to home</Link>
            </div>
          )}
        </div>

        <aside className="summary card" style={{ padding: 24, background: "var(--surface)" }} aria-label="Order summary">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Order summary</h2>
          <div className="sumrows">
            <div><span>Subtotal ({count} items)</span><span key={sub} className="tot-sm">{lkr(sub)}</span></div>
            <div><span>Discount</span><span>LKR 0</span></div>
            <div><span>Delivery</span><span>Calculated at next step</span></div>
            <div className="sumtotal"><span>Total</span><span key={`t${sub}`} className="tot">{lkr(sub)}</span></div>
          </div>
          {step === "cart" && (
            <button className="btn btn-primary" style={{ marginTop: 20, width: "100%", height: 52, background: lines.length ? undefined : "#94A3B8", cursor: lines.length ? "pointer" : "not-allowed" }} disabled={!lines.length} onClick={() => setStep("details")}>Proceed to checkout</button>
          )}
          <p style={{ margin: "14px 0 0", fontSize: 12, lineHeight: 1.6, color: "var(--mute)" }}>Sample prices. Delivery and taxes are shown only when calculated by the store.</p>
        </aside>
      </div>
    </div>
  );
}
