import React, { memo, useMemo } from 'react';

interface LoadingSpinnerProps {
  size?: number; 
  color?: string; 
  fullscreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(function LoadingSpinner({
  size = 80,
  color = '#3b82f6', // default: Tailwind blue-500 hex
  fullscreen = true,
}) {
  // Compute classnames and styles only when props change
  const containerClasses = useMemo(
    () => (
      fullscreen
        ? 'relative flex items-center justify-center h-screen w-full transition-colors duration-300 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
        : 'inline-flex items-center justify-center'
    ),
    [fullscreen]
  );

  const ringStyle = useMemo<React.CSSProperties>(() => {
    const border = Math.max(4, Math.round(size / 10));
    return {
      width: size,
      height: size,
      borderWidth: border,
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderTopColor: color,
      borderRadius: '9999px',
      willChange: 'transform',
      transform: 'translateZ(0)', // promote to GPU
    };
  }, [size, color]);

  return (
    <div className={containerClasses}>
      {/* Glassmorphism wrapper kept lightweight (no JS animations) */}
      <div className="backdrop-blur-xl rounded-full p-6 shadow-xl border transition-colors duration-300 bg-white/10 border-white/20 dark:bg-black/10 dark:border-white/10">
        <div className="cs-spin" style={ringStyle} />
      </div>

      {/* Reduce motion support */}
      <style>{`
        @keyframes csSpin { to { transform: rotate(360deg) translateZ(0); } }
        .cs-spin { animation: csSpin 1s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin, .cs-spin { animation: none !important; }
        }
      `}</style>
    </div>
  );
});

export default LoadingSpinner;
