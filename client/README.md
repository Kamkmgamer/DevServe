## Project Overview

For a comprehensive overview of the DevServe project, including features, technologies, and full setup instructions, please refer to the [main README.md](../README.md) in the project root.

## Client-Side Features

This client application provides the user interface for DevServe, built with React and TypeScript. Key features include:

-   **Responsive Design:** Adapts seamlessly to various screen sizes.
-   **Engaging User Interface:** Features a modern design with interactive elements and animations powered by Framer Motion.
-   **Modular Component Architecture:** Utilizes reusable components like `SectionWrapper` for consistent styling and efficient development.
-   **Context-based State Management:** Manages global state for authentication, cart, and theme using React Context.
-   **Protected Routes:** Ensures secure navigation with authenticated routes.

## Running the Client

To run the client application in development mode:

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies (if you haven't already):
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The client application will typically be available at `http://localhost:5173`.