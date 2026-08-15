import "./globals.css";

export const metadata = {
  title: "Western Developers Society",
  description: "Western Developers Society",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
