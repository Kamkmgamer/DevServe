import { useEffect, useState } from "react";
import Container from "../components/layout/Container";
import { motion } from "framer-motion";
import api from "../api/axios";
import { ProjectCard } from "../components/portfolio/ProjectCard";
import TagButton from "../components/ui/TagButton"; 

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  imageUrls?: string[]; // Might not use directly on this page
  category: string; // Ensure your backend returns this!
  url?: string;
};

// You'd ideally fetch categories from backend or define a static list if they're fixed
const categories = [
  "All",
  "Portfolio",
  "E-commerce",
  "Business",
  "Blog",
  "Web Applications",
];

const PortfolioPage = () => {
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<PortfolioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch portfolio items from your backend
    api.get<PortfolioItem[]>("/portfolio")
      .then((res) => {
        setProjects(res.data);
        setFilteredProjects(res.data); // Initially show all
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to load portfolio items.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter projects when category or projects change
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((p) => p.category === selectedCategory)
      );
    }
  }, [selectedCategory, projects]);

  if (loading) return <Container className="py-20 text-center">Loading portfolio...</Container>;
  if (error) return <Container className="py-20 text-center text-red-500">{error}</Container>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Container className="py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
          Our Latest Work
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Showcasing a diverse range of projects, from elegant portfolios to robust e-commerce solutions.
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {categories.map((cat) => (
          <TagButton
            key={cat}
            label={cat}
            isActive={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </motion.div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-gray-500 text-lg py-10">
          No projects found for this category.
        </div>
      )}
    </Container>
  );
};

export default PortfolioPage;