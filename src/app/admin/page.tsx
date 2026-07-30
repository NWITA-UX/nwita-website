import type { Metadata } from "next";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Atelier — Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminShell />;
}
