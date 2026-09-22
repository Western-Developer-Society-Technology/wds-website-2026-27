import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import TransitionProvider from "@/components/Transition/TransitionProvider";
import NotificationBar from "@/components/NotificationBar/NotificationBar";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "@/lib/seo";

const SHOW_NOTIFICATION_BAR = true;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-notification-bar={SHOW_NOTIFICATION_BAR ? "top" : undefined}
    >
      <body>
        {SHOW_NOTIFICATION_BAR && <NotificationBar />}
        <TransitionProvider>{children}</TransitionProvider>
        <Analytics />
      </body>
    </html>
  );
}
