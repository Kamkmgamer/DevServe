// client/src/pages/PricingPage.tsx
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { CheckCircle, Star, Shield, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type Tier = {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlight?: boolean;
  ctaLink: string;
  badge?: string;
};

const pricingTiers: Tier[] = [
  {
    name: "Starter",
    price: 499,
    description:
      "Ideal for individuals or small businesses needing a strong online presence.",
    features: [
      "1–3 professional pages",
      "Mobile‑responsive design",
      "Basic SEO optimization",
      "Integrated contact form",
      "1‑month post‑launch support",
    ],
    highlight: false,
    ctaLink: "/contact",
    badge: "Best for getting started",
  },
  {
    name: "Professional",
    price: 999,
    description:
      "Perfect for growing businesses requiring custom features and more content.",
    features: [
      "Up to 7 custom‑designed pages",
      "Advanced UI/UX",
      "Comprehensive SEO strategy",
      "Blog/news integration",
      "Interactive portfolio/gallery",
      "3‑month dedicated support",
    ],
    highlight: true,
    ctaLink: "/contact",
    badge: "Most popular",
  },
  {
    name: "Business",
    price: 1999,
    description:
      "For established companies needing a robust platform with advanced capabilities.",
    features: [
      "Unlimited pages & sections",
      "E‑commerce integration (Shopify/WooCommerce)",
      "High‑performance optimization",
      "Custom web apps/SaaS features",
      "6‑month priority support & updates",
      "Dedicated account manager",
    ],
    highlight: false,
    ctaLink: "/contact",
    badge: "Maximum flexibility",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PricingPage = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <Container className="py-16">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-12 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            <Star className="h-4 w-4" />
            Transparent, one‑time pricing
          </div>
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900 dark:text-white md:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            Choose the plan that fits your needs. Every project includes clear
            timelines, responsive builds, and best‑practice SEO.
          </p>
          <div className="mx-auto mt-6 max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Shield className="mr-2 inline h-4 w-4" />
            14‑day money‑back guarantee if you’re not satisfied with the initial
            deliverables.
          </div>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {pricingTiers.map((tier, index) => {
            const isHighlight = !!tier.highlight;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={[
                  "relative flex flex-col overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  isHighlight
                    ? "border-blue-200 bg-gradient-to-b from-white to-blue-50 dark:border-blue-900 dark:from-slate-900 dark:to-slate-900/60"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
                ].join(" ")}
              >
                {/* Badge */}
                {tier.badge && (
                  <div
                    className={[
                      "absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
                      isHighlight
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
                    ].join(" ")}
                  >
                    {tier.badge}
                  </div>
                )}

                {/* Header */}
                <div
                  className={[
                    "rounded-xl p-4",
                    isHighlight
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white",
                  ].join(" ")}
                >
                  <h2 className="text-2xl font-bold">{tier.name}</h2>
                  <p
                    className={[
                      "mt-1 text-sm",
                      isHighlight
                        ? "text-blue-100"
                        : "text-slate-600 dark:text-slate-300",
                    ].join(" ")}
                  >
                    {tier.description}
                  </p>
                  <div className="mt-5 text-center">
                    <span
                      className={[
                        "text-5xl font-extrabold",
                        isHighlight
                          ? "text-white"
                          : "text-blue-600 dark:text-blue-400",
                      ].join(" ")}
                    >
                      ${tier.price}
                    </span>
                    <span
                      className={[
                        "ml-1 text-lg font-medium",
                        isHighlight ? "text-blue-100" : "text-slate-500",
                      ].join(" ")}
                    >
                      /one‑time
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex-grow p-4">
                  <ul className="space-y-3">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle
                          className={[
                            "mr-3 h-5 w-5 flex-shrink-0",
                            isHighlight
                              ? "text-blue-600"
                              : "text-emerald-500",
                          ].join(" ")}
                        />
                        <span className="text-slate-700 dark:text-slate-200">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-auto p-4">
                  <Link to={tier.ctaLink}>
                    <Button
                      variant={isHighlight ? "primary" : "secondary"}
                      className={[
                        "w-full py-3 text-lg",
                        isHighlight
                          ? ""
                          : "border border-slate-300 dark:border-slate-700",
                      ].join(" ")}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison / Note */}
        <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <p>
            Not sure which plan is right for you? Start with{" "}
            <span className="font-semibold">Professional</span> for the best
            balance of features and value. You can always add e‑commerce or
            custom app work later as add‑ons.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold text-slate-900 dark:text-white">
            <HelpCircle className="h-6 w-6" />
            Frequently Asked Questions
          </h3>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4">
            <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer select-none font-medium">
                What if I need more pages later?
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                You can add pages anytime. I’ll quote per page/feature based on
                scope and complexity.
              </p>
            </details>
            <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer select-none font-medium">
                Do these prices include hosting?
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Hosting is separate, but I’ll recommend the best option (Vercel,
                Netlify, or a VPS) and handle setup during delivery.
              </p>
            </details>
            <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer select-none font-medium">
                Can you migrate my existing site?
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Yes—content and SEO‑friendly redirects are included in the
                migration scope.
              </p>
            </details>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link to="/contact">
            <Button variant="cta-light" className="px-8 py-3 text-lg">
              Talk to me about your project
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default PricingPage;