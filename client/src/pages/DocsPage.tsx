import { useSEO } from "../utils/useSEO";
import { BookOpen, Code2 } from "lucide-react";

const DocsPage = () => {
  useSEO("Docs | DevServe", [
    {
      name: "description",
      content:
        "Explore DevServe documentation—learn how to integrate, configure, and scale your projects using our platform.",
    },
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          DevServe Documentation
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
          Everything you need to build, integrate, and extend with DevServe.
          Browse step-by-step tutorials and dive into our complete API reference.
        </p>
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <a
          href="/guides"
          className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:hover:border-blue-500"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-500 group-hover:animate-pulse" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Guides
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Hands-on tutorials to help you get started quickly with DevServe.
          </p>
        </a>

        <a
          href="/api"
          className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:hover:border-blue-500"
        >
          <div className="flex items-center gap-3">
            <Code2 className="h-6 w-6 text-blue-500 group-hover:animate-pulse" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              API Reference
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Explore all available endpoints, authentication methods, and code examples.
          </p>
        </a>
      </div>
    </main>
  );
};

export default DocsPage;
