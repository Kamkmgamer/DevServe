// src/components/ui/InputField.tsx
import React, { useEffect, useRef } from "react";
import { FieldError } from "react-hook-form";

interface InputFieldProps
  extends React.InputHTMLAttributes<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > {
  label: string;
  error?: FieldError;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
  autoResize?: boolean; // for textarea
  helpText?: string;
}

export const InputField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputFieldProps
>(({ label, name, error, as: Component = "input", children, autoResize, required, helpText, ...props }, ref) => {
  const localRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    if (Component !== "textarea" || !autoResize) return;
    const el = (ref as any)?.current ?? localRef.current;
    if (!el) return;
    const resize = () => {
      (el as HTMLTextAreaElement).style.height = "auto";
      (el as HTMLTextAreaElement).style.height = `${(el as HTMLTextAreaElement).scrollHeight}px`;
    };
    resize();
  }, [Component, autoResize, ref, props.value]);

  const base =
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const errorCls = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const id = props.id || name;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <Component
        id={id}
        name={name}
        ref={(node: any) => {
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
          localRef.current = node;
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${base} ${error ? errorCls : ""}`}
        {...props}
      >
        {children}
      </Component>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
});

InputField.displayName = "InputField";