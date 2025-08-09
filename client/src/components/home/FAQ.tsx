import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card } from "../ui/Card";
import { TOKENS } from "../../utils/tokens";

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
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={f.q}
            layout
            transition={{ layout: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }}
          >
            <Card
              className={`mb-3 p-4 transition-colors duration-200 ${
                isOpen ? "bg-slate-50 dark:bg-slate-800/50" : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <h3 className="text-base font-medium">
                <button
                  onClick={() => setOpen((o) => (o === i ? null : i))}
                  className={`flex w-full items-center justify-between text-left focus:outline-none ${TOKENS.ring}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                >
                  <span className={`${TOKENS.textHeading}`}>{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <ChevronRight className="h-5 w-5 text-slate-500" />
                  </motion.span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-${i}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <p className={`pt-3 text-sm leading-relaxed ${TOKENS.textBody}`}>
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
