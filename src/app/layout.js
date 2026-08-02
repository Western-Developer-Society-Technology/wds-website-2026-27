import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Western Developers Society",
  description: "Building Western's tech community, line by line.",
};

export const viewport = {
  themeColor: "#1a1a1a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
