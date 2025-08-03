// src/components/ui/Button.tsx
import React from "react";
import { Link, LinkProps } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost" | "cta-light" | "cta-ghost";

interface BaseButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
  };

type ButtonAsLink = BaseButtonProps &
  Omit<LinkProps, "className" | "children"> & {
    as: typeof Link;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
  secondary:
    "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400",
  ghost:
    
	"text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
  "cta-light":
    "bg-white text-blue-600 hover:bg-gray-100 shadow-lg",
  "cta-ghost":
    "text-blue-600 border-1 border-blue-600 bg-transparent hover:bg-blue-50 hover:text-blue-800 shadow-lg",
};


const baseClasses =
  "px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center";

const Button: React.FC<ButtonProps> = (props) => {
  const {
    children,
    variant = "primary",
    className = "",
    as = "button",
    ...rest
  } = props as ButtonAsButton;

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (as === "button") {
    const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button className={classes} {...buttonProps}>
        {children}
      </button>
    );
  }

  // Narrowed to Link branch; render Link directly to avoid 2604
  const linkProps = rest as Omit<LinkProps, "className" | "children">;
  return (
    <Link className={classes} {...linkProps}>
      {children}
    </Link>
  );
};

export default Button;