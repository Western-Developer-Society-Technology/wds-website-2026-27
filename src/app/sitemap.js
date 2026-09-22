import { SITE_URL } from "@/lib/seo";

/** @returns {import("next").MetadataRoute.Sitemap} */
export default function sitemap() {
  // Add permanent content pages here as they are published.
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/events` },
    { url: `${SITE_URL}/portfolios` },
    { url: `${SITE_URL}/hackathon-team` },
  ];
}
