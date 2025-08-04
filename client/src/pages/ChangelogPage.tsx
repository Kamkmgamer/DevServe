import { useSEO } from "../utils/useSEO";

const ChangelogPage = () => {
  useSEO("Changelog | DevServe", [
    {
      name: "description",
      content: "Changelog of updates and improvements to DevServe.",
    },
  ]);

  const changes = [
    {
      version: "1.0.0",
      date: "2025-08-02",
      notes: ["Initial public release", "New footer", "Improved layout"],
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Changelog
      </h1>

      <div className="mt-6 space-y-8">
        {changes.map((c) => (
          <section
            key={c.version}
            className="rounded-lg border border-slate-200 p-6 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">v{c.version}</h2>
              <time className="text-sm text-slate-500">{c.date}</time>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-700 dark:text-slate-300">
              {c.notes.map((n, idx) => (
                <li key={idx}>{n}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
};

export default ChangelogPage;