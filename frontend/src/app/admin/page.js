"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { useAdmin } from "@/components/admin/AdminShell";
import { fmtCell } from "@/components/admin/Fields";
import { lkr } from "@/lib/site";

const tiles = [
  ["orders_new", "New orders", "/admin/r/orders"],
  ["claims_open", "Open warranty claims", "/admin/r/claims"],
  ["bookings_new", "New service bookings", "/admin/r/bookings"],
  ["customers", "Customers", "/admin/r/customers"],
  ["banners_active", "Active banners", "/admin/r/banners"],
  ["promos_active", "Active promotions", "/admin/r/promotions"],
  ["prebuilt_active", "Pre-built PCs on sale", "/admin/r/prebuilt"],
  ["subscribers", "Newsletter subscribers", "/admin/r/newsletter"],
];

export default function Dashboard() {
  const { me } = useAdmin();
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState(0);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api("GET", "/api/admin/stats").then((r) => { if (r.ok) { setStats(r.payload); setSales(r.sales_30d || 0); } });
    api("GET", "/api/admin/r/orders?size=6").then((r) => r.ok && setOrders(r.payload || []));
  }, []);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Hello, {me.Name.split(" ")[0]}</h1>
          <p className="adm-mute">Here is what is happening on newcom.lk.</p>
        </div>
        <div className="adm-quick">
          <Link className="adm-btn" href="/admin/r/banners">Add a banner</Link>
          <Link className="adm-btn" href="/admin/r/promotions">New promotion</Link>
          <Link className="adm-btn adm-btn-primary" href="/admin/r/prebuilt">Add a pre-built PC</Link>
        </div>
      </div>
      <div className="adm-tiles">
        <div className="adm-card adm-tile big">
          <span>Sales, last 30 days</span>
          <strong>{lkr(sales)}</strong>
          <em>{stats ? `${stats.orders_total} orders in total` : "…"}</em>
        </div>
        {tiles.map(([k, label, href]) => (
          <Link key={k} href={href} className="adm-card adm-tile">
            <span>{label}</span>
            <strong>{stats ? stats[k] : "…"}</strong>
          </Link>
        ))}
      </div>
      <div className="adm-card" style={{ marginTop: 20 }}>
        <div className="adm-card-h"><h2>Latest orders</h2><Link href="/admin/r/orders">All orders →</Link></div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.OrderId}>
                  <td data-label="Order">{o.OrderNo}</td><td data-label="Customer">{o.Name}</td><td data-label="Total">{fmtCell(o.Total, "Total")}</td>
                  <td data-label="Payment">{o.PaymentMethod}</td><td data-label="Status">{fmtCell(o.Status, "Status")}</td><td data-label="Date">{fmtCell(o.CreatedAt, "CreatedAt")}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={6} className="adm-empty">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
