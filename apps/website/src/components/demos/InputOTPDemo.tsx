import { InputOTP } from '@ghds/react/input-otp';
import { useState } from 'react';

/** Live demo of InputOTP: a labeled 6-digit code plus its invalid state (React). */
export default function InputOTPDemo(): React.JSX.Element {
  const [code, setCode] = useState('');

  return (
    <div className="demo-stack">
      <InputOTP label="Verification code" value={code} onChange={setCode} />
      <InputOTP label="Invalid code" defaultValue="123456" invalid />
    </div>
  );
}
