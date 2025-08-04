import { useSEO } from "../utils/useSEO";

const RoadmapPage = () => {
  useSEO("Roadmap | DevServe", [
    {
      name: "description",
      content: "See what's coming next on the DevServe roadmap.",
    },
  ]);

  const items = [
    { title: "Public API beta", status: "In progress" },
    { title: "New billing portal", status: "Planned" },
    { title: "Templates marketplace", status: "Planned" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Roadmap
      </h1>
      <ul className="mt-6 space-y-4">
        {items.map((i) => (
          <li
            key={i.title}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800"
          >
            <span>{i.title}</span>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
              {i.status}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default RoadmapPage;