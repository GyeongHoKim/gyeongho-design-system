import { Slider } from '@ghds/react';
import { useState } from 'react';

/** Live demo of Slider's real state matrix: default, controlled, custom range, disabled. */
export default function SliderDemo(): React.JSX.Element {
  const [volume, setVolume] = useState(30);

  return (
    <div className="demo-stack">
      <Slider
        label="Volume"
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
      />
      <Slider label="Rating" min={0} max={10} step={1} defaultValue={7} />
      <Slider label="Disabled" defaultValue={40} disabled />
    </div>
  );
}
