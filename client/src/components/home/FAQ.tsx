import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { TOKENS } from '../../utils/tokens';

export const FAQ: React.FC = () => {
  const faqs = [
    {
      q: "What stack do you use?",
      a: "React, TypeScript, Node, Tailwind, Postgres/Prisma, Next/Vite — chosen per project needs.",
    },
    {
      q: "How do we collaborate?",
      a: "Weekly check-ins, async updates, and a shared roadmap. You’ll always know status and next steps.",
    },
    {
      q: "Do you handle deployments?",
      a: "Yes — CI/CD, observability, and production readiness (Vercel/AWS).",
    },
    {
      q: "What about accessibility?",
      a: "WCAG-first mindset, semantic HTML, keyboard support, and prefers-reduced-motion respected.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl">
      {faqs.map((f, i) => (
        <Card key={f.q} className={`mb-3 p-4`}>
          <h3 className="text-base font-medium">
            <button
              className={`flex w-full items-center justify-between text-left ${TOKENS.ring}`}
              onClick={() => setOpen((o) => (o === i ? null : i))}
              aria-expanded={open === i}
              aria-controls={`faq-${i}`}
            >
              <span className={`${TOKENS.textHeading}`}>{f.q}</span>
              <ChevronRight
                className={`h-5 w-5 text-slate-500 transition-transform ${open === i ? "rotate-90" : ""}`}
              />
            </button>
          </h3>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                id={`faq-${i}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className={`pt-3 text-sm ${TOKENS.textBody}`}>{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
};
