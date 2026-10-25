"use client";

import { useParams } from "next/navigation";
import ResourcePage from "@/components/admin/ResourcePage";

export default function AdminResource() {
  const { res } = useParams();
  return <ResourcePage key={res} res={res} />;
}
