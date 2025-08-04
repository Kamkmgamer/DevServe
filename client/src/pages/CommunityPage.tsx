import { useSEO } from "../utils/useSEO";
import {
  Users,
  MessageSquareText,
  Github,
  Mail,
  Globe,
} from "lucide-react";

const CommunityPage = () => {
  useSEO("Community | DevServe", [
    {
      name: "description",
      content:
        "Join the DevServe community. Get help, contribute, and connect with developers around the world.",
    },
  ]);

  const links = [
    {
      title: "GitHub Discussions",
      description: "Ask questions, suggest features, or help others.",
      href: "https://github.com/Kamkmgamer/DevServe",
      icon: MessageSquareText,
    },
    {
      title: "GitHub Repository",
      description: "Explore the code, open issues, and contribute.",
      href: "https://github.com/Kamkmgamer/DevServe",
      icon: Github,
    },
    {
      title: "Developer Chat",
      description: "Join our community chat for real-time support.",
      href: "https://t.me/devserves", // Update if different
      icon: Users,
    },
    {
      title: "Official Website",
      description: "Visit the official DevServe landing page.",
      href: "https://devserves.app", // Update if different
      icon: Globe,
    },
    {
      title: "Contact Support",
      description: "Need help? Reach out via email.",
      href: "mailto:support@devserve.app",
      icon: Mail,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Join the DevServe Community
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Connect with developers, ask questions, contribute to the project, and stay updated.
        </p>
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {links.map(({ title, description, href, icon: Icon }) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-slate-800"
          >
            <Icon className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:underline">
                {title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
};

export default CommunityPage;
