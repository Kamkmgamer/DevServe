import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TOKENS } from '../../utils/tokens';

export const PricingTeaser: React.FC = () => {
  const plans = [
    {
      name: "Starter",
      price: "2–4 weeks",
      pitch: "Perfect for landing pages or MVPs.",
      bullets: ["Design + Build", "Basic SEO", "Analytics setup"],
      cta: "/contact",
    },
    {
      name: "Growth",
      price: "4–8 weeks",
      pitch: "For apps, dashboards, and integrations.",
      bullets: ["Design system", "API & DB", "Performance budget"],
      cta: "/contact",
      featured: true,
    },
    {
      name: "Partner",
      price: "Ongoing",
      pitch: "Your long-term product partner.",
      bullets: ["Retainer", "Sprints", "Roadmap & reviews"],
      cta: "/contact",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((p) => (
        <Card
          key={p.name}
          className={`p-6 ${p.featured ? "ring-1 ring-blue-500/30" : ""}`}
        >
          <div className="mb-1 text-xs uppercase tracking-wide text-blue-600">
            {p.featured ? <Badge tone="blue">Recommended</Badge> : "Package"}
          </div>
          <h3 className={`mb-2 text-lg font-semibold ${TOKENS.textHeading}`}>
            {p.name}
          </h3>
          <div className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Timeline: {p.price}
          </div>
          <p className={`mb-4 text-sm ${TOKENS.textBody}`}>{p.pitch}</p>
          <ul className="mb-6 space-y-2 text-sm">
            {p.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className={`${TOKENS.textBody}`}>{b}</span>
              </li>
            ))}
          </ul>
          <Link to={p.cta}>
            <Button
              variant={p.featured ? "primary" : "cta-light"}
              className="w-full"
            >
              Let’s Talk
            </Button>
          </Link>
        </Card>
      ))}
    </div>
  );
};
