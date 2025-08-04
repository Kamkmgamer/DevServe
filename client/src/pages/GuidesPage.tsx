import { useSEO } from "../utils/useSEO";
import { ChevronRightCircle } from "lucide-react";

const GuidesPage = () => {
  useSEO("Guides | DevServe", [
    { name: "description", content: "Step-by-step guides for using DevServe effectively." },
  ]);

  const guides = [
    {
      title: "Getting Started",
      description: "Set up DevServe for the first time with minimal effort.",
      href: "/GettingStartedGuide",
    },
    {
      title: "Authentication",
      description: "Learn how to securely authenticate with our API.",
      href: "/changeAuthenticationGuidelog",
    },
    {
      title: "Deploying",
      description: "Best practices and walkthroughs to deploy your project.",
      href: "/DeployingGuide",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Guides
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          Practical tutorials and how-tos to help you make the most out of DevServe.
        </p>
      </section>

      <ul className="mt-8 space-y-4">
        {guides.map((guide) => (
          <li key={guide.title}>
            <a
              href={guide.href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-slate-800"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {guide.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {guide.description}
                </p>
              </div>
              <ChevronRightCircle className="h-6 w-6 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default GuidesPage;
