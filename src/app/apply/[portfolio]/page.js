import { notFound } from "next/navigation";
import Nav from "@/components/Nav/Nav";
import { PORTFOLIOS } from "@/components/sections/Portfolios/portfolioData";
import ApplyForm from "../ApplyForm";
import { getApplication } from "../applicationData";

export function generateStaticParams() {
  return PORTFOLIOS.map(({ id }) => ({ portfolio: id }));
}

export async function generateMetadata({ params }) {
  const application = getApplication((await params).portfolio);
  return { title: application ? `Apply – ${application.label} – Western Developers Society` : "Application not found" };
}

export default async function PortfolioApplicationPage({ params }) {
  const application = getApplication((await params).portfolio);
  if (!application) notFound();
  return <main><Nav /><ApplyForm key={application.id} application={application} /></main>;
}
