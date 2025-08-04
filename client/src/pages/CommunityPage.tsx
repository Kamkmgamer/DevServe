import { useSEO } from "../utils/useSEO";

const CommunityPage = () => {
  useSEO("Community | DevServe", [
    {
      name: "description",
      content:
        "Join the DevServe community—discussions, support, and contributions.",
    },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Community
      </h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <a
          href="https://github.com/Kamkmgamer"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-200 p-6 transition hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-400"
        >
          <h2 className="text-lg font-semibold">GitHub</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Report issues and contribute.
          </p>
        </a>
        <a
          href="https://x.com/kamkmgamer"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-200 p-6 transition hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-400"
        >
          <h2 className="text-lg font-semibold">Twitter</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Updates, tips, and announcements.
          </p>
        </a>
      </div>
    </main>
  );
};

export default CommunityPage;