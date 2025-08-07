import React from 'react';
import { ExternalLink } from 'lucide-react';
import { TOKENS } from '../../utils/tokens';
import { Badge } from '../ui/Badge';

export const CaseStudies: React.FC = () => {
  const cases = [
    {
      title: "Fintech Dashboard",
      impact: "↑ 38% user retention",
      href: "https://khalils-portfolio.vercel.app/",
      tag: "B2B",
      desc: "Refactored data layer and optimized charts; improved TTI by 42% and simplified workflows for B2B users.",
    },
    {
      title: "E‑commerce Revamp",
      impact: "↑ 24% conversion rate",
      href: "https://khalils-portfolio.vercel.app/",
      tag: "DTC",
      desc: "Redesigned PDP/checkout, implemented performance budget, and A/B tested for significant UX wins.",
    },
    {
      title: "SaaS Marketing Site",
      impact: "↑ SEO traffic +67%",
      href: "https://khalils-portfolio.vercel.app/",
      tag: "SaaS",
      desc: "Built fast-loading pages with semantic markup; improved Core Web Vitals and boosted organic search traffic.",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cases.map((c) => (
        <a
          key={c.title}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open case study: ${c.title}`}
          className={`group relative overflow-hidden ${TOKENS.surfaceGlass} ${TOKENS.radius.lg} p-6 ${TOKENS.shadow}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="mb-3 flex items-center justify-between">
            <div className={`text-xs uppercase tracking-wide ${TOKENS.textMuted}`}>
              Case Study
            </div>
            <Badge tone="blue">{c.tag}</Badge>
          </div>
          <h3 className={`mb-1 text-lg font-semibold ${TOKENS.textHeading}`}>
            {c.title}
          </h3>
          <div className={`mb-2 text-sm ${TOKENS.textBody}`}>{c.impact}</div>
          <p className={`mb-4 text-sm ${TOKENS.textBody}`}>{c.desc}</p>
          <div className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:underline">
            View details
            <ExternalLink className="ml-1 h-4 w-4" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0"
          />
        </a>
      ))}
    </div>
  );
};
