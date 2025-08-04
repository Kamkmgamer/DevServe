import { useSEO } from "../utils/useSEO";

const DeployingGuide = () => {
  useSEO("Deploying | DevServe", [
    {
      name: "description",
      content: "Deploy your DevServe-powered project with confidence and ease.",
    },
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Deploying
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Learn how to deploy your DevServe project to different environments.
      </p>

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Build Setup
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Prepare your app for production with optimized builds.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Hosting Options
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Deploy on Vercel, Netlify, or your custom server.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Environment Variables
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage `.env` securely for different environments.
          </p>
        </div>
      </section>
    </main>
  );
};

export default DeployingGuide;
