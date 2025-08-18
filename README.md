# DevServe: A Modern Web Services E-commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/Kamkmgamer/DevServe.git)

DevServe is a comprehensive, responsive e-commerce solution designed to showcase and sell web design and development services. Built with a monorepo architecture, it cleanly separates the React frontend from the Node.js backend, ensuring a scalable and maintainable platform for your business.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Repository Setup](#repository-setup)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
  - [Installing Dependencies](#installing-dependencies)
  - [Running Development Servers](#running-development-servers)
  - [Running Tests](#running-tests)
  - [Admin Access](#admin-access)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)
- [Credits](#credits)

## Features

DevServe offers a rich set of features for both users and administrators:

### Frontend Features

*   **Responsive Design:** Adapts seamlessly to desktop, tablet, and mobile screens.
*   **Engaging User Interface:** Modern design with interactive elements and animations (Framer Motion).
*   **Modular Component Architecture:** Reusable React components for maintainability.
*   **Context-based State Management:** Efficient global state management for authentication, cart, and theme.
*   **Protected Routes:** Secure navigation for authenticated users.
*   **API Integration:** Seamless communication with the backend using Axios and React Query.
*   **Dynamic Content:** Services Catalog, Portfolio, and Blog sections with detailed pages.
*   **Shopping Cart:** Global cart functionality to add or remove services.
*   **User-Friendly Forms:** Contact form with robust validation.
*   **SEO-Ready:** Optimized meta tags and efficient asset loading.
*   **Enhanced Performance:** Lazy loading and optimized API calls.
*   **Dark/Light Mode:** User-controlled theme switching.
*   **Modern Notifications:** Non-intrusive toast notifications.
*   **AI Chatbot:** Integrated GPT OSS 20B powered chatbot with floating action button.
*   **Real-time Chat Interface:** Beautiful chat UI with message history and timestamps.

### Backend Features

*   **User Authentication & Authorization:** Secure JWT-based authentication with role-based access control (User, Admin, SuperAdmin).
*   **Comprehensive API Endpoints:** RESTful APIs for user management, services, portfolio, blog, shopping cart, orders, payments, and referral system.
*   **Database Management:** Prisma ORM for type-safe interactions with PostgreSQL/SQLite, including migrations and seeding.
*   **Email Notifications:** Integration with Nodemailer for transactional emails.
*   **Payment Processing:** Secure transactions via Stripe and PayPal.
*   **Referral System:** Logic for managing user referrals and calculating commissions.
*   **Admin Dashboard:** Full CRUD capabilities for Services, Portfolio Items, and Blog Posts, with enhanced role management.
*   **Logging & Error Handling:** Centralized logging and global error handling.
*   **Rate Limiting:** Protects against abuse and ensures API stability.
*   **AI Integration:** OpenRouter API integration for GPT OSS 20B chatbot functionality.
*   **Chatbot API:** RESTful endpoints for chat completions and AI tips.

## Technology Stack

### Frontend

*   **React 19:** JavaScript library for building user interfaces.
*   **TypeScript:** Typed superset of JavaScript.
*   **Vite:** Fast build tool.
*   **Tailwind CSS:** Utility-first CSS framework.
*   **React Router DOM:** Declarative routing.
*   **Axios:** HTTP client.
*   **React Query (@tanstack/react-query):** Asynchronous state management.
*   **Framer Motion:** Production-ready animations.
*   **Zod & React Hook Form:** Form validation.
*   **JWT Decode:** Decoding JSON Web Tokens.
*   **React Hot Toast & React Toastify:** Notifications.
*   **Lucide React & React Icons:** Icons.
*   **Tiptap:** Headless editor framework.
*   **@paypal/react-paypal-js:** PayPal integration.

### Backend

*   **Node.js:** Server-side JavaScript runtime.
*   **Express.js:** Minimalist web framework.
*   **TypeScript:** Type safety and clean code.
*   **Prisma ORM:** Type-safe database access.
*   **PostgreSQL:** Robust relational database (recommended for production).
*   **SQLite:** File-based database (default for development).
*   **JSON Web Tokens (JWT):** Secure authentication.
*   **Bcrypt.js:** Password hashing.
*   **Zod:** Data validation.
*   **Nodemailer:** Email sending.
*   **Stripe & PayPal SDKs:** Payment gateway integration.
*   **Winston:** Logging library.
*   **CORS:** Cross-Origin Resource Sharing.
*   **OpenAI SDK:** For OpenRouter API integration (GPT OSS 20B chatbot).

### Tools & Development

*   **Docker:** Containerized development (for PostgreSQL).
*   **.env:** Environment variable management.
*   **ESLint & Prettier:** Code quality and formatting.
*   **Husky & Lint-staged:** Git hooks.
*   **Jest & Supertest:** Backend testing.
*   **React Testing Library:** Frontend component tests.
*   **Nodemon:** For hot-reloading during development.
*   **Concurrently:** For running multiple commands concurrently.

## Getting Started

Follow these steps to set up your development environment:

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS recommended)
*   [npm](https://www.npmjs.com/get-npm) (bundled with Node.js)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local PostgreSQL)
*   [Git](https://git-scm.com/downloads)

### Repository Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Kamkmgamer/DevServe.git
    cd DevServe
    ```
    (Replace the URL with your repository if necessary.)

### Environment Setup

2.  **Create `.env` files:**
    Create `.env` files in both the `client` and `server` directories.

    **For the `server` (`server/.env`):**
    ```env
    PORT=8000

    # Database Connection (Docker-based)
    # Use environment variables or Docker secrets for credentials.
    # Example (local):
    # DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/<DB_NAME>?schema=public"
    DATABASE_URL=

    JWT_SECRET=YOUR_VERY_STRONG_JWT_SECRET_HERE  # Change this!

    # Admin password for seeding (do NOT commit real secrets)
    ADMIN_PASSWORD=

    # Email Sending Configuration (Example with Mailtrap or similar)
    EMAIL_HOST=smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_USER=your_mailtrap_username
    EMAIL_PASS=your_mailtrap_password

    # Stripe API Keys
    STRIPE_SECRET_KEY=sk_test_...   # Get from Stripe Dashboard
    STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe Dashboard

    # PayPal API Keys
    PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
    PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_CLIENT_SECRET
    PAYPAL_ENVIRONMENT=sandbox # or live

    # OpenRouter API Configuration (for AI Chatbot)
    OPENROUTER_API_KEY=your_openrouter_api_key_here # Get from https://openrouter.ai/keys
    SITE_URL=http://localhost:5173  # Frontend URL
    SITE_NAME=DevServe  # Your application name
    ```

    **For the `client` (`client/.env`):**
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    # If using ngrok for HMR, uncomment and set:
    # NGROK_HOST=your-ngrok-url.ngrok-free.app
    ```

    Remember to add these `.env` files to your `.gitignore`.

### Database Setup

3.  **Start the PostgreSQL container:**
    From the project root, start the database using Docker Compose:
    ```bash
    docker-compose up -d
    ```
    This will set up a PostgreSQL database, typically accessible on `localhost:5432`. If you encounter issues, ensure Docker Desktop is running.

4.  **Apply Prisma migrations and seed database:**
    Navigate to the `server` directory, apply migrations, and seed the database:
    ```bash
    cd server
    npx prisma migrate dev --name init
    npm run seed
    cd ..
    ```

### Installing Dependencies

5.  **Install dependencies across the monorepo:**
    From the root directory, run:
    ```bash
    npm install
    ```
    This will install dependencies for the root, client, and server.

## Running the Project

### Development Mode

To start both the frontend and backend servers concurrently in development mode:

```bash
npm run dev
```

*   The frontend will be available at: [http://localhost:5173](http://localhost:5173)
*   The backend API will be available at: [http://localhost:8000](http://localhost:8000)

### Production Build and Run

To build and run the entire project for production:

1.  **Build the frontend:**
    ```bash
    cd client
    npm run build
    cd ..
    ```
    This compiles the React app into static files in `server/public`.

2.  **Build the backend:**
    ```bash
    cd server
    npm run build
    cd ..
    ```
    This compiles the TypeScript backend into JavaScript in `server/dist`.

3.  **Start the backend server:**
    ```bash
    cd server
    npm run start
    cd ..
    ```
    The backend will serve the frontend static files and its own API.

4.  **Ensure database is running:**
    If not already running, start your PostgreSQL container:
    ```bash
    docker-compose up -d
    ```

## Running Tests

To run tests for individual parts of the application:

*   **For the client:**
    ```bash
    cd client
    npm test
    cd ..
    ```
*   **For the server:**
    ```bash
    cd server
    npm test
    cd ..
    ```

## Admin Access

*   **Admin Login:** [http://localhost:5173/login](http://localhost:5173/login)
*   **Default credentials (from `prisma/seed.ts`):** Refer to `server/prisma/seed.ts` for default admin credentials. **Please change these immediately in production!**

## Project Structure

```
DevServe/
├── client/                   # React + TypeScript + Tailwind CSS frontend
│   ├── src/
│   │   ├── api/              # Axios instance and API service calls
│   │   ├── assets/
│   │   ├── components/       # Reusable UI and layout components
│   │   │   ├── admin/        # Admin-specific components (AdminNavbar, AdminLayout)
│   │   │   ├── chatbot/      # AI Chatbot components (Chatbot, ChatbotFAB)
│   │   │   ├── form/         # Shared form components (ContactForm)
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── contexts/         # Global state management (Auth, Cart, Theme)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Application pages
│   │   ├── App.tsx           # Main application routes
│   │   └── main.tsx          # Application entry point
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

## Deployment

DevServe is designed for flexible deployment:

*   **Frontend:** Can be deployed as static assets on platforms like [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or served directly by the backend.
*   **Backend:** Deployable on cloud platforms such as [Render](https://render.com/), [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform), or AWS-based solutions (e.g., EC2, Elastic Beanstalk).
*   **Database:** Utilize managed PostgreSQL services like [Supabase](https://supabase.com/), [Aiven](https://aiven.io/), or [AWS RDS](https://aws.amazon.com/rds/postgresql/).

### Backend (Docker)

The backend includes a production-ready Dockerfile at `server/Dockerfile`.

1. Build the image:
   ```bash
   docker build -t devserve-backend:latest ./server
   ```
2. Run the container (example with env file):
   ```bash
   docker run -p 8000:8000 --env-file ./server/.env \
     -e NODE_ENV=production \
     devserve-backend:latest
   ```
3. With Docker Compose Postgres:
   - Use `docker-compose.yml` for Postgres. Provide `POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB` via environment or Docker secrets. A sample secret path is `./monitoring/secrets/postgres_password` referenced as `postgres_password`.
   - Set `DATABASE_URL` in the backend environment to point to the running Postgres (e.g., `postgresql://user:pass@host:5432/db`).

### Backend Production Deployment

This repository ships with a GitHub Actions job that builds and publishes the backend image to GitHub Container Registry (GHCR). On push to `main`/`master`, the job tags and pushes the image, and can optionally trigger a downstream deploy webhook.

Steps to use in production:

1. Configure GitHub Secrets for CI/CD:
   - `GHCR` login uses the built-in `GITHUB_TOKEN` (already configured in the workflow).
   - Optional: set `DEPLOY_WEBHOOK_URL` to notify your deployment platform after image push.

2. Image naming and tags:
   - Image is published as `ghcr.io/<owner>/<repo>/server` with tags `latest`, date-run (e.g., `YYYYMMDD-<run_number>`), and `sha`.

3. Run the container in your platform (Kubernetes, ECS, Render, DO App Platform, etc.):
   - Provide environment variables (see `.env.example`). At minimum:
     - `NODE_ENV=production`
     - `PORT=8000`
     - `DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require` (managed DBs often require SSL)
     - JWT config (prefer RS256: `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEYS`)
     - `SITE_URL` and `CLIENT_URL`
   - Expose port 8000 via your load balancer/ingress.

4. Database migrations at runtime:
   - The container is expected to run `npx prisma migrate deploy` before starting the app (see CI and Dockerfile/entrypoint guidance). Ensure your platform runs migrations during deploys or add a preStart hook.

5. Health checks:
   - HTTP GET `/` returns `{ status: "ok" }`.
   - Metrics at `/metrics` (Prometheus format).

6. CORS and Cookies:
   - Set allowed origins via `CORS_ORIGINS` (comma-separated) and ensure TLS in production.
   - Cookies are `httpOnly`, `Secure`, `SameSite=strict` by default in production. Your domain must serve HTTPS.

7. Rollback strategy:
   - Use the `sha` tag to pin/rollback deployments via your orchestrator if needed.

Security notes:
* Do not hardcode secrets in Compose files or code. Prefer environment variables or Docker secrets.
* In production, use RS256 JWT with key rotation (`JWT_PUBLIC_KEYS`).

## Contribution Guidelines

We welcome contributions to DevServe! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes, ensuring they adhere to the project's coding style (ESLint and Prettier are configured).
4.  Write tests for your changes if applicable.
5.  Ensure all existing tests pass.
6.  Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

## Credits

Developed by KAMKM

---

Happy coding with DevServe!