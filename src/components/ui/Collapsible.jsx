// Height animation via grid rows (0fr → 1fr) so panels never clip long text (B-04).
// Closed panels are inert so their content is skipped by keyboard and screen readers.
export function Collapsible({ id, open, className = '', openClassName = '', children }) {
  return (
    <div
      id={id}
      className={`collapsible ${open ? `is-open ${openClassName}` : ''} ${className}`.replace(/\s+/g, ' ').trim()}
      inert={!open}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
