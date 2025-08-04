import { useSEO } from "../utils/useSEO";

const CareersPage = () => {
  useSEO("Careers | DevServe", [
    {
      name: "description",
      content:
        "Join DevServe. See open roles and help us build the future of developer tooling.",
    },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Careers
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        We’re not hiring right now, but we’d love to hear from you. Send your
        resume and a short note to careers@devserve.app.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Open Roles
        </h2>
        <ul className="mt-4 space-y-4">
          <li className="rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
            No open roles at the moment.
          </li>
        </ul>
      </section>
    </main>
  );
};

export default CareersPage;