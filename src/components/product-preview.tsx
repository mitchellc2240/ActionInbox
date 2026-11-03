import { Icon } from "./icon";

export function ProductPreview() {
  return <figure className="preview" aria-label="Illustrative ActionInbox dashboard showing an example email transformed into tasks">
    <div className="preview-top"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>YOUR WORK, A LITTLE CLEARER</span><span className="preview-tag">Concept preview</span></div>
    <div className="preview-workspace">
      <aside className="preview-sidebar" aria-label="Illustrative dashboard navigation"><span className="mini-logo"><Icon name="inbox"/> <strong>ActionInbox</strong></span><span className="sidebar-active"><Icon name="tasks"/> My action plan <b>3</b></span><span><Icon name="inbox"/> Email library</span><div className="sidebar-note"><span className="status-dot"/> A little less busy.<br/>A lot more focused.</div></aside>
      <div className="preview-main"><div className="preview-heading"><div><p className="eyebrow">FROM EMAIL TO ACTION</p><h3>Your next move, sorted.</h3></div><span className="preview-date">Example workspace</span></div>
        <div className="email-example"><span className="avatar">JL</span><div><strong>Website launch — next steps</strong><p>Jordan Lee · Example email</p></div><Icon name="inbox"/><blockquote>“Could you send the updated proposal by Friday? We’ll also need to review the homepage and confirm a kickoff time.”</blockquote></div>
        <div className="transformation"><span/><Icon name="sparkles"/><span>Clarity from the conversation</span><span/></div>
        <div className="summary"><Icon name="sparkles"/><div><strong>The short version</strong><p>Three next steps for the website launch. The updated proposal comes first, with a Friday deadline.</p></div></div>
        <div className="task-heading"><span>YOUR ACTION PLAN</span><span>3 tasks identified</span></div>
        <div className="task-row"><span className="task-box"/><span>Send updated proposal<small>Due Friday</small></span><span className="priority high">High priority</span></div>
        <div className="task-row"><span className="task-box"/><span>Review homepage design</span><span className="priority">To do</span></div>
        <div className="task-row"><span className="task-box"/><span>Confirm a kickoff time</span><span className="priority">To do</span></div>
        <div className="reply-preview"><Icon name="reply"/><span>Suggested reply ready for your review</span><Icon name="arrow"/></div>
      </div>
    </div><figcaption>Illustrative preview of the planned experience. Product is in development.</figcaption>
  </figure>;
}
