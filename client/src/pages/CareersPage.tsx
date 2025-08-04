import { useEffect, useMemo, useRef } from "react";
import { useSEO } from "../utils/useSEO";

type Role = {
  id: string;
  title: string;
  blurb: string;
  subject: string;
  tags?: string[];
  compensationNote?: string;
};

const roles: Role[] = [
  {
    id: "account-executive-commission",
    title: "Account Executive (Commission-Only)",
    blurb:
      "Prospect, pitch, and close deals for custom web development and design services. You'll work directly with خليل عبد المجيد to bring in high-value clients.",
    subject: "Account Executive (Commission-Only) Application",
    tags: ["Commission-only", "Remote", "Sales"],
    compensationNote:
      "Uncapped commission based on closed deals. Typical earnings range $8k–$20k in the first 90 days.",
  },
  {
    id: "sdr-commission",
    title: "Sales Development Representative (Commission-Only)",
    blurb:
      "Use outbound to book meetings with potential clients interested in custom apps, websites, or SaaS platforms built by a seasoned developer.",
    subject: "SDR (Commission-Only) Application",
    tags: ["Commission-only", "Remote", "Outbound"],
    compensationNote: "Earn per qualified meeting + bonus when deals close.",
  },
  {
    id: "partnerships-commission",
    title: "B2B Partnerships Manager (Commission-Only)",
    blurb:
      "Build reseller and agency partnerships to refer clients needing bespoke development. You’ll unlock long-term revenue from repeat contracts.",
    subject: "B2B Partnerships (Commission-Only) Application",
    tags: ["Commission-only", "Remote", "Partnerships"],
    compensationNote:
      "Rev-share on referred deals + accelerator tiers for volume.",
  },
];

const metrics = [
  { kpi: "Meetings booked (SDR)", target: "30–50/month" },
  { kpi: "Qualified pipeline created", target: "$80k–$150k/month" },
  { kpi: "Close rate (AE)", target: "20–30% on SQLs" },
  { kpi: "Sales cycle", target: "2–6 weeks typical" },
];

const useStaggerReveal = (selector: string, rootMargin = "0px 0px -10% 0px") => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("reveal-in");
            io.unobserve(el);
          }
        });
      },
      { rootMargin, threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [selector, rootMargin]);
};

const FloatingBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft gradient wash */}
      <div className="absolute -top-32 -right-40 h-[60vh] w-[60vw] rounded-full blur-3xl opacity-30 dark:opacity-20 bg-gradient-to-br from-blue-400 via-indigo-400 to-fuchsia-400 animate-[pulse_12s_ease-in-out_infinite]" />
      <div className="absolute -bottom-32 -left-40 h-[60vh] w-[60vw] rounded-full blur-3xl opacity-30 dark:opacity-20 bg-gradient-to-tr from-emerald-400 via-cyan-400 to-blue-400 animate-[pulse_14s_ease-in-out_infinite]" />
      {/* Parallax dots */}
      <div className="absolute inset-0">
        <div className="parallax pointer-events-none absolute inset-0 opacity-30">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute size-1.5 rounded-full bg-slate-400/50 dark:bg-slate-600/50"
              style={{
                top: `${(i * 137) % 100}%`,
                left: `${(i * 97) % 100}%`,
                transform: `translateZ(0)`,
                animation: `floatY ${10 + (i % 6)}s ease-in-out ${
                  (i % 7) * 0.35
                }s infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>
      <style>
        {`
          @keyframes floatY {
            from { transform: translateY(0px); }
            to { transform: translateY(-18px); }
          }
        `}
      </style>
    </div>
  );
};

const RoleCard = ({ role }: { role: Role }) => {
  return (
    <li
      className="reveal opacity-0 translate-y-6 will-change-transform rounded-2xl border border-slate-200/70 dark:border-slate-800/60 p-6 backdrop-blur bg-white/60 dark:bg-slate-900/40 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out group"
      style={{
        backgroundImage:
          "radial-gradient(1200px 200px at 20% 0%, rgba(59,130,246,.08), transparent)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {role.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {role.blurb}
          </p>
          {!!role.tags?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {role.tags.map((tag, i) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-slate-100/80 text-slate-700 dark:bg-slate-800/70 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  style={{
                    transitionDelay: `${i * 40}ms`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {role.compensationNote && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Compensation: {role.compensationNote}
            </p>
          )}
        </div>
        <a
          href={`mailto:khalil@soft-magic.com?subject=${encodeURIComponent(
            role.subject
          )}`}
          className="shrink-0 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 text-sm font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all shadow-md hover:shadow-lg relative overflow-hidden"
        >
          <span className="relative z-10">Apply now →</span>
          <span className="pointer-events-none absolute inset-0 bg-white/20 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
        </a>
      </div>
    </li>
  );
};

const KPIItem = ({ label, value }: { label: string; value: string }) => (
  <li className="reveal opacity-0 translate-y-6 will-change-transform flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 bg-white/50 dark:bg-slate-900/30 backdrop-blur hover:-translate-y-1 hover:shadow-md transition-all duration-300">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </span>
    <span className="text-sm text-slate-600 dark:text-slate-400">
      {value}
    </span>
  </li>
);

const Divider = () => (
  <div className="relative my-16">
    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
    <div className="absolute left-1/2 -translate-x-1/2 -top-2 h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" />
  </div>
);

const CareersPage = () => {
  useSEO("Careers | DevServe", [
    {
      name: "description",
      content:
        "Commission-based sales roles helping خليل عبد المجيد sell web services.",
    },
    { name: "robots", content: "index,follow" },
    { name: "og:title", content: "Careers | Sales Roles at DevServe" },
    {
      name: "og:description",
      content:
        "Earn commission promoting expert web development services by خليل عبد المجيد.",
    },
  ]);

  const mailtoGeneral = useMemo(
    () => "mailto:khalil@soft-magic.com?subject=Sales%20Application",
    []
  );

  // Stagger reveal for elements with .reveal
  useStaggerReveal(".reveal");

  const heroRef = useRef<HTMLDivElement | null>(null);

  // Parallax hero accent
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--rx", `${my * 6}deg`);
      el.style.setProperty("--ry", `${-mx * 6}deg`);
      el.style.setProperty("--tx", `${-mx * 6}px`);
      el.style.setProperty("--ty", `${-my * 6}px`);
    };
    const onLeave = () => {
      el.style.setProperty("--rx", `0deg`);
      el.style.setProperty("--ry", `0deg`);
      el.style.setProperty("--tx", `0px`);
      el.style.setProperty("--ty", `0px`);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <main className="relative">
      <FloatingBackground />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <header
          ref={heroRef}
          className="reveal opacity-0 translate-y-6 will-change-transform text-center"
          style={{
            transform:
              "perspective(1000px) rotateX(var(--rx, 0)) rotateY(var(--ry, 0)) translateX(var(--tx, 0)) translateY(var(--ty, 0))",
            transition: "transform 200ms ease-out",
          }}
        >
          <span className="inline-flex items-center rounded-full bg-emerald-50/70 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1 text-xs font-medium border border-emerald-100/60 dark:border-emerald-800/50 shadow-sm backdrop-blur">
            Remote-first • Commission-based • Creator-backed
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Help Sell My Services
          </h1>

          <p className="mt-4 text-lg text-slate-700 dark:text-slate-300 mx-auto max-w-2xl leading-relaxed">
            I build fast, custom websites and apps. Join the sales side and earn
            a cut from every deal you bring in.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#open-roles"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-md hover:shadow-lg transition-all"
            >
              View open roles
            </a>
            <a
              href={mailtoGeneral}
              className="relative inline-flex items-center justify-center rounded-md border border-slate-300/80 dark:border-slate-700/80 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/60 backdrop-blur shadow-sm transition-all overflow-hidden"
            >
              <span className="relative z-10">Send a general pitch</span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-140%] hover:translate-x-[140%] transition-transform duration-700" />
            </a>
          </div>
        </header>

        <Divider />

        <section id="open-roles" className="reveal opacity-0 translate-y-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
            Open Sales Roles
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Commission-only. Close more, earn more. Ideal for self-starters.
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {roles.map((role, idx) => (
              <div
                key={role.id}
                style={{ transitionDelay: `${idx * 60}ms` }}
                className="reveal opacity-0 translate-y-6"
              >
                <RoleCard role={role} />
              </div>
            ))}
          </ul>
        </section>

        <section className="mt-16 revael">
          <div className="reveal opacity-0 translate-y-6 border-t border-slate-200/80 dark:border-slate-800/70 pt-10">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              What you're selling
            </h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed">
              My services include web design, app development, full-stack
              builds, and UI engineering for startups and founders. You’ll be
              offering high-quality, conversion-focused solutions with case
              studies to back it.
            </p>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metrics.map((m, i) => (
                <div
                  key={m.kpi}
                  className="reveal opacity-0 translate-y-6"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <KPIItem label={m.kpi} value={m.target} />
                </div>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <div className="reveal opacity-0 translate-y-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Enablement & Compensation
            </h3>
            <ul className="mt-4 space-y-3 text-slate-700 dark:text-slate-300 list-disc pl-6">
              <li>High-margin services mean strong commissions.</li>
              <li>Messaging, pitch decks, and examples provided.</li>
              <li>Earn from new and repeat clients you bring.</li>
              <li>Get credited for referrals, intros, or closing deals.</li>
              <li>Async-friendly, global, work your own hours.</li>
            </ul>
          </div>
        </section>

        <Divider />

        <section>
          <div className="reveal opacity-0 translate-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              💬 No role fits?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Just reach out anyway — pitch your skills or send a quick intro to{" "}
              <a
                href="mailto:khalil@soft-magic.com"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                khalil@soft-magic.com
              </a>
            </p>
          </div>
        </section>

        <footer className="mt-20 text-center text-sm text-slate-500 dark:text-slate-400">
          I'm all about results — if you bring the right energy, we’ll win
          together.
        </footer>
      </section>

      {/* Global reveal animation styles */}
      <style>
        {`
          .reveal {
            transition: opacity 600ms ease, transform 600ms ease,
                        box-shadow 300ms ease, background 300ms ease;
          }
          .reveal-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        `}
      </style>
    </main>
  );
};

export default CareersPage;