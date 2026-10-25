"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_API, mediaUrl, upload } from "@/lib/apiClient";
import { labelOf } from "@/lib/adminSchema";
import { lkr } from "@/lib/site";

export const optList = (opts) => opts.map((o) => (typeof o === "object" ? o : { value: o, label: o || "—" }));

export function fmtCell(v, key) {
  if (v === null || v === undefined || v === "") return <span className="adm-mute">—</span>;
  if (typeof v === "boolean") return <span className={`adm-pill ${v ? "ok" : ""}`}>{v ? "Yes" : "No"}</span>;
  if (/(Date|At)$/.test(key) && typeof v === "string") {
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (/(Total|Price|Fee|Value)$/.test(key) && typeof v === "number") return key === "DiscountValue" ? v : lkr(v);
  if (key === "Status") return <span className={`adm-pill st-${v}`}>{v}</span>;
  if (/Url$/.test(key)) return <span className="adm-mute" title={v}>{String(v).split("/").pop()}</span>;
  return String(v);
}

function MediaField({ value, onChange, accept }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const url = mediaUrl(value);
  const isVideo = /\.(mp4|webm)(\?|$)/i.test(value || "");
  async function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true); setErr("");
    const r = await upload(f);
    setBusy(false);
    if (r.ok) onChange(r.payload.url);
    else setErr(r.message || "Upload failed");
  }
  return (
    <div className="adm-media">
      {url && (isVideo ? <video src={url} muted playsInline controls className="adm-media-prev" /> : <img src={url} alt="" className="adm-media-prev" />)}
      <div className="adm-media-row">
        <input className="adm-in" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Upload, or paste an image or video URL" />
        <label className="adm-btn">{busy ? "Uploading…" : "Upload"}<input type="file" hidden accept={accept || "image/*,video/mp4,video/webm"} onChange={pick} disabled={busy} /></label>
      </div>
      {err && <div className="adm-err">{err}</div>}
    </div>
  );
}

// Inventory item picker: searches the live catalogue by name or code.
export function ItemField({ value, onChange, onPick, disabled }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [open, setOpen] = useState(false);
  const t = useRef();
  useEffect(() => {
    if (!open || q.trim().length < 2) { setRes([]); return; }
    clearTimeout(t.current);
    t.current = setTimeout(async () => {
      const term = q.trim();
      try {
        // the catalogue search matches descriptions, so an item code is looked up directly as well
        const [byName, byCode] = await Promise.all([
          fetch(`${PUBLIC_API}/api/items?q=${encodeURIComponent(term)}&row_count=8`).then((x) => x.json()).catch(() => ({})),
          /^[a-z]{2,5}\d{2,}$/i.test(term) ? fetch(`${PUBLIC_API}/api/items/${encodeURIComponent(term.toUpperCase())}`).then((x) => x.json()).catch(() => ({})) : {},
        ]);
        setRes([...(byCode.payload ? [byCode.payload] : []), ...(byName.payload || [])]);
      } catch { setRes([]); }
    }, 250);
  }, [q, open]);
  return (
    <div className="adm-item">
      <input className="adm-in" value={open ? q : value || ""} disabled={disabled} placeholder="Search item name or code"
        onFocus={() => { setOpen(true); setQ(value || ""); }}
        onBlur={() => setTimeout(() => { setOpen(false); if (q !== (value || "")) onChange(q.trim()); }, 180)}
        onChange={(e) => setQ(e.target.value)} />
      {open && res.length > 0 && (
        <ul className="adm-item-list">
          {res.map((it) => (
            <li key={it.cItemCode}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(it.cItemCode); onPick?.(it); setQ(it.cItemCode); setOpen(false); }}>
                <strong>{it.cItemCode}</strong>
                <span>{it.vcItemDescrition}</span>
                <em>{lkr(it.SpecialPrice > 0 && it.SpecialPrice < it.SellingPrice ? it.SpecialPrice : it.SellingPrice)} · {it.StockStatus}</em>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Field({ f, value, onChange, isNew }) {
  const ro = f.readOnly || (f.createOnly && !isNew);
  const label = f.label || labelOf(f.key);
  let input;
  if (ro) {
    input = <div className="adm-ro">{fmtCell(value, f.key)}</div>;
  } else if (f.type === "textarea") {
    input = <textarea className="adm-in" rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />;
  } else if (f.type === "bool") {
    return (
      <label className="adm-check"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
    );
  } else if (f.type === "select") {
    const opts = optList(f.options);
    input = (
      <select className="adm-in" value={value ?? ""} onChange={(e) => {
        const o = opts.find((x) => String(x.value) === e.target.value);
        onChange(o ? o.value : e.target.value);
      }}>
        {!f.required && !opts.some((o) => o.value === "") && <option value="">—</option>}
        {opts.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else if (f.type === "media") {
    input = <MediaField value={value} onChange={onChange} />;
  } else if (f.type === "item") {
    input = <ItemField value={value} onChange={onChange} />;
  } else if (f.type === "date") {
    input = <input className="adm-in" type="date" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value)} />;
  } else if (f.type === "number" || f.type === "money") {
    input = <input className="adm-in" type="number" step={f.type === "money" ? "any" : "1"} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
  } else {
    input = <input className="adm-in" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />;
  }
  return (
    <label className={`adm-f${f.type === "textarea" || f.type === "media" ? " wide" : ""}`}>
      <span>{label}{f.required && !ro && <b> *</b>}</span>
      {input}
    </label>
  );
}
