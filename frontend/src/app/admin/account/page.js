"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { useAdmin } from "@/components/admin/AdminShell";
import { fmtCell } from "@/components/admin/Fields";

function Password() {
  const [f, setF] = useState({ current: "", next: "", again: "" });
  const [msg, setMsg] = useState(null);
  async function submit(e) {
    e.preventDefault();
    if (f.next !== f.again) return setMsg({ bad: true, t: "The new passwords don't match." });
    const r = await api("POST", "/api/admin/password", { current: f.current, next: f.next });
    setMsg(r.ok ? { t: "Password changed." } : { bad: true, t: r.message || "Couldn't change it" });
    if (r.ok) setF({ current: "", next: "", again: "" });
  }
  const inp = (k, label, ac) => (
    <label className="adm-f"><span>{label}</span><input className="adm-in" type="password" autoComplete={ac} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} required /></label>
  );
  return (
    <form className="adm-card adm-pad" onSubmit={submit}>
      <h2>Change my password</h2>
      <div className="adm-form">
        {inp("current", "Current password", "current-password")}
        {inp("next", "New password (10+ characters)", "new-password")}
        {inp("again", "New password again", "new-password")}
      </div>
      {msg && <div className={msg.bad ? "adm-err" : "adm-okmsg"} role="status">{msg.t}</div>}
      <button className="adm-btn adm-btn-primary" style={{ marginTop: 12 }}>Change password</button>
    </form>
  );
}

function Users() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ email: "", name: "", role: "editor", password: "", isActive: true });
  const [msg, setMsg] = useState(null);
  const load = () => api("GET", "/api/admin/users").then((r) => r.ok && setRows(r.payload || []));
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault();
    const r = await api("POST", "/api/admin/users", f);
    setMsg(r.ok ? { t: `Saved ${f.email}.` } : { bad: true, t: r.message || "Couldn't save" });
    if (r.ok) { setF({ email: "", name: "", role: "editor", password: "", isActive: true }); load(); }
  }
  return (
    <div className="adm-card adm-pad" style={{ marginTop: 20 }}>
      <h2>Admin users</h2>
      <p className="adm-mute">Editors manage content and orders. Admins can also delete records and manage users. To reset someone's password, save their email again with a new password.</p>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Last sign in</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.AdminId} onClick={() => setF({ email: u.Email, name: u.Name, role: u.Role, password: "", isActive: u.IsActive })}>
                <td data-label="Name">{u.Name}</td><td data-label="Email">{u.Email}</td><td data-label="Role">{u.Role}</td>
                <td data-label="Active">{fmtCell(u.IsActive, "IsActive")}</td><td data-label="Last sign in">{fmtCell(u.LastLoginAt, "LastLoginAt")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <h3>Add or update a user</h3>
        <div className="adm-form">
          <label className="adm-f"><span>Email</span><input className="adm-in" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></label>
          <label className="adm-f"><span>Name</span><input className="adm-in" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
          <label className="adm-f"><span>Role</span>
            <select className="adm-in" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="editor">editor</option><option value="admin">admin</option></select>
          </label>
          <label className="adm-f"><span>Password (empty keeps the current one)</span><input className="adm-in" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
          <label className="adm-check"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active</label>
        </div>
        {msg && <div className={msg.bad ? "adm-err" : "adm-okmsg"} role="status">{msg.t}</div>}
        <button className="adm-btn adm-btn-primary" style={{ marginTop: 12 }}>Save user</button>
      </form>
    </div>
  );
}

export default function Account() {
  const { me } = useAdmin();
  return (
    <>
      <div className="adm-head"><div><h1>{me.Role === "admin" ? "Admin users and password" : "My password"}</h1></div></div>
      <Password />
      {me.Role === "admin" && <Users />}
    </>
  );
}
