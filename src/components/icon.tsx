type IconName = "inbox" | "arrow" | "sparkles" | "tasks" | "reply" | "check";

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    inbox: <><path d="m4 4-2 10v6h20v-6L20 4Z"/><path d="M2 14h6l2 3h4l2-3h6"/></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
    sparkles: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><path d="m21 2 .5 1.5L23 4l-1.5.5L21 6l-.5-1.5L19 4l1.5-.5Z"/></>,
    tasks: <><path d="m3 6 2 2 4-4m-6 9 2 2 4-4m3-5h9m-9 7h9m-9 7h9M4 20h3"/></>,
    reply: <><path d="m9 5-7 7 7 7M2 12h11a8 8 0 0 1 8 8V9"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
