import { Button, Card, Input } from '@ghds/react';
import { type ChangeEvent, useState } from 'react';

/**
 * Live demo of the `@ghds/react` component library, rendered as an Astro island
 * (`client:only="react"`). The sketch surfaces are painted in the browser, and
 * every visual comes from `@ghds/tokens` — the same tokens the Lit demo uses.
 */
export default function ReactDemo(): React.JSX.Element {
  const [email, setEmail] = useState('');

  return (
    <div className="demo-stack">
      <div>
        <p className="demo-label">Button</p>
        <div className="demo-row">
          <Button variant="primary">기본</Button>
          <Button variant="danger">위험</Button>
          <Button variant="neutral">중립</Button>
          <Button variant="primary" disabled>
            비활성
          </Button>
        </div>
      </div>

      <div>
        <p className="demo-label">Input</p>
        <div className="demo-stack">
          <Input
            label="이메일"
            placeholder="you@example.com"
            value={email}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          />
          <Input label="비밀번호" type="password" error="8자 이상 입력해 주세요." />
        </div>
      </div>

      <div>
        <p className="demo-label">Card</p>
        <Card>
          <h3>손으로 그린 카드</h3>
          <p>이 카드의 테두리와 채움은 sketch-core가 그리고, 색·간격·반경은 토큰에서 옵니다.</p>
        </Card>
      </div>
    </div>
  );
}
