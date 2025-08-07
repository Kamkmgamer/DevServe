import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Create an admin user
  const adminEmail = "khalil@khalil.excellence.sd";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set. Please set it and try again.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
    },
  });

  // 2. Add services
  const services = [
    {
      name: "Portfolio Website",
      description: "Showcase your work with a beautiful, modern portfolio site designed for creatives, agencies, and professionals.",
      price: 499,
      features: [
        "Responsive design for all devices",
        "Gallery and portfolio sections",
        "Contact form with email notifications",
        "SEO optimization for better visibility",
      ],
      category: "Web Design",
    },
    {
      name: "Landing Page",
      description: "A high-converting single-page site for marketing, lead generation, or product launches.",
      price: 299,
      features: [
        "One-page modern design",
        "Lead capture and signup forms",
        "Google Analytics integration",
        "Lightning-fast loading speed",
      ],
      category: "Web Design",
    },
    {
      name: "E-commerce Website",
      description: "A complete online store solution with secure payments and advanced inventory management.",
      price: 1499,
      features: [
        "Product catalog and filters",
        "Shopping cart and checkout",
        "Payment gateway integration",
        "Order and customer management",
        "Multi-vendor and dropshipping ready",
      ],
      category: "E-commerce",
    },
    {
      name: "Business/Corporate Website",
      description: "Professional websites for companies and organizations to build trust and showcase their services.",
      price: 899,
      features: [
        "Team and services pages",
        "Contact forms and maps",
        "News/blog section",
        "Custom branding and design",
      ],
      category: "Web Design",
    },
    {
      name: "Blog/Personal Website",
      description: "A platform to share articles, tutorials, or stories with an audience.",
      price: 399,
      features: [
        "Blog engine with categories",
        "Comments and moderation tools",
        "Social media sharing integration",
        "SEO optimized for writers",
      ],
      category: "Web Design",
    },
    {
      name: "Odoo Custom Development",
      description: "Tailored Odoo modules for HR, CRM, Accounting, and more to streamline your business operations.",
      price: 1999,
      features: [
        "Custom HR modules (training, attendance, payroll)",
        "CRM setup for lead management",
        "Inventory and warehouse management",
        "Third-party API integrations",
      ],
      category: "Odoo",
    },
    {
      name: "Website Maintenance & Optimization",
      description: "Keep your website running fast and secure with regular updates, backups, and optimizations.",
      price: 199,
      features: [
        "Bug fixes and security patches",
        "Speed and performance optimization",
        "Regular backups",
        "SEO audits and improvements",
      ],
      category: "Support",
    },
    {
      name: "AI Integration for Websites",
      description: "Add smart AI features like chatbots, analytics, and content personalization to your website.",
      price: 899,
      features: [
        "AI-powered chatbots for customer support",
        "Dynamic content recommendations",
        "Language translation using AI",
        "Data dashboards with AI analytics",
      ],
      category: "AI",
    },
    {
      name: "Tech Consultation & Digital Strategy",
      description: "Get expert advice on web technologies, platform choices, and scaling your online presence.",
      price: 99,
      features: [
        "1-hour strategy session",
        "Platform and CMS recommendations",
        "Hosting and domain setup advice",
        "Scalable tech stack planning",
      ],
      category: "Consulting",
    },
    {
      name: "UI/UX Design",
      description: "Beautiful and user-friendly designs crafted for an excellent user experience.",
      price: 499,
      features: [
        "Figma/Adobe XD design mockups",
        "Responsive and modern aesthetics",
        "Wireframes and prototypes",
        "Focus on usability and conversion",
      ],
      category: "Design",
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }

  console.log("✅ Seeded admin user and services!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
