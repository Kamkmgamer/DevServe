import React from 'react';
import { TOKENS } from '../../utils/tokens';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  center,
  className,
}) => (
  <div
    className={`mx-auto mb-12 max-w-2xl ${center ? "text-center" : ""} ${
      className || ""
    }`}
  >
    <h2
      className={`mb-3 text-4xl font-bold tracking-tight ${TOKENS.textHeading}`}
    >
      {title}
    </h2>
    {subtitle && <p className={`text-lg ${TOKENS.textBody}`}>{subtitle}</p>}
  </div>
);
