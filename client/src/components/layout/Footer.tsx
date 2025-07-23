import { Github, Linkedin, Twitter } from "lucide-react";
import Container from "./Container";

const Footer = () => {
  const socialLinks = [
    { icon: <Twitter />, href: "https://x.com/kamkmgamer" },
    { icon: <Github />, href: "https://github.com/Kamkmgamer" },
    { icon: <Linkedin />, href: "https://www.linkedin.com/in/kamkm-gamer/" },
  ];

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-12">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} DevServe. All rights reserved.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 transition-colors"
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