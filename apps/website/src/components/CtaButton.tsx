import { Button } from '@ghds/react/button';
import type { ReactNode } from 'react';

interface CtaButtonProps {
  href: string;
  variant?: 'primary' | 'neutral';
  children: ReactNode;
}

export default function CtaButton({
  href,
  variant = 'primary',
  children,
}: CtaButtonProps): React.JSX.Element {
  return (
    <Button asChild variant={variant}>
      <a href={href}>{children}</a>
    </Button>
  );
}
