# DevServe Backend: Node.js, Express, and TypeScript

This directory contains the backend services for the DevServe e-commerce platform. It is built with Node.js, Express.js, and TypeScript, providing a robust and scalable API for the frontend application.

## Project Overview

For a comprehensive overview of the DevServe project, including overall features, technologies, and full setup instructions, please refer to the [main README.md](../../README.md) in the project root.

## Key Technologies

-   **Node.js:** Server-side JavaScript runtime.
-   **Express.js:** Minimalist web framework for Node.js.
-   **TypeScript:** Ensures type safety and clean code.
-   **Prisma ORM:** Type-safe database access with next-generation ORM features.
-   **PostgreSQL:** Robust open-source relational database.
-   **JSON Web Tokens (JWT):** Secure authentication tokens.
-   **Bcrypt.js:** Password hashing.
-   **Zod:** Data validation.
-   **Nodemailer:** For email sending.
-   **Stripe API:** Payment processing integration.

## Features

-   **User Authentication & Authorization:** Secure JWT-based authentication with role-based access control (e.g., admin roles).
-   **API Endpoints:** Provides RESTful APIs for managing services, portfolio items, blog posts, shopping cart, orders, and more.
-   **Database Management:** Utilizes Prisma ORM for efficient and type-safe interactions with a PostgreSQL database.
-   **Email Notifications:** Integration with Nodemailer for sending transactional emails.
-   **Payment Processing:** Handles secure payment transactions via Stripe.

## Running the Server

To run the server application in development mode:

1.  Ensure you have followed the [Database Setup](#database-setup) and [Prisma & Database Seeding](#prisma--database-seeding) steps in the [main README.md](../../README.md).
2.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
3.  Install dependencies (if you haven't already):
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The backend API will typically be available at `http://localhost:8000`.
