import React from 'react';
import Container from './Container';
import { SectionHeading } from '../ui/SectionHeading';

interface SectionWrapperProps {
  title?: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
  children: React.ReactNode;
  containerClassName?: string; // New prop for container specific classes
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  subtitle,
  center,
  className = "py-20", // Default padding
  children,
  containerClassName = "" // Default empty
}) => {
  return (
    <section className={className}>
      <Container className={containerClassName}>
        {title && (
          <SectionHeading
            title={title}
            subtitle={subtitle}
            center={center}
          />
        )}
        {children}
      </Container>
    </section>
  );
};

export default SectionWrapper;
