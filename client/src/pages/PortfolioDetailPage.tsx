import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import Container from "../components/layout/Container";
import { ArrowLeft } from "lucide-react";
import toast from 'react-hot-toast';

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string; // Main image
  imageUrls: string;     // JSON string for the carousel/gallery
  projectUrl?: string;   // Link to live project
};

// Helper function to parse JSON string to array
const parseJsonArray = (jsonString: string): string[] => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
};

const PortfolioDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    api.get(`/portfolio/${id}`) // Assuming your backend provides this
      .then(res => setItem(res.data))
      .catch(err => {
        setError(err.response?.data?.error || "Failed to load portfolio item.");
        toast.error("Failed to load portfolio item.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Parse imageUrls from JSON string to array
  const imageUrls = useMemo(() => {
    if (!item) return [];
    return parseJsonArray(item.imageUrls);
  }, [item]);

  if (loading) return <Container className="py-20 text-center">Loading project details...</Container>;
  if (error) return <Container className="py-20 text-center text-red-500">{error}</Container>;
  if (!item) return <Container className="py-20 text-center">Project not found.</Container>;

  const imagesToShow = imageUrls.length > 0 ? imageUrls : [item.thumbnailUrl || "https://via.placeholder.com/800x600/eee?text=No+Image"];
  const mainImage = imagesToShow[currentImageIndex];

  return (
    <Container className="py-16 max-w-4xl">
      <Link to="/portfolio" className="inline-flex items-center text-blue-600 hover:underline mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
      </Link>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image Gallery/Carousel */}
        <div>
          <img src={mainImage} alt={item.title} className="w-full rounded-lg shadow-lg mb-4" />
          {imagesToShow.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {imagesToShow.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
                    index === currentImageIndex ? "border-blue-500" : "border-transparent"
                  } transition-all duration-200 hover:scale-105`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{item.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{item.description}</p>
          
          {item.projectUrl && (
            <div className="mb-6">
              <a
                href={item.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 font-semibold hover:underline"
              >
                Visit Live Project <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </a>
            </div>
          )}

          {/* You can add more details here if your backend supplies them, e.g., technologies used, date completed, client info */}
        </div>
      </div>
    </Container>
  );
};

export default PortfolioDetailPage;