import React from 'react'; // 👈 Import React
import { motion } from 'framer-motion'; // 👈 Import motion

interface TagButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TagButton: React.FC<TagButtonProps> = ({ label, isActive, onClick }) => {
  const baseStyles = "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-in-out";
  const activeStyles = "bg-blue-600 text-white shadow-md";
  const inactiveStyles = "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";

  return (
    // Correct way to use motion component
    <motion.button
      onClick={onClick}
      className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
};

export default TagButton;