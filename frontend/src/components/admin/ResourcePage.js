"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { labelOf, schemas } from "@/lib/adminSchema";
import { useAdmin } from "@/components/admin/AdminShell";
import { Field, ItemField, fmtCell, optList } from "@/components/admin/Fields";

const SIZE = 25;
const NO_DELETE = ["orders", "claims", "bookings"];
const slugify = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function blank(s) {
  const row = {};
  s.fields.forEach((f) => { if (f.default !== undefined) row[f.key] = f.default; });
  if (s.items) row.items = [];
  return row;
}

function Editor({ res, s, initial, onClose, onSaved }) {
  const { me } = useAdmin();
  const isNew = initial[s.pk] === undefined;
  const [row, setRow] = useState(initial);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setRow((r) => {
    const next = { ...r, [k]: v };
    s.fields.forEach((f) => { if (f.slugFrom === k && isNew && (!r[f.key] || r[f.key] === slugify(r[k]))) next[f.key] = slugify(v); });
    return next;
  });
  const items = row.items || [];
  const setItem = (i, k, v) => setRow((r) => ({ ...r, items: r.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));

  async function save(e) {
    e.preventDefault();
    const body = {};
    for (const f of s.fields) {
      if (f.readOnly || (f.createOnly && !isNew)) continue;
      let v = row[f.key];
      if (v === "" || v === undefined) v = f.type === "bool" ? false : null;
      if (f.required && (v === null || v === "")) { setErr(`${f.label || labelOf(f.key)} is required.`); return; }
      body[f.key] = v;
    }
    if (s.items && !s.items.readOnly) {
      for (const [i, it] of items.entries()) {
        const miss = s.items.columns.find((c) => c.required && (it[c.key] === undefined || it[c.key] === ""));
        if (miss) { setErr(`Row ${i + 1}: ${miss.label || labelOf(miss.key)} is required.`); return; }
      }
      body.items = items.map((it) => Object.fromEntries(s.items.columns.map((c) => [c.key, it[c.key] === "" ? null : it[c.key] ?? null])));
    }
    setBusy(true); setErr("");
    const r = isNew ? await api("POST", `/api/admin/r/${res}`, body) : await api("PUT", `/api/admin/r/${res}/${encodeURIComponent(initial[s.pk])}`, body);
    setBusy(false);
    if (r.ok) onSaved();
    else setErr(r.message || "Save failed");
  }

  async function remove() {
    if (!confirm(`Delete this ${s.singular}? This can't be undone.`)) return;
    setBusy(true);
    const r = await api("DELETE", `/api/admin/r/${res}/${encodeURIComponent(initial[s.pk])}`);
    setBusy(false);
    if (r.ok) onSaved();
    else setErr(r.message || (r.status === 403 ? "Only admins can delete." : "Delete failed"));
  }

  return (
    <div className="adm-drawer" role="dialog" aria-modal="true" aria-label={isNew ? `New ${s.singular}` : `Edit ${s.singular}`}>
      <div className="adm-drawer-bg" onClick={onClose} />
      <form className="adm-drawer-p" onSubmit={save}>
        <header>
          <h2>{isNew ? `New ${s.singular}` : `Edit ${s.singular}`}</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="adm-form">
          {s.fields.map((f) => <Field key={f.key} f={f} value={row[f.key]} isNew={isNew} onChange={(v) => set(f.key, v)} />)}
        </div>
        {s.items && (
          <div className="adm-items">
            <div className="adm-items-h">
              <h3>{s.items.label}</h3>
              {!s.items.readOnly && (
                <button type="button" className="adm-btn" onClick={() => setRow((r) => ({ ...r, items: [...(r.items || []), Object.fromEntries(s.items.columns.map((c) => [c.key, c.default ?? ""]))] }))}>+ Add row</button>
              )}
            </div>
            {items.length === 0 && <p className="adm-mute">No rows yet.</p>}
            {items.map((it, i) => (
              <div key={i} className="adm-irow">
                {s.items.columns.map((c) => (
                  <label key={c.key} className={`adm-f c-${c.type || "text"}`}>
                    <span>{c.label || labelOf(c.key)}</span>
                    {s.items.readOnly ? <div className="adm-ro">{fmtCell(it[c.key], c.key)}</div>
                      : c.type === "item" ? <ItemField value={it[c.key]} onChange={(v) => setItem(i, c.key, v)} onPick={(p) => { if (c.fills && !it[c.fills]) setItem(i, c.fills, p.vcItemDescrition); }} />
                      : c.type === "select" ? (
                        <select className="adm-in" value={it[c.key] ?? ""} onChange={(e) => setItem(i, c.key, e.target.value)}>
                          {optList(c.options).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input className="adm-in" type={c.type === "number" || c.type === "money" ? "number" : "text"} step="any" value={it[c.key] ?? ""}
                          onChange={(e) => setItem(i, c.key, c.type === "number" || c.type === "money" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />
                      )}
                  </label>
                ))}
                {!s.items.readOnly && (
                  <div className="adm-irow-a">
                    <button type="button" disabled={i === 0} onClick={() => setRow((r) => { const a = [...r.items]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...r, items: a }; })} aria-label="Move up">↑</button>
                    <button type="button" onClick={() => setRow((r) => ({ ...r, items: r.items.filter((_, j) => j !== i) }))} aria-label="Remove row">✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {err && <div className="adm-err" role="alert">{err}</div>}
        <footer>
          {!isNew && !NO_DELETE.includes(res) && me.Role === "admin" && <button type="button" className="adm-btn adm-btn-danger" onClick={remove} disabled={busy}>Delete</button>}
          <span style={{ flex: 1 }} />
          <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
          <button className="adm-btn adm-btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        </footer>
      </form>
    </div>
  );
}

export default function ResourcePage({ res }) {
  const s = schemas[res];
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page, size: SIZE });
    if (q.trim()) p.set("q", q.trim());
    if (status) p.set("status", status);
    const r = await api("GET", `/api/admin/r/${res}?${p}`);
    setLoading(false);
    if (r.ok) { setRows(r.payload || []); setTotal(r.total || 0); setErr(""); }
    else setErr(r.message || "Couldn't load");
  }, [res, page, q, status]);

  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => { setPage(1); }, [q, status]);

  if (!s) return <p>Unknown section.</p>;

  async function open(row) {
    const r = await api("GET", `/api/admin/r/${res}/${encodeURIComponent(row[s.pk])}`);
    if (r.ok) setEdit(r.payload);
    else setErr(r.message || "Couldn't open");
  }

  const pages = Math.max(1, Math.ceil(total / SIZE));
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>{s.title}</h1>
          {s.help && <p className="adm-mute">{s.help}</p>}
        </div>
        {!s.readOnlyCreate && <button className="adm-btn adm-btn-primary" onClick={() => setEdit(blank(s))}>+ New {s.singular}</button>}
      </div>
      <div className="adm-tools">
        <input className="adm-in" type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        {s.statuses && (
          <select className="adm-in" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            {s.statuses.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        )}
        <span className="adm-mute">{total} {total === 1 ? "record" : "records"}</span>
      </div>
      {err && <div className="adm-err" role="alert">{err}</div>}
      <div className="adm-card adm-table-wrap">
        <table className="adm-table">
          <thead><tr>{s.list.map((k) => <th key={k}>{labelOf(k)}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[s.pk]} onClick={() => open(r)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open(r)}>
                {s.list.map((k) => <td key={k} data-label={labelOf(k)}>{fmtCell(r[k], k)}</td>)}
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={s.list.length} className="adm-empty">Nothing here yet.</td></tr>}
          </tbody>
        </table>
        {loading && <div className="adm-mute" style={{ padding: 16 }}>Loading…</div>}
      </div>
      {pages > 1 && (
        <div className="adm-pager">
          <button className="adm-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="adm-btn" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
      {edit && <Editor key={edit[s.pk] ?? "new"} res={res} s={s} initial={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </>
  );
}
