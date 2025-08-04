import { useSEO } from "../utils/useSEO";

const AuthenticationGuide = () => {
  useSEO("Authentication | DevServe", [
    {
      name: "description",
      content: "Understand how to securely authenticate with DevServe's API.",
    },
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Authentication
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        Learn how DevServe handles authentication and how to integrate it in your app.
      </p>

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Token-Based Auth
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Use access tokens to securely interact with the API.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Session Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Best practices for storing and refreshing tokens.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Protecting Routes
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            How to restrict frontend/backend routes with authentication middleware.
          </p>
        </div>
      </section>
    </main>
  );
};

export default AuthenticationGuide;
