// src/main.tsx (UPDATED)
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// IMPORTANT: Configure your PayPal client ID and other options here.
// Use environment variables for client IDs!
// Example for Vite: import.meta.env.VITE_PAYPAL_CLIENT_ID
// Example for Create React App: process.env.REACT_APP_PAYPAL_CLIENT_ID
const initialPayPalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "authorize", // Ensure this matches your createOrder intent
  // Add other options as needed, e.g., 'data-sdk-integration-source': 'integrationbuilder'
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <PayPalScriptProvider options={initialPayPalOptions}>
          <ErrorBoundary>
            <ThemeProvider>
              <AuthProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </AuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </PayPalScriptProvider>
      </BrowserRouter>
    </React.StrictMode>
);