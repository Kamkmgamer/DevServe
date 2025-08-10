import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Hero } from '../components/home/Hero';
import { TechMarquee } from '../components/home/TechMarquee';
import { CTA } from '../components/home/CTA';
import { Process } from '../components/home/Process';
import { PricingTeaser } from '../components/home/PricingTeaser';
import { FAQ } from '../components/home/FAQ';
import { SectionSkeleton } from '../components/ui/SectionSkeleton';
import SectionWrapper from '../components/layout/SectionWrapper';
import Container from '../components/layout/Container';
import api from '../api/axios';

const CaseStudies = lazy(() => import('../components/home/CaseStudies').then(module => ({ default: module.CaseStudies })));
const Testimonials = lazy(() => import('../components/home/Testimonials').then(module => ({ default: module.Testimonials })));

const HomePage: React.FC = () => {
  const [aiTip, setAiTip] = useState('');

  useEffect(() => {
    const fetchAiTip = async () => {
      try {
        // Use a custom axios instance without the global error handler for this non-critical request
        const response = await api.get('/chatbot/daily-tip', {
          // Disable global error handling for this request
          validateStatus: () => true
        });
        
        if (response.status === 200 && response.data.content) {
          setAiTip(response.data.content);
        } else {
          // Use the fallback message from the server if available
          setAiTip(response.data.content || 'AI features coming soon! Configure your OpenRouter API key to enable.');
        }
      } catch (error) {
        console.log('Daily AI tip not available');
        setAiTip('AI features coming soon!');
      }
    };

    fetchAiTip();
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 rounded bg-blue-600 px-3 py-2 text-white"
      >
        Skip to content
      </a>

      <Hero />

      <SectionWrapper title="Daily AI Tip" center>
        <p className="text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
          {aiTip || 'Fetching your daily tip...'}
        </p>
      </SectionWrapper>

      <div id="main" />

      <SectionWrapper className="py-10">
        <TechMarquee />
      </SectionWrapper>

      <SectionWrapper
        title="Recent Work"
        subtitle="A snapshot of projects that improved performance and outcomes."
        center
      >
        <Suspense fallback={<SectionSkeleton rows={3} />}>
          <CaseStudies />
        </Suspense>
      </SectionWrapper>

      <SectionWrapper>
        <Process />
      </SectionWrapper>

      <SectionWrapper
        title="Flexible Ways to Partner"
        subtitle="Pick a track that fits your scope and timeline."
        center
      >
        <PricingTeaser />
      </SectionWrapper>

      <SectionWrapper className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold">Client Feedback</h2>
          <p className="opacity-90">
            Trusted by teams to deliver quality and speed.
          </p>
        </div>
        <Suspense fallback={<SectionSkeleton rows={1} />}>
          <Testimonials />
        </Suspense>
      </SectionWrapper>

      <SectionWrapper
        title="Frequently Asked Questions"
        subtitle="Quick answers to common questions."
        center
      >
        <FAQ />
      </SectionWrapper>

      <Container>
        <CTA />
      </Container>
    </div>
  );
};

export default HomePage;