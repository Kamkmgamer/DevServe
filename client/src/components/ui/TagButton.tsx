import React from "react";
import { motion } from "framer-motion";

interface TagButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TagButton: React.FC<TagButtonProps> = ({
  label,
  isActive,
  onClick,
}) => {
  const base =
    "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-in-out";
  const active = "bg-blue-600 text-white shadow-md";
  const inactive =
    "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`${base} ${isActive ? active : inactive}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
};

export default TagButton;