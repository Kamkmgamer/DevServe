import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type ServiceCardProps = {
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    thumbnailUrl?: string;
  };
};

export const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      {/* Make the entire image area clickable */}
      <Link to={`/services/${service.id}`} className="block"> {/* 👈 Wrap image in Link */}
        <img
          src={service.thumbnailUrl || "https://via.placeholder.com/400x250"}
          alt={service.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" // Add hover effect
        />
      </Link> {/* 👈 End Link */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Make the title clickable too */}
        <Link to={`/services/${service.id}`}> {/* 👈 Wrap title in Link */}
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-200">
            {service.name}
          </h3>
        </Link> {/* 👈 End Link */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
          {service.description}
        </p>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            ${service.price}
          </span>
          {/* Keep the "View Details" button/link */}
          <Link
            to={`/services/${service.id}`}
            className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400 group-hover:underline"
          >
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};