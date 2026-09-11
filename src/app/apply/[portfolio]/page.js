import { notFound } from "next/navigation";
import Nav from "@/components/Nav/Nav";
import ApplyForm from "../ApplyForm";
import { getApplication } from "../applicationData";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const application = getApplication((await params).portfolio);
  return {
    title: application
      ? `Apply – ${application.label} – Western Developers Society`
      : "Application not found",
  };
}

export default async function PortfolioApplicationPage({ params }) {
  const application = getApplication((await params).portfolio);
  if (!application) notFound();
  const accepting = process.env.APPLICATIONS_OPEN === "true";
  return (
    <main>
      <Nav />
      <ApplyForm
        key={application.id}
        application={application}
        accepting={accepting}
        siteKey={process.env.CLOUDFLARE_SITE_KEY}
      />
    </main>
  );
}
