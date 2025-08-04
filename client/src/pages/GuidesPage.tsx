import { useSEO } from "../utils/useSEO";

const GuidesPage = () => {
  useSEO("Guides | DevServe", [
    { name: "description", content: "Guides for using DevServe effectively." },
  ]);

  const guides = [
    { title: "Getting Started", href: "/docs#getting-started" },
    { title: "Authentication", href: "/docs#authentication" },
    { title: "Deploying", href: "/docs#deploying" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Guides
      </h1>
      <ul className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {guides.map((g) => (
          <li key={g.title} className="p-4">
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href={g.href}
            >
              {g.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default GuidesPage;