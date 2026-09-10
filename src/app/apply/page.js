import { redirect } from "next/navigation";

export const metadata = {
  title: "Apply – Western Developers Society",
};

export default function ApplyPage() {
  redirect("/portfolios");
}
