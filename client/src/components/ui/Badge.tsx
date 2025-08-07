import React from 'react';

interface BadgeProps {
  tone?: "blue" | "slate" | "green" | "purple" | "fuchsia";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ tone = "slate", children, className }) => {
  const map: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    slate: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${map[tone]} ${className}`}
    >
      {children}
    </span>
  );
};
