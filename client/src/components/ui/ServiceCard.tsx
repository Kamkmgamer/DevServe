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
  const imgSrc =
    service.thumbnailUrl || "https://via.placeholder.com/640x360?text=Service";
  const price =
    typeof service.price === "number"
      ? `$${service.price.toFixed(2)}`
      : "—";

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800">
      <Link
        to={`/services/${service.id}`}
        className="block"
        aria-label={`Open ${service.name}`}
      >
        <img
          src={imgSrc}
          alt={service.name}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="flex grow flex-col p-6">
        <Link to={`/services/${service.id}`} aria-label={`Open ${service.name}`}>
          <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-white">
            {service.name}
          </h3>
        </Link>

        <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-300">
          {service.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {price}
          </span>

          <Link
            to={`/services/${service.id}`}
            className="inline-flex items-center font-semibold text-blue-600 hover:underline dark:text-blue-400"
            aria-label={`View details for ${service.name}`}
          >
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};