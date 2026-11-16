import Link from "next/link";
import { Icon } from "@/components/icon";
import styles from "./workspace.module.css";

export function WorkspaceHeader({ email, current }: { email: string; current: "workspace" | "calendar" }) {
  return (
    <header className="site-header">
      <div className={`container ${styles.header}`}>
        <Link href="/workspace" className="brand" aria-label="ActionInbox workspace">
          <span className="brand-icon"><Icon name="inbox" /></span>ActionInbox
        </Link>
        <Link href="/account" className={styles.account} aria-label="Your account">
          <span>{email}</span><strong>Account</strong>
        </Link>
        <nav className={styles.tabs} aria-label="Workspace navigation">
          <Link href="/workspace" aria-current={current === "workspace" ? "page" : undefined}>Workspace</Link>
          <Link href="/workspace/calendar" aria-current={current === "calendar" ? "page" : undefined}>Calendar</Link>
        </nav>
      </div>
    </header>
  );
}
