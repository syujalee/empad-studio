import { Reveal } from './Reveal.jsx';

// Eyebrow tag + serif title; the italic gold half of the title is passed as `accent`.
// Rendered as siblings (no wrapper) because the section layout styles its direct children.
export function SectionHeading({ id, tag, title, accent, center = false, lineBreak = false }) {
  const align = center ? 'text-center' : '';
  return (
    <>
      <Reveal as="p" className={`section-tag ${align}`.trim()}>{tag}</Reveal>
      <Reveal as="h2" id={id} className={`section-title ${align}`.trim()}>
        {title}
        {lineBreak ? <br /> : ' '}
        <em>{accent}</em>
      </Reveal>
    </>
  );
}
