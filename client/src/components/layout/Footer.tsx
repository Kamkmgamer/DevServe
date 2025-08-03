import { Github, Linkedin, Twitter } from "lucide-react";
import Container from "./Container";

const Footer = () => {
  const socialLinks = [
    { icon: <Twitter />, href: "https://x.com/kamkmgamer" },
    { icon: <Github />, href: "https://github.com/Kamkmgamer" },
    { icon: <Linkedin />, href: "https://www.linkedin.com/in/kamkm-gamer/" },
  ];

  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <Container className="py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} DevServe. All rights reserved.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;