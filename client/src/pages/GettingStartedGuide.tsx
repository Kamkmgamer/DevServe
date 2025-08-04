import { useSEO } from "../utils/useSEO";

const GettingStartedGuide = () => {
  useSEO("Getting Started | DevServe", [
    {
      name: "description",
      content: "Learn how to set up and start using DevServe in minutes.",
    },
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Getting Started
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Welcome to DevServe! This guide will walk you through setting up your
        environment and deploying your first project.
      </p>

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            1. Installation
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Instructions to install DevServe CLI and dependencies.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            2. Project Setup
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            How to initialize your project and connect services.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            3. First Deployment
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Deploy your first build and view your live app.
          </p>
        </div>
      </section>
    </main>
  );
};

export default GettingStartedGuide;
