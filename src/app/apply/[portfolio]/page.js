import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav/Nav";
import { createPageMetadata } from "@/lib/seo";
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
  const canonicalId = canonicalPortfolioId((await params).portfolio);
  const application = getApplication(canonicalId);
  if (!application) return { title: "Application not found" };

  return createPageMetadata({
    title: `Apply: ${application.label}`,
    description:
      `Application for the ${application.label} portfolio at Western Developers Society (WDS). Share your experience and interests in Western University’s tech community.`,
    path: `/apply/${canonicalId}`,
  });
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
