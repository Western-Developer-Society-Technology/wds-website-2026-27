/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@neslinesli93/qpdf-wasm"],
  outputFileTracingIncludes: {
    "/api/applications": [
      "./src/lib/applications/pdf-worker.cjs",
      "./node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.js",
      "./node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm",
    ],
  },
  images: {
    // Only local placeholder art uses SVG today; safe with a strict CSP.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
