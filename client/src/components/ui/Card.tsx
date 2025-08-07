import React from 'react';
import { TOKENS } from '../../utils/tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...p }) => (
  <div
    className={`${TOKENS.surfaceGlass} ${TOKENS.radius.lg} ${TOKENS.shadow}
      transition-transform duration-150 hover:-translate-y-0.5 focus-within:-translate-y-0.5 ${className}`}
    data-testid="card-container"
    {...p}>
    {children}
  </div>
);
