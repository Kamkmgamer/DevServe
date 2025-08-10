import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number; // Spinner size in px
  color?: string; // Tailwind color without prefix (e.g., 'blue-500')
  fullscreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 80,
  color = 'blue-500',
  fullscreen = true,
}) => {
  const containerClasses = fullscreen
    ? 'relative flex items-center justify-center h-screen w-full transition-colors duration-300 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
    : 'relative flex items-center justify-center';

  // Generate particles
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 4,
  }));

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute w-1 h-1 rounded-full opacity-40 bg-gray-700 dark:bg-gray-300"
          style={{
            top: `${p.y}%`,
            left: `${p.x}%`,
          }}
          animate={{
            y: [`${p.y}%`, `${p.y - 10}%`],
            opacity: [0.4, 0.1, 0.4],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}

      {/* Glassmorphism Loader */}
      <motion.div
        className="backdrop-blur-xl rounded-full p-6 shadow-xl border transition-colors duration-300 bg-white/10 border-white/20 dark:bg-black/10 dark:border-white/10"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className={`animate-spin rounded-full border-t-4 border-${color} border-solid`}
          style={{
            width: size,
            height: size,
            borderRightColor: 'transparent',
            borderBottomColor: `rgb(var(--tw-color-${color.replace('-', ',')}))`,
            borderLeftColor: 'transparent',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default LoadingSpinner;
