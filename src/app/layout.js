import "./globals.css";
import TransitionProvider from "@/components/Transition/TransitionProvider";
import NotificationBar from "@/components/NotificationBar/NotificationBar";

const SHOW_NOTIFICATION_BAR = false;

export const metadata = {
  title: "Western Developers Society",
  description: "Western Developers Society",
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
      </body>
    </html>
  );
}
