import { useSEO } from "../utils/useSEO";

const ApiPage = () => {
  useSEO("API | DevServe", [
    {
      name: "description",
      content: "API reference for DevServe endpoints and payloads.",
    },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        API Reference
      </h1>

      <section className="mt-6 space-y-6">
        <div className="rounded-lg border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="font-semibold">Auth</h2>
          <pre className="mt-2 overflow-auto rounded bg-slate-900 p-4 text-xs text-slate-200">
            {`POST /api/auth/login
Body: { email: string, password: string }`}
          </pre>
        </div>

        <div className="rounded-lg border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="font-semibold">Services</h2>
          <pre className="mt-2 overflow-auto rounded bg-slate-900 p-4 text-xs text-slate-200">
            {`GET /api/services
GET /api/services/:id`}
          </pre>
        </div>
      </section>
    </main>
  );
};

export default ApiPage;