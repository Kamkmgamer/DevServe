// src/components/ui/Button.tsx
import { Link, LinkProps } from "react-router-dom";
import React from "react";

interface BaseButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "cta-light" | "cta-ghost";
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
  };

type ButtonAsLink = BaseButtonProps &
  LinkProps & {
    as: typeof Link;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  as = "button",
  ...props
}) => {
  const baseClasses =
    "px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center";

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
    secondary:
      "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400",
    ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
    "cta-light": "bg-white text-blue-600 hover:bg-gray-100 shadow-lg",
    "cta-ghost": "text-white border-2 border-white hover:bg-white hover:text-blue-600",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  if (as === "button") {
    return (
      <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }

  const Component = as;
  return (
    <Component className={classes} {...(props as LinkProps)}>
      {children}
    </Component>
  );
};

export default Button;