import { Accordion } from '@ghds/react/accordion';

/** Live Accordion demo, single-open (React). */
export default function AccordionDemo(): React.JSX.Element {
  return (
    <Accordion
      type="single"
      defaultValue={['shipping']}
      items={[
        { value: 'shipping', label: 'Shipping', content: <p>Ships in 2–3 business days.</p> },
        { value: 'returns', label: 'Returns', content: <p>Free returns within 30 days.</p> },
        { value: 'warranty', label: 'Warranty', content: <p>Covered for one year.</p> },
      ]}
    />
  );
}
