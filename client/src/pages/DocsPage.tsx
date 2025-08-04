import { useSEO } from "../utils/useSEO";

const DocsPage = () => {
  useSEO("Docs | DevServe", [
    {
      name: "description",
      content:
        "Documentation for DevServe—get started, configuration, and advanced guides.",
    },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Documentation
      </h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <a
          href="/guides"
          className="rounded-lg border border-slate-200 p-6 transition hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-400"
        >
          <h2 className="text-lg font-semibold">Guides</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Step-by-step tutorials to build with DevServe.
          </p>
        </a>
        <a
          href="/api"
          className="rounded-lg border border-slate-200 p-6 transition hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-400"
        >
          <h2 className="text-lg font-semibold">API Reference</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Endpoints, authentication, and examples.
          </p>
        </a>
      </div>
    </main>
  );
};

export default DocsPage;