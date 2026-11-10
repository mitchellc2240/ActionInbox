import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActionInbox — Turn your inbox into an action plan",
  description: "Meet ActionInbox, an AI-powered email and task management platform for professionals, freelancers, and small-business owners. Turn emails into summaries, tasks, deadlines, and draft replies.",
  applicationName: "ActionInbox",
  openGraph: {
    title: "ActionInbox — Turn your inbox into an action plan",
    description: "Less inbox overwhelm. More clarity on what comes next. An AI-powered workspace for your emails and tasks.",
    type: "website",
  },
  twitter: { card: "summary", title: "ActionInbox", description: "Turn your inbox into an action plan." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
