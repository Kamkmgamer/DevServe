import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { TOKENS } from "../../utils/tokens";

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
    <div className="grid gap-8 md:grid-cols-3">
      {plans.map((p, index) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.15 }}
          viewport={{ once: true }}
        >
          <Card
            className={`relative p-6 border shadow-lg rounded-2xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl ${
              p.featured
                ? "border-blue-500 bg-gradient-to-b from-blue-50/50 dark:from-blue-900/20"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            {p.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge tone="blue" className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" /> Recommended
                </Badge>
              </div>
            )}

            <h3
              className={`mt-4 mb-2 text-xl font-bold tracking-tight ${
                TOKENS.textHeading
              } ${p.featured ? "text-blue-600 dark:text-blue-400" : ""}`}
            >
              {p.name}
            </h3>

            <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Timeline: {p.price}
            </p>

            <p className={`mb-5 text-sm ${TOKENS.textBody}`}>{p.pitch}</p>

            <ul className="mb-6 space-y-3 text-sm">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      p.featured ? "text-blue-500" : "text-green-500"
                    }`}
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <Link to={p.cta}>
              <Button
                variant={p.featured ? "primary" : "cta-light"}
                className="w-full transition-transform duration-200 hover:scale-[1.02]"
              >
                Let’s Talk
              </Button>
            </Link>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
