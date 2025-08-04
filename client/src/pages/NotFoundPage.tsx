import { Link } from "react-router-dom";
import { useSEO } from "../utils/useSEO";

const NotFoundPage = () => {
  useSEO("404 Not Found | DevServe", [{ name: "robots", content: "noindex" }]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
      <p className="text-sm font-medium text-blue-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Go home
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;