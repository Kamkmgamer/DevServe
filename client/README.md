# DevServe Frontend

This directory contains the frontend application for DevServe, built with React and TypeScript. It provides the user interface for interacting with the DevServe platform.

## Features

*   **Responsive Design:** Adapts seamlessly to various screen sizes for a consistent user experience across devices.
*   **Engaging User Interface:** A modern and intuitive design with interactive elements and animations powered by Framer Motion.
*   **Modular Component Architecture:** Built with reusable React components for maintainability, scalability, and efficient development.
*   **Context-based State Management:** Utilizes React Context for efficient global state management, including authentication, shopping cart, and theme settings.
*   **Protected Routes:** Implements secure routing to ensure that certain parts of the application are only accessible to authenticated users.
*   **API Integration:** Seamlessly communicates with the DevServe backend API using Axios and React Query for data fetching and manipulation.

## Technologies Used

*   **React 19:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Vite:** A fast build tool that provides a lightning-fast development experience.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
*   **React Router DOM:** For declarative routing in React applications.
*   **Axios:** A promise-based HTTP client for making API requests.
*   **React Query (@tanstack/react-query):** For powerful asynchronous state management, caching, and synchronization.
*   **Framer Motion:** A library for production-ready animations.
*   **Zod & React Hook Form:** For robust form validation.
*   **JWT Decode:** For decoding JSON Web Tokens.
*   **React Hot Toast & React Toastify:** For notifications.
*   **Lucide React & React Icons:** For icons.
*   **Tiptap:** A headless editor framework for rich text editing.
*   **@paypal/react-paypal-js:** For PayPal integration.

## Installation and Setup

To get the frontend application up and running, follow these steps:

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)

### Steps

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

### Development Mode

To run the frontend in development mode with hot-reloading:

```bash
npm run dev
```

The application will typically be available at `http://localhost:5173`. It is configured to proxy API requests to the backend running on `http://localhost:8000`.

### Production Build

To create a production-ready build of the frontend:

```bash
npm run build
```

This command compiles the React application and outputs the static files to the `../server/public` directory. These files are then served by the backend application.

### Preview Production Build Locally

You can preview the production build locally using Vite's preview server:

```bash
npm run build
npm run preview
```

## Special Configurations and Dependencies

*   **API Proxying:** During development, API requests to `/api` are proxied to `http://localhost:8000` as configured in `vite.config.ts`. Ensure your backend server is running on this address.
*   **Environment Variables:** The `vite.config.ts` can utilize `NGROK_HOST` for HMR when using ngrok for public access.
*   **Tailwind CSS:** The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js` and `postcss.config.js`.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode.
*   `npm run build`: Builds the app for production to the `../server/public` folder.
*   `npm run lint`: Runs ESLint to check for code quality issues.
*   `npm run preview`: Serves the production build locally for preview.
*   `npm run test`: Runs the Jest tests.

## Contribution

For contribution guidelines, please refer to the main `README.md` in the project root.

## Troubleshooting

*   **"Cannot connect to API"**: Ensure the backend server is running and accessible at `http://localhost:8000`.
*   **Build issues**: Check the console output for TypeScript or ESLint errors.
*   **Dependency problems**: Try deleting `node_modules` and `package-lock.json` and running `npm install` again.
