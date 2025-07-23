# DevServe: Modern Web Services E-commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/your-username/your-repo-name/actions) <!-- Replace with your actual build status link -->

A comprehensive and responsive e-commerce platform built to showcase and sell web design and development services. This monorepo architecture provides a clean separation between the React frontend and Node.js backend, offering a scalable and maintainable solution for your business.

## ✨ Features

-   **Responsive Design:** Optimized for desktop, tablet, and mobile devices.
-   **Homepage:** Engaging hero section, service highlights, and clear calls-to-action.
-   **Services Catalog:** Browse various web service types, each with detailed pages.
-   **Dynamic Portfolio:** Showcase completed projects with filtering options (though the public portfolio links to an external site).
-   **Transparent Pricing:** Clear pricing tiers with detailed feature lists and calls-to-action.
-   **Shopping Cart:** Add/remove services from a global shopping cart.
-   **Contact Form:** Integrated with validation and email sending (Nodemailer setup).
-   **Blog Section:** For articles, tutorials, and industry insights.
-   **User Authentication (Admin):** Secure login/logout for administrative access via JWT.
-   **Admin Dashboard:**
    -   Overview of key metrics (users, services, orders).
    -   **Full CRUD (Create, Read, Update, Delete) for Services.**
    -   **Full CRUD for Portfolio Items.**
    -   **Full CRUD for Blog Posts.**
-   **Payment Gateway Integration:** Initial setup with Stripe for secure transactions.
-   **SEO-Ready Structure:** Meta tags, Open Graph data, and optimized asset loading.
-   **Fast Performance:** Lazy loading, optimized assets, and efficient API calls.
-   **Dark/Light Mode Toggle:** User-friendly theme switching.
-   **Modern Toasts:** Non-blocking notifications for user feedback.

## 🚀 Technologies Used

This project is built with a modern and robust tech stack.

**Frontend:**
-   **React.js**: A JavaScript library for building user interfaces.
-   **TypeScript**: Statically typed superset of JavaScript.
-   **Tailwind CSS (v3.4.4)**: Utility-first CSS framework for rapid UI development.
-   **Framer Motion**: For declarative animations and transitions.
-   **React Router DOM**: Declarative routing for React.
-   **Axios**: Promise-based HTTP client for API requests.
-   **React Hook Form & Zod**: For efficient form management and schema-based validation.
-   **Lucide React**: Customizable and beautiful SVG icons.
-   **React Hot Toast**: Beautiful and accessible toast notifications.

**Backend:**
-   **Node.js**: JavaScript runtime for server-side logic.
-   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
-   **TypeScript**: For type safety and better code maintainability.
-   **Prisma ORM**: Next-generation ORM for Node.js & TypeScript, providing type-safe database access.
-   **PostgreSQL**: Powerful, open-source relational database.
-   **JSON Web Tokens (JWT)**: For secure authentication.
-   **Bcrypt.js**: For password hashing.
-   **Zod**: For backend data validation.
-   **Nodemailer**: For email sending (or external services like SendGrid).
-   **Stripe API**: For payment processing (initial integration).

**Tools & Development:**
-   **Docker**: For containerized local development environment (PostgreSQL).
-   **.env**: For managing environment variables.
-   **ESLint & Prettier**: For code linting and formatting.
-   **Husky & Lint-staged**: For Git hooks to enforce code quality.
-   **Jest & Supertest**: For backend unit and integration testing.
-   **React Testing Library**: For frontend component testing.
-   **Vite**: Fast frontend tooling.

## 🛠️ Getting Started

Follow these steps to get your development environment up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local PostgreSQL database)
-   [Git](https://git-scm.com/downloads)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd web-services-ecommerce
```
**Note:** Replace `your-username/your-repo-name` with your actual GitHub repository URL.

### 2. Environment Variables

Create `.env` files in both the `client` and `server` directories.

**`server/.env`:**
```env
PORT=8000

# Database Connection (for Docker local setup)
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase?schema=public"
# You might use DB_HOST, DB_PORT etc. directly in your Prisma connection string

JWT_SECRET=YOUR_VERY_STRONG_JWT_SECRET_HERE # Change this!

# For email sending (Nodemailer, for example)
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # Get from Stripe Dashboard
```

**`client/.env`:**
```env
VITE_API_BASE_URL=http://localhost:8000
```
Remember to add these `.env` files to your `.gitignore`!

### 3. Database Setup (PostgreSQL with Docker)

From the project root directory, start the PostgreSQL container:

```bash
docker-compose up -d
```
This will start a PostgreSQL database accessible on `localhost:5432`.

### 4. Install Dependencies

Install dependencies for the root, frontend, and backend.

```bash
# From project root
npm install

# Navigate to client and install
cd client
npm install

# Navigate to server and install
cd ../server
npm install

# Navigate back to root
cd ..
```

### 5. Initialize Prisma and Seed Database

Run Prisma migrations and seed initial data (admin user, services, etc.).

```bash
# From server directory
cd server
npx prisma migrate dev --name init # Creates tables based on schema
npm run seed # Seeds initial data (including admin user and services)
cd .. # Go back to root
```

### 6. Run Development Servers

From the project root directory, start both the frontend and backend development servers concurrently:

```bash
npm run dev
```

-   **Frontend:** Accessible at `http://localhost:5173`
-   **Backend API:** Accessible at `http://localhost:8000`

### 7. Run Tests

To run tests for the client and server:

```bash
# From client directory
cd client
npm test
cd ..

# From server directory
cd server
npm test
cd ..
```

### Admin Access

-   **Admin Login Page:** `http://localhost:5173/login`
-   **Default Admin Credentials (from `prisma/seed.ts`):**
    -   **Email:** `admin@example.com`
    -   **Password:** `SuperSecret123` (Change this immediately in production!)

## 📁 Project Structure
web-services-ecommerce/
├── client/                 # React + TypeScript + Tailwind Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/            # Axios instance, API service calls
│   │   ├── assets/
│   │   ├── components/     # Reusable UI (Button, Card) & Layout (Navbar, Footer)
│   │   │   ├── admin/      # Admin-specific components (AdminNavbar, AdminLayout)
│   │   │   └── form/       # Shared form components (ContactForm)
│   │   │   └── layout/
│   │   │   └── ui/
│   │   ├── contexts/       # React Context API for global state (Auth, Cart, Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Main application pages
│   │   ├── App.tsx         # Main application routes
│   │   ├── main.tsx        # React entry point, context providers
│   │   └── setupTests.ts   # Jest/React Testing Library setup
│   ├── .env
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # Node.js + Express + TypeScript Backend
│   ├── prisma/             # Prisma schema and migrations
│   │   ├── migrations/
│   │   └── seed.ts         # Database seeding script
│   ├── src/
│   │   ├── api/            # Controller logic for API endpoints
│   │   ├── middleware/     # Custom Express middleware (e.g., authentication)
│   │   ├── lib/            # Prisma client, Nodemailer client
│   │   ├── routes/         # Express route definitions
│   │   ├── app.ts          # Express app configuration
│   │   ├── index.ts        # Server entry point (starts Express app)
│   │   └── utils/          # Utility functions
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── .env.example            # Example for environment variables
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier configuration
├── docker-compose.yml      # Docker Compose for local database
├── package.json            # Root package.json for monorepo scripts
└── README.md

## 🌐 Deployment

The application is structured for easy deployment:

-   **Frontend:** Can be deployed to services like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
-   **Backend:** Can be deployed to cloud platforms like [Render](https://render.com/), [DigitalOcean](https://www.digitalocean.com/products/app-platform), or [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/).
-   **Database:** Use a managed PostgreSQL service (e.g., [Supabase](https://supabase.com/), [Aiven](https://aiven.io/), [AWS RDS](https://aws.amazon.com/rds/postgresql/)).

## 👋 Contributing

Contributions are welcome! If you find a bug or have an idea for an improvement, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.