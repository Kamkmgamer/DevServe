// client/src/pages/TermsPage.tsx
import { useMemo } from "react";
import Container from "../components/layout/Container";
import { motion } from "framer-motion";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "definitions", title: "Definitions" },
  { id: "eligibility", title: "Eligibility" },
  { id: "account", title: "Account Registration & Security" },
  { id: "scope", title: "Scope of Services" },
  { id: "use", title: "Acceptable Use" },
  { id: "payments", title: "Payments, Invoicing & Taxes" },
  { id: "changes", title: "Changes, Cancellations & Refunds" },
  { id: "ip", title: "Intellectual Property & Licensing" },
  { id: "confidentiality", title: "Confidentiality & Non-Disclosure" },
  { id: "third-parties", title: "Third-Party Services" },
  { id: "warranty", title: "Warranties & Disclaimers" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "indemnity", title: "Indemnification" },
  { id: "compliance", title: "Compliance & Export Controls" },
  { id: "termination", title: "Suspension & Termination" },
  { id: "governing-law", title: "Governing Law & Disputes" },
  { id: "changes-to-terms", title: "Changes to these Terms" },
  { id: "contact", title: "Contact" },
];

const TermsPage = () => {
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
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 max-w-3xl text-slate-700 dark:text-slate-300">
            Thank you for using our services. Please read these Terms carefully.
            They form a legally binding agreement between you and us.
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
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                These Terms apply to all use of our website and services. If you
                do not agree, do not use the Services.
              </div>
            </div>
          </nav>

          {/* Content */}
          <article className="prose max-w-none dark:prose-invert prose-headings:scroll-mt-28">
            <section id="introduction">
              <h2>Introduction</h2>
              <p>
                These Terms of Service (“Terms”) govern your access to and use
                of our website, products, and related services (collectively,
                the “Services”). By accessing or using the Services, you agree
                to these Terms. If you are using the Services on behalf of an
                organization, you represent that you have authority to bind the
                organization to these Terms.
              </p>
            </section>

            <section id="definitions">
              <h2>Definitions</h2>
              <dl>
                <dt>“We”, “Us”, “Our”</dt>
                <dd>The service provider and owner/operator of this site.</dd>
                <dt>“You”, “Customer”, “Client”</dt>
                <dd>The person or entity using the Services.</dd>
                <dt>“Deliverables”</dt>
                <dd>
                  Work products created by us under a project, including
                  designs, code, assets, and documentation.
                </dd>
                <dt>“Statement of Work” (SOW)</dt>
                <dd>
                  A written document describing scope, timeline, fees, and
                  deliverables for a project.
                </dd>
              </dl>
            </section>

            <section id="eligibility">
              <h2>Eligibility</h2>
              <p>
                You must be at least 13 years old (or the age of majority in
                your jurisdiction) to use the Services. If you are under 18,
                you must have parental/guardian consent.
              </p>
            </section>

            <section id="account">
              <h2>Account Registration & Security</h2>
              <ul>
                <li>Provide accurate, complete information.</li>
                <li>
                  Maintain the confidentiality of your login credentials and
                  restrict access to your account and devices.
                </li>
                <li>
                  Notify us immediately of unauthorized use or security
                  incidents.
                </li>
              </ul>
            </section>

            <section id="scope">
              <h2>Scope of Services</h2>
              <p>
                We provide web design, development, performance optimization,
                consulting, and related services as described on our site or in
                a mutually agreed SOW. Minor changes to scope may be handled
                informally; material changes may require a revised SOW.
              </p>
            </section>

            <section id="use">
              <h2>Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Violate any applicable law or regulation.</li>
                <li>Interfere with the security or performance of the Services.</li>
                <li>Reverse engineer or attempt to access non-public areas.</li>
                <li>Upload malicious code, spam, or unlawful content.</li>
                <li>Use the Services to infringe third-party rights.</li>
              </ul>
            </section>

            <section id="payments">
              <h2>Payments, Invoicing & Taxes</h2>
              <p>
                Fees are quoted in USD unless otherwise stated. Invoices are due
                as specified in the SOW or invoice. Late payments may delay work
                or incur interest where permitted by law. You are responsible
                for applicable taxes, excluding our income taxes.
              </p>
            </section>

            <section id="changes">
              <h2>Changes, Cancellations & Refunds</h2>
              <p>
                Change requests may affect scope, timeline, and cost. Cancellations
                prior to project start may be refundable less non-recoverable costs.
                After work begins, refunds are limited to unearned fees for work
                not yet performed, at our discretion and subject to SOW terms.
              </p>
            </section>

            <section id="ip">
              <h2>Intellectual Property & Licensing</h2>
              <p>
                We retain rights in our pre-existing IP (frameworks, libraries,
                templates). Upon full payment, you receive a license or ownership
                of deliverables per the SOW. Third-party assets (fonts, stock,
                code) are governed by their respective licenses.
              </p>
            </section>

            <section id="confidentiality">
              <h2>Confidentiality & Non-Disclosure</h2>
              <p>
                Each party agrees to keep confidential information secret and
                use it only for the purpose of the project. Confidentiality
                obligations survive termination. Public portfolio use may be
                permitted unless otherwise agreed.
              </p>
            </section>

            <section id="third-parties">
              <h2>Third-Party Services</h2>
              <p>
                We may integrate third-party services (hosting, analytics, payment
                providers). Your use of those services may be subject to separate
                terms and privacy policies.
              </p>
            </section>

            <section id="warranty">
              <h2>Warranties & Disclaimers</h2>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p>
                  THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT
                  WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
                  LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                  AND NON-INFRINGEMENT. WE DO NOT GUARANTEE UNINTERRUPTED,
                  SECURE, OR ERROR-FREE OPERATION.
                </p>
              </div>
            </section>

            <section id="liability">
              <h2>Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL WE BE
                LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES. OUR TOTAL LIABILITY FOR ALL CLAIMS SHALL NOT
                EXCEED THE AMOUNTS YOU PAID FOR THE SERVICES DURING THE SIX (6)
                MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section id="indemnity">
              <h2>Indemnification</h2>
              <p>
                You agree to indemnify and hold us harmless from claims, damages,
                liabilities, and expenses arising from your use of the Services,
                your content, or your breach of these Terms, except to the extent
                caused by our gross negligence or willful misconduct.
              </p>
            </section>

            <section id="compliance">
              <h2>Compliance & Export Controls</h2>
              <p>
                You represent that you are not located in an embargoed country or
                on a denied-party list and that you will comply with export laws
                and sanctions applicable to your use of the Services.
              </p>
            </section>

            <section id="termination">
              <h2>Suspension & Termination</h2>
              <p>
                We may suspend or terminate access for violations of these Terms,
                legal compliance, or security reasons. Upon termination, your
                right to use the Services ceases immediately, and certain sections
                survive (e.g., IP, confidentiality, disclaimers, liability).
              </p>
            </section>

            <section id="governing-law">
              <h2>Governing Law & Disputes</h2>
              <p>
                These Terms are governed by the laws of your local jurisdiction,
                without regard to conflicts of law. Disputes shall be resolved in
                the courts of competent jurisdiction located in your region
                unless otherwise agreed in writing.
              </p>
            </section>

            <section id="changes-to-terms">
              <h2>Changes to these Terms</h2>
              <p>
                We may update these Terms from time to time. If changes are
                material, we will provide reasonable notice via the Services or
                email. Your continued use constitutes acceptance of the changes.
              </p>
            </section>

            <section id="contact">
              <h2>Contact</h2>
              <p>
                Questions about these Terms? Contact{" "}
                <a href="mailto:khalil@soft-magic.com">khalil@soft-magic.com</a>.
              </p>
            </section>
          </article>
        </div>
      </Container>
    </motion.div>
  );
};

export default TermsPage;