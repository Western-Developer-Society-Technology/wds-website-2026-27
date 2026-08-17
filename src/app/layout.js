import "./globals.css";
import TransitionProvider from "@/components/Transition/TransitionProvider";

export const metadata = {
  title: "Western Developers Society",
  description: "Western Developers Society",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
