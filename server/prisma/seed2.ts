import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Create an admin user
  const adminEmail = "khalil@khalil.excellence.sd";
  const adminPassword = "SuperSecret123"; // Change this in production!
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

  // 2. Seed blog posts
  const blogPosts = [
    {
      title: "Why TypeScript Is Taking Over JavaScript Projects",
      summary:
        "Explore why TypeScript has become a top choice for developers, replacing vanilla JavaScript in many applications.",
      content: `
# Why TypeScript Is Taking Over JavaScript Projects

Over the last few years, TypeScript has transitioned from a niche tool to a mainstream essential in web development. Major frameworks and libraries now offer TypeScript support out of the box, and it’s becoming the default for many new projects.

## 1. Static Typing Saves Time

One of the primary advantages of TypeScript is its static typing. Developers can catch bugs at compile-time rather than at runtime, which results in more robust and maintainable codebases.

## 2. Better Developer Experience

With rich autocompletion, improved IntelliSense, and inline documentation, TypeScript significantly enhances the developer experience.

## Conclusion

Whether you're building a small project or a large-scale application, TypeScript provides tools and guardrails that help maintain quality and speed.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/typescript/600/400",
    },
    {
      title: "How to Choose the Right Web Framework",
      summary:
        "Learn how to evaluate frameworks like React, Vue, Angular, and Svelte for your project.",
      content: `
# How to Choose the Right Web Framework

Selecting the right front-end framework can impact your productivity and scalability. React offers flexibility, Vue provides simplicity, Angular gives structure, and Svelte introduces a compiler-based approach.

## Key Factors

- Community support
- Learning curve
- Performance
- Ecosystem and tooling

Choose based on your team size, project scope, and long-term goals.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/frameworks/600/400",
    },
    {
      title: "Design Systems: Why Every Brand Needs One",
      summary:
        "Understand the value of a design system and how it can ensure visual consistency across your product.",
      content: `
# Design Systems: Why Every Brand Needs One

A design system is more than a style guide. It's a collection of reusable components, guidelines, and design principles that drive consistency across your digital platforms.

## Benefits

- Faster development
- Consistent UI/UX
- Easier onboarding

Brands that invest in design systems save time and improve their product quality.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/design/600/400",
    },
    {
      title: "SEO Tips for Developers: Boost Your Web Traffic",
      summary:
        "Simple but effective SEO practices developers can implement without relying on marketers.",
      content: `
# SEO Tips for Developers

Even the best-built site fails without visibility. Developers can boost SEO by optimizing performance, using semantic HTML, and setting up metadata correctly.

## Quick Wins

- Use proper heading hierarchy
- Optimize images and lazy-load them
- Write clean URLs and alt text

Being SEO-conscious is a dev superpower.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/seo/600/400",
    },
    {
      title: "Top 5 Mistakes in Freelance Web Development",
      summary:
        "Avoid these common traps to thrive as a freelance web developer.",
      content: `
# Top 5 Mistakes in Freelance Web Development

Freelancing offers freedom—but it comes with responsibility. Many developers make these common mistakes early in their careers.

## Common Mistakes

1. Undercharging for projects
2. Ignoring contracts
3. Poor communication
4. Overpromising and underdelivering
5. Not backing up work

Recognize and fix these habits to grow a sustainable freelance career.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/freelance/600/400",
    },
    {
      title: "The Power of UI Animation in Web Design",
      summary:
        "UI animations can elevate the user experience—learn how to use them responsibly.",
      content: `
# The Power of UI Animation

Micro-interactions and subtle transitions improve usability and delight users. Framer Motion, GSAP, and CSS keyframes make animations simple to implement.

## Tips

- Avoid overusing animations
- Make them purpose-driven
- Ensure accessibility

Good animation guides the user, not distracts them.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/animation/600/400",
    },
    {
      title: "Odoo for Small Businesses: A Complete Guide",
      summary:
        "Odoo isn’t just for enterprises. Here’s how small businesses can leverage its power.",
      content: `
# Odoo for Small Businesses

Odoo offers modules for inventory, HR, sales, accounting, and more—all under one platform.

## Benefits

- Affordable and modular
- Easy to scale
- Community and commercial support

This open-source ERP can streamline operations for businesses of all sizes.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/odoo/600/400",
    },
    {
      title: "From Figma to Webflow: A Designer’s Workflow",
      summary:
        "Turn static designs into fully functional websites with this Figma to Webflow pipeline.",
      content: `
# From Figma to Webflow

Designing in Figma is just the first step. Translating it into a clean, responsive Webflow build is where the magic happens.

## Process

1. Structure your layers well in Figma
2. Use auto layout and consistent naming
3. Rebuild components using Webflow CMS and styles

This workflow ensures design accuracy and development speed.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/figma/600/400",
    },
    {
      title: "What Is JAMstack and Why It Matters",
      summary:
        "Learn how JAMstack architecture is revolutionizing modern web development.",
      content: `
# What Is JAMstack?

JAMstack stands for JavaScript, APIs, and Markup. It decouples the frontend from the backend, enabling faster, more secure websites.

## Advantages

- Speed and performance
- Better scalability
- Improved security

Tools like Netlify, Vercel, and Sanity.io are pushing JAMstack adoption across the industry.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/jamstack/600/400",
    },
    {
      title: "Building Accessible Websites: Where to Start",
      summary:
        "A quick guide for developers and designers to improve accessibility on the web.",
      content: `
# Building Accessible Websites

Accessibility ensures your site is usable by everyone, including people with disabilities. Follow WCAG standards and test thoroughly.

## Key Steps

- Use semantic HTML
- Ensure color contrast
- Add ARIA roles where necessary
- Test with keyboard and screen readers

Inclusive design is not optional—it’s essential.
      `.trim(),
      thumbnailUrl: "https://picsum.photos/seed/a11y/600/400",
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { title: post.title },
      update: {},
      create: post,
    });
  }

  console.log("✅ Seeded admin user and blog posts!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });