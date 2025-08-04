import { useSEO } from "../utils/useSEO";

const AboutPage = () => {
  useSEO("About | DevServe", [
    {
      name: "description",
      content:
        "Learn about DevServe—our mission, values, and the team empowering developers.",
    },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        About DevServe
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        DevServe helps developers build, deploy, and scale faster. We believe in
        simple, powerful tools and great developer experience.
      </p>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Mission
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Streamline developer workflows with intuitive, reliable tooling.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Values
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            DX-first, transparency, accessibility, and sustainable growth.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Team
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            A small, focused group building tools we love to use ourselves.
          </p>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;