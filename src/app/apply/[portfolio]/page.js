import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav/Nav";
import ApplyForm from "../ApplyForm";
import { getApplication } from "../applicationData";

export const dynamic = "force-dynamic";

const LEGACY_PORTFOLIO_REDIRECTS = {
  externals: "flagship",
};

function canonicalPortfolioId(id) {
  return LEGACY_PORTFOLIO_REDIRECTS[id] ?? id;
}

export async function generateMetadata({ params }) {
  const application = getApplication(canonicalPortfolioId((await params).portfolio));
  return {
    title: application
      ? `Apply – ${application.label} – Western Developers Society`
      : "Application not found",
  };
}

export default async function PortfolioApplicationPage({ params }) {
  const portfolioId = (await params).portfolio;
  const canonicalId = canonicalPortfolioId(portfolioId);
  if (canonicalId !== portfolioId) redirect(`/apply/${canonicalId}`);

  const application = getApplication(canonicalId);
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
