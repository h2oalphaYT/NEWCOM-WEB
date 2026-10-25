import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
