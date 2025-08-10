# DevServe Backend

This directory contains the backend services for the DevServe e-commerce platform. It is built with Node.js, Express.js, and TypeScript, providing a robust and scalable API for the frontend application and handling business logic, data storage, and external integrations.

## Features

*   **User Authentication & Authorization:** Secure JWT-based authentication with role-based access control (User, Admin, SuperAdmin roles). Includes features for user registration, login, password reset, and profile management.
*   **Comprehensive API Endpoints:** Provides RESTful APIs for managing:
    *   **User Management:** CRUD operations for users.
    *   **Product/Service Catalog:** Management of services offered.
    *   **Portfolio:** Display and management of portfolio items.
    *   **Blog:** Creation and management of blog posts.
    *   **Shopping Cart:** Functionality for adding, updating, and removing items from a user's cart.
    *   **Order Management:** Processing and tracking of user orders.
    *   **Payment Processing:** Integration with Stripe and PayPal for secure online payments.
    *   **Referral System:** Logic for managing user referrals and calculating commissions.
    *   **Admin Panel:** Dedicated endpoints for administrative tasks.
    *   **AI Chatbot:** GPT OSS 20B powered chatbot API endpoints for intelligent conversational AI.
*   **Database Management:** Utilizes Prisma ORM for efficient, type-safe, and robust interactions with the database. Supports migrations and seeding.
*   **Email Notifications:** Integration with Nodemailer for sending transactional emails (e.g., order confirmations, password resets).
*   **Logging & Error Handling:** Centralized logging with Winston and a global error handling middleware for robust API responses.
*   **Rate Limiting:** Implements rate limiting to protect against abuse and ensure API stability.
*   **AI Integration:** OpenRouter API integration for GPT OSS 20B chatbot functionality with conversation context management.

## Technologies Used

*   **Node.js:** Server-side JavaScript runtime.
*   **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **Prisma ORM:** Next-generation ORM for Node.js and TypeScript, providing type-safe database access.
*   **PostgreSQL (Recommended for Production):** A powerful, open-source object-relational database system.
*   **SQLite (Default for Development):** A file-based, self-contained, high-reliability, full-featured, public-domain, SQL database engine.
*   **JSON Web Tokens (JWT):** For secure, stateless authentication.
*   **Bcrypt.js:** For securely hashing user passwords.
*   **Zod:** TypeScript-first schema declaration and validation library.
*   **Nodemailer:** Module for Node.js applications to allow easy email sending.
*   **Stripe & PayPal SDKs:** For integrating payment gateways.
*   **Winston:** A versatile logging library.
*   **CORS:** Middleware for enabling Cross-Origin Resource Sharing.
*   **OpenAI SDK:** For OpenRouter API integration to power the GPT OSS 20B chatbot.

## Installation and Setup

To get the backend application up and running, follow these steps:

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   A running database instance (SQLite for development, PostgreSQL for production).

### Steps

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the `server` directory based on `.env.example` (if available, otherwise create one with necessary variables like `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `OPENROUTER_API_KEY`, etc.).
    
    **Important:** For the AI chatbot to work, you must add your OpenRouter API key:
    ```env
    OPENROUTER_API_KEY=your_actual_api_key_here  # Get from https://openrouter.ai/keys
    ```

4.  **Database Setup (Prisma):**
    *   **Generate Prisma Client:**
        ```bash
        npx prisma generate
        ```
    *   **Run Migrations:** Apply any pending database migrations.
        ```bash
        npx prisma migrate dev --name init
        ```
        (Replace `init` with a meaningful name if you have existing migrations).
    *   **Seed the Database (Optional):** Populate your database with initial data (e.g., admin user, sample services).
        ```bash
        npm run seed
        ```

## Running the Application

### Development Mode

To run the backend in development mode with hot-reloading:

```bash
npm run dev
```

The backend API will typically be available at `http://localhost:8000`.

### Production Build

To compile the TypeScript code to JavaScript:

```bash
npm run build
```

This command outputs the compiled JavaScript files to the `dist` directory.

### Running in Production

After building, you can start the production server:

```bash
npm run start
```

## Special Configurations and Dependencies

*   **Environment Variables:** All sensitive information and configuration parameters (database URLs, API keys, secrets) are loaded from the `.env` file.
*   **CORS:** Configured in `src/app.ts` to allow requests from the frontend application's origin (`http://localhost:5173`, `http://192.168.0.100:5173`, and ngrok domains).
*   **Database:** The `prisma/schema.prisma` defines the database schema. Ensure your `DATABASE_URL` in `.env` points to the correct database.

## Available Scripts

In the `server` directory, you can run:

*   `npm run dev`: Starts the server in development mode with `nodemon` for hot-reloading.
*   `npm run build`: Compiles the TypeScript source code to JavaScript.
*   `npm run start`: Starts the compiled JavaScript application (for production).
*   `npm run test`: Runs the Jest tests for the backend.
*   `npm run seed`: Executes the Prisma seed script to populate the database.

## Contribution

For contribution guidelines, please refer to the main `README.md` in the project root.

## Troubleshooting

*   **"Port 8000 already in use"**: Another process is using the port. Find and terminate it, or change the port in `src/index.ts` (and update frontend proxy).
*   **Database connection issues**: Double-check your `DATABASE_URL` in the `.env` file and ensure your database server is running and accessible.
*   **Prisma errors**: Ensure you have run `npx prisma generate` and `npx prisma migrate dev` after any schema changes.
*   **Authentication errors**: Verify `JWT_SECRET` is set and consistent if running multiple instances.