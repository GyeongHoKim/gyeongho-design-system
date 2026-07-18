import { Attachment } from '@ghds/react/attachment';

/** Live demo of Attachment chips: with icon, with meta, and removable (React). */
export default function AttachmentDemo(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sys-spacing-sm)' }}>
      <Attachment name="newsletter.eml" meta="12 KB" icon="mail" />
      <Attachment name="event.ics" meta="2 KB" icon="calendar" />
      <Attachment
        name="quarterly-report.pdf"
        meta="2.4 MB"
        onRemove={() => {
          /* remove from list */
        }}
      />
    </div>
  );
}
