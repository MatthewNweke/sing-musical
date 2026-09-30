import type { HTMLAttributes, PropsWithChildren } from 'react';

export function Card({ className = '', children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={`rounded-card border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
