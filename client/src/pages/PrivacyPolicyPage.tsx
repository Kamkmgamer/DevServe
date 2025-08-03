import { useMemo } from "react";
import Container from "../components/layout/Container";
import { motion } from "framer-motion";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "lawful-basis", title: "Lawful Basis for Processing" },
  { id: "data-we-collect", title: "Data We Collect" },
  { id: "how-we-use", title: "How We Use Data" },
  { id: "cookies", title: "Cookies & Similar Technologies" },
  { id: "analytics", title: "Analytics, Ads & Social" },
  { id: "sharing", title: "Data Sharing & Transfers" },
  { id: "security", title: "Security Measures" },
  { id: "your-rights", title: "Your Rights & Choices" },
  { id: "retention", title: "Data Retention" },
  { id: "children", title: "Children’s Privacy" },
  { id: "changes", title: "Changes to this Policy" },
  { id: "contact", title: "Contact" },
];

const PrivacyPage = () => {
  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-50 dark:bg-slate-950"
    >
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-100 to-transparent py-12 dark:from-slate-900/40">
        <Container className="max-w-5xl">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 max-w-3xl text-slate-700 dark:text-slate-300">
            Your privacy matters. This policy explains what we collect, why we
            collect it, and how you can control your information.
          </p>
        </Container>
      </div>

      <Container className="max-w-5xl pb-16 pt-6">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          {/* TOC */}
          <nav className="top-24 hidden md:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 font-semibold text-slate-800 dark:text-slate-100">
                On this page
              </div>
              <ul className="space-y-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                We do not sell your personal data. We only share it as described
                below, and always with appropriate safeguards.
              </div>
            </div>
          </nav>

          {/* Content */}
          <article className="prose max-w-none dark:prose-invert prose-headings:scroll-mt-28">
            <section id="overview">
              <h2>Overview</h2>
              <p>
                This policy applies to our website and Services. By using them,
                you consent to this policy. If you disagree, please stop using
                the Services.
              </p>
            </section>

            <section id="lawful-basis">
              <h2>Lawful Basis for Processing</h2>
              <p>
                Where required (e.g., under GDPR), we process data under
                legitimate interests, contract necessity, consent, or legal
                obligations. We balance our interests against your rights.
              </p>
            </section>

            <section id="data-we-collect">
              <h2>Data We Collect</h2>
              <ul>
                <li>
                  <strong>Account Data</strong>: name, email, authentication
                  tokens, profile preferences.
                </li>
                <li>
                  <strong>Usage Data</strong>: pages visited, session duration,
                  device/browser info, IP address.
                </li>
                <li>
                  <strong>Content</strong>: forms, comments, uploads you submit.
                </li>
                <li>
                  <strong>Transaction Data</strong>: billing details (handled by
                  PCI-compliant processors), invoices, order history.
                </li>
                <li>
                  <strong>Cookies</strong>: preference and analytics cookies.
                </li>
              </ul>
            </section>

            <section id="how-we-use">
              <h2>How We Use Data</h2>
              <ul>
                <li>Provide, secure, and improve the Services.</li>
                <li>Personalize content and measure performance.</li>
                <li>Communicate updates, offers, and support information.</li>
                <li>Prevent abuse, fraud, and security incidents.</li>
                <li>Comply with legal obligations and enforce policies.</li>
              </ul>
            </section>

            <section id="cookies">
              <h2>Cookies & Similar Technologies</h2>
              <p>
                Cookies help us remember preferences, keep you logged in, and
                analyze usage. You can control cookies via your browser. Some
                features may not function without certain cookies.
              </p>
            </section>

            <section id="analytics">
              <h2>Analytics, Ads & Social</h2>
              <p>
                We may use privacy‑respecting analytics (e.g., first‑party or
                cookieless). If we use third‑party analytics, ads, or social
                widgets, they may set cookies or collect data per their policies.
              </p>
            </section>

            <section id="sharing">
              <h2>Data Sharing & Transfers</h2>
              <ul>
                <li>
                  <strong>Service Providers</strong>: hosting, analytics,
                  payments, email—bound by contracts to process data on our
                  behalf.
                </li>
                <li>
                  <strong>Legal</strong>: to comply with law or protect rights,
                  safety, and security.
                </li>
                <li>
                  <strong>Business Transfers</strong>: in mergers or acquisitions
                  with notice where appropriate.
                </li>
              </ul>
              <p>
                If data is transferred internationally, we use lawful transfer
                mechanisms (e.g., SCCs) where required.
              </p>
            </section>

            <section id="security">
              <h2>Security Measures</h2>
              <p>
                We employ reasonable administrative, technical, and physical
                safeguards, such as encryption in transit, access controls, and
                secure development practices. No method is 100% secure.
              </p>
            </section>

            <section id="your-rights">
              <h2>Your Rights & Choices</h2>
              <ul>
                <li>Access, correct, or delete your personal data.</li>
                <li>Export your data in a portable format where applicable.</li>
                <li>Object to or restrict certain processing.</li>
                <li>Withdraw consent where processing is based on consent.</li>
                <li>Manage cookies via browser settings.</li>
              </ul>
              <p>
                To exercise rights, contact{" "}
                <a href="mailto:privacy@example.com">privacy@example.com</a>.
                We may verify your identity to protect your data.
              </p>
            </section>

            <section id="retention">
              <h2>Data Retention</h2>
              <p>
                We retain data as long as necessary to provide the Services,
                comply with legal obligations, resolve disputes, and enforce
                agreements. We delete or anonymize data when it’s no longer
                needed.
              </p>
            </section>

            <section id="children">
              <h2>Children’s Privacy</h2>
              <p>
                Our Services are not directed to children under 13 (or as
                defined by local law). If you believe a child provided data,
                please contact us and we will take appropriate steps.
              </p>
            </section>

            <section id="changes">
              <h2>Changes to this Policy</h2>
              <p>
                We may update this policy to reflect changes in law or our
                practices. If changes are material, we will notify you via the
                Services or email. Continued use means you accept the updated
                policy.
              </p>
            </section>

            <section id="contact">
              <h2>Contact</h2>
              <p>
                Questions or requests? Contact{" "}
                <a href="mailto:privacy@example.com">privacy@example.com</a>.
              </p>
            </section>
          </article>
        </div>
      </Container>
    </motion.div>
  );
};

export default PrivacyPage;