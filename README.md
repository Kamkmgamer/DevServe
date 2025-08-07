
--------------------------------------------------

# DevServe: A Modern Web Services E-commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/Kamkmgamer/DevServe.git)

DevServe is a comprehensive, responsive e-commerce solution designed to showcase and sell web design and development services. Built with a monorepo architecture, it cleanly separates the React frontend from the Node.js backend, ensuring a scalable and maintainable platform for your business.

--------------------------------------------------

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Repository Setup](#repository-setup)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
  - [Installing Dependencies](#installing-dependencies)
  - [Prisma & Database Seeding](#prisma--database-seeding)
  - [Running Development Servers](#running-development-servers)
  - [Running Tests](#running-tests)
  - [Admin Access](#admin-access)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

--------------------------------------------------

## Features

- **Responsive Design:** Adapts seamlessly to desktop, tablet, and mobile screens.
- **Engaging Homepage:** Features a captivating hero section, service highlights, and clear calls-to-action.
- **Services Catalog:** Detailed pages for a variety of web service offerings.
- **Dynamic Portfolio:** Showcase completed projects with filtering options (note: public portfolio links externally).
- **Transparent Pricing:** Clearly outlined pricing tiers with comprehensive feature descriptions.
- **Shopping Cart:** Global cart functionality to add or remove services.
- **Contact Form:** Integrated with robust validation and email support (using Nodemailer).
- **Blog Section:** Articles, tutorials, and industry insights.
- **User Authentication (Admin):** Secure JWT-based login/logout for administrative access.
- **Admin Dashboard:** 
  - Overview of metrics (users, services, orders)
  - Full CRUD capabilities for Services, Portfolio Items, and Blog Posts.
- **Payment Gateway Integration:** Secure transactions with an initial Stripe setup.
- **SEO-Ready:** Optimized meta tags, Open Graph data, and efficient asset loading.
- **Enhanced Performance:** Lazy loading and optimized API calls for speed.
- **Dark/Light Mode:** User-controlled theme switching.
- **Modern Notifications:** Non-intrusive toast notifications for feedback.

--------------------------------------------------

## Technologies Used

### Frontend

- React.js – Building interactive UIs.
- TypeScript – Statically typed JavaScript for improved maintainability.
- Tailwind CSS (v3.4.4) – Rapid UI development with utility-first classes.
- Framer Motion – Declarative animations and transitions.
- React Router DOM – Seamless client-side routing.
- Axios – HTTP client for API requests.
- React Hook Form & Zod – Efficient form management and validation.
- Lucide React – Customizable SVG icons.
- React Hot Toast – Beautiful toast notifications.
- Vite – Fast modern tooling.

### Backend

- Node.js – Server-side JavaScript runtime.
- Express.js – Minimalist web framework for Node.js.
- TypeScript – Ensuring type safety and clean code.
- Prisma ORM – Type-safe database access with next-generation ORM features.
- PostgreSQL – Robust open-source relational database.
- JSON Web Tokens (JWT) – Secure authentication tokens.
- Bcrypt.js – Password hashing.
- Zod – Data validation.
- Nodemailer – For email sending (or external providers like SendGrid).
- Stripe API – Payment processing integration.

### Tools & Development

- Docker – Simplified containerized development (PostgreSQL).
- .env – Environment variable management.
- ESLint & Prettier – Code quality and formatting.
- Husky & Lint-staged – Git hooks to enforce code integrity.
- Jest & Supertest – Backend unit and integration testing.
- React Testing Library – Frontend component tests.

--------------------------------------------------

## Getting Started

Follow these steps to set up your development environment:

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/get-npm) (bundled with Node.js)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local PostgreSQL)
- [Git](https://git-scm.com/downloads)

### Repository Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Kamkmgamer/DevServe.git
   cd DevServe
   ```

   (Replace the URL with your repository if necessary.)

### Environment Setup

2. Create `.env` files in both the `client` and `server` directories.

   **For the server (.env):**
   ```env
   PORT=8000

   # Database Connection (Docker-based)
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase?schema=public"

   JWT_SECRET=YOUR_VERY_STRONG_JWT_SECRET_HERE  # Change this!

   # Admin password for seeding
   ADMIN_PASSWORD=YourSecurePasswordHere # Add a secure password here

   # Email Sending Configuration
   EMAIL_HOST=smtp.your-email-provider.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password

   # Stripe API Keys
   STRIPE_SECRET_KEY=sk_test_...   # Get from Stripe Dashboard
   ```

   **For the client (.env):**
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

   Remember to add these `.env` files to your `.gitignore`.

### Database Setup

3. Start the PostgreSQL container from the project root:

   ```bash
   docker-compose up -d
   ```

   This will set up a PostgreSQL database, typically accessible on `localhost:5432`.

### Installing Dependencies

4. Install dependencies across the monorepo:

   - From the root directory:
     ```bash
     npm install
     ```
   - For the client:
     ```bash
     cd client
     npm install
     ```
   - For the server:
     ```bash
     cd ../server
     npm install
     ```
   - Return to the root:
     ```bash
     cd ..
     ```

### Prisma & Database Seeding

5. Apply Prisma migrations and seed database:

   - Navigate to the server directory:
     ```bash
     cd server
     npx prisma migrate dev --name init
     npm run seed
     cd ..
     ```

### Running Development Servers

6. Start both the frontend and backend servers concurrently from the root:

   ```bash
   npm run dev
   ```

   - The frontend is available at: [http://localhost:5173](http://localhost:5173)
   - The backend API is available at: [http://localhost:8000](http://localhost:8000)

### Running Tests

7. To run tests:

   - For the client:
     ```bash
     cd client
     npm test
     cd ..
     ```
   - For the server:
     ```bash
     cd server
     npm test
     cd ..
     ```

### Admin Access

- Admin Login: [http://localhost:5173/login](http://localhost:5173/login)
- Default credentials (from `prisma/seed.ts`):
  - Email: `admin@example.com`
  - Password: `SuperSecret123` (Please change this immediately in production!)

--------------------------------------------------

## Project Structure

Below is a simplified view of the project structure:

```
DevServe/
├── client/                   # React + TypeScript + Tailwind CSS frontend
│   ├── public/
│   ├── src/
│   │   ├── api/              # Axios instance and API service calls
│   │   ├── assets/
│   │   ├── components/       # Reusable UI and layout components
│   │   │   ├── admin/        # Admin-specific components (AdminNavbar, AdminLayout)
│   │   │   ├── form/         # Shared form components (ContactForm)
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── contexts/         # Global state management (Auth, Cart, Theme)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Application pages
│   │   ├── App.tsx           # Main application routes
│   │   ├── main.tsx          # Application entry point with context providers
│   │   └── setupTests.ts     # Testing configuration
│   ├── .env
│   ├── package.json
│   └── vite.config.ts
├── server/                   # Node.js + Express + TypeScript backend
│   ├── prisma/               # Prisma schema, migrations, and seeding scripts
│   ├── src/
│   │   ├── api/              # API controllers for the endpoints
│   │   ├── middleware/       # Express middleware (authentication, etc.)
│   │   ├── lib/              # Prisma and Nodemailer configuration
│   │   ├── routes/           # Express route definitions
│   │   ├── app.ts            # Express app configuration
│   │   └── index.ts          # Server entry point
│   ├── .env
│   ├── package.json
│   └── jest.config.js
├── .env.example              # Sample environment variable file
├── .eslintrc.cjs             # ESLint configuration
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier configuration
├── docker-compose.yml        # Docker Compose file for PostgreSQL
├── package.json              # Monorepo scripts and overall config
└── README.md                 # Project documentation
```

--------------------------------------------------

## Deployment

DevServe is designed for hassle-free deployment:

- **Frontend:** Deploy on [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or similar services.
- **Backend:** Deploy via cloud platforms like [Render](https://render.com/), [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform), or AWS-based solutions.
- **Database:** Use managed PostgreSQL services like [Supabase](https://supabase.com/), [Aiven](https://aiven.io/), or [AWS RDS](https://aws.amazon.com/rds/postgresql/).

--------------------------------------------------

## Contributing

Contributions make DevServe even better! If you discover a bug or have ideas for enhancements, please open an issue or submit a pull request.

--------------------------------------------------

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

--------------------------------------------------

Happy coding with DevServe!