import { NativeSelect } from '@ghds/react/native-select';

/** Live demo of NativeSelect: a labeled control plus its error state (React). */
export default function NativeSelectDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ maxWidth: 260 }}>
      <NativeSelect label="Fruit" style={{ minWidth: 220 }}>
        <option value="">Select a fruit…</option>
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
        <option value="cherry">Cherry</option>
      </NativeSelect>

      <NativeSelect label="Fruit" error="Please choose a fruit." style={{ minWidth: 220 }}>
        <option value="">Select a fruit…</option>
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
        <option value="cherry">Cherry</option>
      </NativeSelect>
    </div>
  );
}
