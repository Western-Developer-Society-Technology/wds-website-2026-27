/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Only local placeholder art uses SVG today; safe with a strict CSP.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
