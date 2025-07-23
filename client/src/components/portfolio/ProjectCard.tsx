import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string; // Matching your backend schema
    // category: string; // If you need to display category on card
    url?: string; // Link to live demo
  };
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
    >
      <div className="relative w-full h-56 overflow-hidden">
        <img
          src={project.thumbnailUrl || "https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Project"}
          alt={project.title}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        />
        {/* Optional overlay for hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <h3 className="text-white text-xl font-semibold">{project.title}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {project.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 flex-grow mb-4">
          {project.description}
        </p>
        <div className="mt-auto flex justify-between items-center">
          {/* Link to external project URL (if available) */}
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View Live <ArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          ) : (
            // Fallback: Link to an internal project detail page if you build one
            <Link
              to={`/portfolio/${project.id}`} // Assuming you might have a /portfolio/:id route later
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View Details <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};