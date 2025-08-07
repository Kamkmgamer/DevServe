import React from 'react';
import { Code, Palette, Rocket, Target } from 'lucide-react';
import { TOKENS } from '../../utils/tokens';

export const Process: React.FC = () => {
  const steps = [
    {
      icon: Target,
      title: "Discovery",
      desc: "Clarify goals, users, KPIs, and constraints.",
    },
    { icon: Palette, title: "Design", desc: "Wireframes, UI kit, and flows." },
    { icon: Code, title: "Build", desc: "Implement, test, iterate fast." },
    { icon: Rocket, title: "Launch", desc: "Ship, monitor, optimize." },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <ol className="relative ml-3 border-l border-slate-200 dark:border-slate-800">
        {steps.map((s, i) => (
          <li key={s.title} className="mb-8 ml-6">
            <span
              className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white dark:ring-slate-900"
              aria-hidden="true"
            >
              <s.icon className="h-3.5 w-3.5" />
            </span>
            <h3 className={`mb-1 font-semibold ${TOKENS.textHeading}`}>
              {i + 1}. {s.title}
            </h3>
            <p className={`${TOKENS.textBody} text-sm`}>{s.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};
