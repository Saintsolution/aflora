import type { ReactNode } from 'react';

type SectionKickerProps = {
  children: ReactNode;
};

export function SectionKicker({ children }: SectionKickerProps) {
  return <p className="kicker">{children}</p>;
}