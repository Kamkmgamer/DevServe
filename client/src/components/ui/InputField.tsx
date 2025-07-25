// src/components/ui/InputField.tsx
import React, { ForwardedRef } from "react";
import { FieldError } from "react-hook-form";

// Define the props for our component
interface InputFieldProps
  extends React.InputHTMLAttributes<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > {
  label: string;
  error?: FieldError;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode; // For <select> options
}

// A reusable and consistent input field with label and error display.
// We use React.forwardRef to pass the ref down to the DOM element.
export const InputField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputFieldProps
>(
  (
    { label, name, error, as: Component = "input", children, ...props },
    ref,
  ) => {
    const baseClasses =
      "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
    const errorClasses =
      "border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        <Component
          id={name}
          name={name}
          ref={ref as ForwardedRef<any>} // Type assertion for dynamic component ref
          className={`${baseClasses} ${error ? errorClasses : ""}`}
          {...props}
        >
          {children}
        </Component>
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error.message}
          </p>
        )}
      </div>
    );
  },
);

// Set a display name for better debugging in React DevTools
InputField.displayName = "InputField";