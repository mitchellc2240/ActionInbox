import { Icon } from "@/components/icon";
import { ProductPreview } from "@/components/product-preview";

const features = [
  { icon: "sparkles" as const, number: "01", title: "AI Email Analysis", text: "Get to the point without reading between the lines. AI summaries surface the key details, requests, and context in your emails.", note: "The important details, at a glance." },
  { icon: "tasks" as const, number: "02", title: "Automatic Task Extraction", text: "Turn buried requests into clear next steps. ActionInbox identifies actionable tasks and deadlines, bringing them together in one dashboard.", note: "Less remembering. More doing." },
  { icon: "reply" as const, number: "03", title: "Reply Drafts", text: "Get a reply draft you can review and adapt before sending.", note: "Your judgment. A helpful head start." },
];
const steps = [
  { title: "Bring an email", text: "Paste an email into ActionInbox. Paste only the messages you want to analyze." },
  { title: "Find the next steps", text: "ActionInbox summarizes the message and suggests tasks, deadlines, and a reply draft." },
  { title: "Make your move", text: "Review the suggestions, adjust what matters, and organize your next steps in one dashboard." },
];

export default function Home() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="container flex items-center justify-between gap-4"><a className="brand" href="#" aria-label="ActionInbox home"><span className="brand-icon"><Icon name="inbox"/></span>ActionInbox<span className="brand-period">.</span></a><nav className="flex items-center gap-7" aria-label="Main navigation"><a className="nav-link" href="#features">Features</a><a className="nav-link" href="#how-it-works">How it works</a><a className="nav-cta" href="/account">Get started <Icon name="arrow"/></a></nav></div></header>
    <main id="main">
      <div className="container flex justify-end py-3"><a className="text-link" href="/account">Account and subscriptions</a></div>
      <section className="hero container"><div className="launch-badge"><span className="status-dot"/> For client work that arrives by email</div><h1>Turn your inbox into<br className="desktop-break"/> an <span>action plan.</span></h1><p className="hero-description">Less email overwhelm. More forward momentum.<br className="desktop-break"/> Turn your client emails into<br className="wide-break"/> clear summaries, actionable tasks, and draft replies.</p><div className="hero-actions"><a className="button button-primary" href="/account">Create an account <Icon name="arrow"/></a><a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↗</span></a></div><p className="hero-note">Built for people with more to do than time to read.</p><ProductPreview/></section>
      <section className="audience-strip"><div className="container"><p>FOR THE PEOPLE WHO KEEP THINGS MOVING</p><div><span>Busy professionals</span><span aria-hidden="true" className="audience-dot">✳</span><span>Independent freelancers</span><span aria-hidden="true" className="audience-dot">✳</span><span>Small-business owners</span></div></div></section>
      <section id="features" className="section container"><div className="section-heading"><div><p className="eyebrow">LESS INBOX. MORE INTENTION.</p><h2>A busy inbox shouldn’t<br/>run your day.</h2></div><p>Important work gets buried in long threads.<br className="desktop-break"/> ActionInbox pulls tasks and deadlines into a checklist.</p></div><div className="feature-grid">{features.map(feature=><article className="feature-card" key={feature.number}><div className="feature-top"><span className="feature-icon"><Icon name={feature.icon}/></span><span>{feature.number}</span></div><h3>{feature.title}</h3><p>{feature.text}</p><div className="feature-note"><Icon name="check"/>{feature.note}</div></article>)}</div></section>
      <section id="how-it-works" className="workflow-section"><div className="container"><div className="workflow-intro"><p className="eyebrow">A SIMPLE WORKFLOW, BY DESIGN</p><h2>From “I’ll get to it”<br/>to “I know what’s next.”</h2><p>Here’s how ActionInbox works.<br/>One email in. A clearer path forward.</p></div><ol className="steps">{steps.map((step,i)=><li key={step.title}><span className="step-number">0{i+1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></div></section>
      <section id="coming-soon" className="container cta-section"><div className="cta-panel"><div className="launch-badge"><span className="status-dot"/> ACTIONINBOX</div><h2>Your next chapter.<br/>A little less inbox.</h2><p>Keep the work inside your client emails organized.</p><a className="button button-primary" href="/account">Get started <Icon name="arrow"/></a><p className="cta-note">Paste an email, review the plan, and track what is done.</p></div></section>
    </main>
    <footer className="site-footer container"><div><a className="brand" href="#"><span className="brand-icon"><Icon name="inbox"/></span>ActionInbox<span className="brand-period">.</span></a><p>Clarity for the work ahead.</p></div><div className="footer-credit"><p>Created by <strong>Mitchell Cesanek</strong></p><span>© {new Date().getFullYear()} ActionInbox · In development</span></div></footer>
  </>;
}
