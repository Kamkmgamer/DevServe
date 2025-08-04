import { useMemo } from "react";
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  ArrowUp,
} from "lucide-react";
import Container from "./Container";

type SocialLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const Footer = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  const socialLinks: SocialLink[] = [
    {
      name: "Twitter (X)",
      href: "https://x.com/kamkmgamer",
      icon: <Twitter className="h-5 w-5" aria-hidden="true" />,
    },
    {
      name: "GitHub",
      href: "https://github.com/Kamkmgamer",
      icon: <Github className="h-5 w-5" aria-hidden="true" />,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/kamkm-gamer/",
      icon: <Linkedin className="h-5 w-5" aria-hidden="true" />,
    },
  ];

  const productLinks = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Changelog", href: "/changelog" },
  ];

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ];

  const resourcesLinks = [
    { label: "Docs", href: "/docs" },
    { label: "Guides", href: "/guides" },
    { label: "API", href: "/api" },
    { label: "Community", href: "/community" },
  ];

  return (
    <footer
      className="relative mt-16 border-t border-slate-200 bg-slate-50/60 
                 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/60"
      role="contentinfo"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px 
                   bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
      />

      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <a
              href="/"
              className="inline-flex items-center gap-3 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-md ring-1 ring-slate-200 dark:ring-slate-800">
                <img
                  src="https://ik.imagekit.io/gtnmxyt2d/kmakm%20store/favicon.svg"
                  alt="DevServe"
                  className="h-full w-full object-contain"
                  loading="eager"
                />
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                DevServe
              </span>
            </a>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Build, deploy, and scale your projects faster. DevServe streamlines
              your developer workflow with powerful, intuitive tools.
            </p>

            <form
              className="mt-6 flex w-full max-w-md items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: connect your subscribe logic
              }}
              aria-label="Subscribe to our newsletter"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <div className="relative flex-1">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 
                             text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-slate-300 bg-white 
                             pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 
                             shadow-sm transition focus:border-blue-500 focus:outline-none 
                             focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 
                             dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md 
                           bg-blue-600 px-3 py-2 text-sm font-medium text-white 
                           shadow-sm transition hover:bg-blue-500 focus:outline-none 
                           focus:ring-2 focus:ring-blue-500/60 disabled:opacity-60 
                           dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="group inline-flex items-center justify-center rounded-full 
                             border border-transparent p-2 text-slate-500 transition 
                             hover:text-blue-600 focus:outline-none focus:ring-2 
                             focus:ring-blue-500/60 dark:text-slate-400 
                             dark:hover:text-blue-400"
                >
                  <span
                    className="rounded-full p-2 ring-1 ring-transparent 
                               transition group-hover:ring-blue-500/30 dark:group-hover:ring-blue-400/30"
                    aria-hidden="true"
                  >
                    {link.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <nav aria-label="Product">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Product
                </h3>
                <ul className="mt-4 space-y-3">
                  {productLinks.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-slate-600 transition hover:text-blue-600 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500/60 
                                   dark:text-slate-400 dark:hover:text-blue-400"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Company">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Company
                </h3>
                <ul className="mt-4 space-y-3">
                  {companyLinks.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-slate-600 transition hover:text-blue-600 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500/60 
                                   dark:text-slate-400 dark:hover:text-blue-400"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Resources">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Resources
                </h3>
                <ul className="mt-4 space-y-3">
                  {resourcesLinks.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-slate-600 transition hover:text-blue-600 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500/60 
                                   dark:text-slate-400 dark:hover:text-blue-400"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {year} DevServe. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="/privacy"
              className="text-sm text-slate-600 transition hover:text-blue-600 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/60 
                         dark:text-slate-400 dark:hover:text-blue-400"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-sm text-slate-600 transition hover:text-blue-600 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/60 
                         dark:text-slate-400 dark:hover:text-blue-400"
            >
              Terms
            </a>
            <a
              href="#top"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 
                         px-3 py-1.5 text-sm text-slate-600 transition hover:border-blue-300 
                         hover:text-blue-600 focus:outline-none focus:ring-2 
                         focus:ring-blue-500/60 dark:border-slate-700 dark:text-slate-400 
                         dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              Back to top
            </a>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-500">
          Built in GMT+3 • v1.0 • Made with ❤️ by Kamkmgamer
        </p>
      </Container>
    </footer>
  );
};

export default Footer;