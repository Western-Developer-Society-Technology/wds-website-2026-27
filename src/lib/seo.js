export const SITE_URL = "https://www.westerndevsociety.ca";
export const SITE_NAME = "Western Developers Society";
export const DEFAULT_TITLE = `${SITE_NAME} (WDS) | Western University`;
export const DEFAULT_DESCRIPTION =
  "Western Developers Society (WDS) is Western University’s student-run tech club. Explore coding workshops, hackathons, projects, and ways to get involved.";

/**
 * Create page-specific metadata. Paths should be canonical routes, without query strings.
 * @returns {import("next").Metadata}
 */
export function createPageMetadata({ title, description = DEFAULT_DESCRIPTION, path }) {
  return {
    title: title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE,
    description,
    alternates: {
      canonical: new URL(path, SITE_URL).toString(),
    },
  };
}
