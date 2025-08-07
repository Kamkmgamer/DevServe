import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Button from '../ui/Button';
import { TOKENS } from '../../utils/tokens';

export const CTA: React.FC = () => {
  return (
    <section className="py-16">
      <div
        className={`relative overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.xl} p-8 md:p-12 ${TOKENS.shadow}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div className="mx-auto max-w-2xl text-center">
          <h3 className={`mb-3 text-3xl font-bold ${TOKENS.textHeading}`}>
            Ready to Start Your Project?
          </h3>
          <p className={`${TOKENS.textBody} mb-8`}>
            Let’s bring your vision to life with clean code and thoughtful
            design.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/contact">
              <Button variant="primary">Get Started Today</Button>
            </Link>
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Schedule a call on Calendly"
            >
              <Button variant="cta-ghost">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Call
              </Button>
            </a>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Prefer email?{" "}
            <a
              className="underline underline-offset-2"
              href="mailto:khalilabdalmajeed@gmail.com?subject=Project%20Inquiry&body=Tell%20me%20about%20your%20project..."
            >
              Send a brief
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
