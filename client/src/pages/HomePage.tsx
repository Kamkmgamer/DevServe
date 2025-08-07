import React, { Suspense, lazy } from 'react';
import { Hero } from '../components/home/Hero';
import { TechMarquee } from '../components/home/TechMarquee';
import { CTA } from '../components/home/CTA';
import Container from '../components/layout/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Process } from '../components/home/Process';
import { PricingTeaser } from '../components/home/PricingTeaser';
import { FAQ } from '../components/home/FAQ';
import { SectionSkeleton } from '../components/ui/SectionSkeleton';

const CaseStudies = lazy(() => import('../components/home/CaseStudies').then(module => ({ default: module.CaseStudies })));
const Testimonials = lazy(() => import('../components/home/Testimonials').then(module => ({ default: module.Testimonials })));

const HomePage: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 rounded bg-blue-600 px-3 py-2 text-white"
      >
        Skip to content
      </a>

      <Hero />

      <div id="main" />

      <section className="py-10">
        <Container>
          <TechMarquee />
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            title="Recent Work"
            subtitle="A snapshot of projects that improved performance and outcomes."
            center
          />
          <Suspense fallback={<SectionSkeleton rows={3} />}>
            <CaseStudies />
          </Suspense>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            title="How We’ll Work"
            subtitle="A simple, transparent process focused on outcomes."
            center
          />
          <Process />
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            title="Flexible Ways to Partner"
            subtitle="Pick a track that fits your scope and timeline."
            center
          />
          <PricingTeaser />
        </Container>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="mb-4 text-4xl font-bold">Client Feedback</h2>
            <p className="opacity-90">
              Trusted by teams to deliver quality and speed.
            </p>
          </div>
          <Suspense fallback={<SectionSkeleton rows={1} />}>
            <Testimonials />
          </Suspense>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Quick answers to common questions."
            center
          />
          <FAQ />
        </Container>
      </section>

      <Container>
        <CTA />
      </Container>
    </div>
  );
};

export default HomePage;
