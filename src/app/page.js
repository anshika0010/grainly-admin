import { redirect } from "next/navigation";
export const metadata = {
  title : "ProMolecules Admin Page"
}
export default function AdminIndexPage() {
  redirect("/login");
}