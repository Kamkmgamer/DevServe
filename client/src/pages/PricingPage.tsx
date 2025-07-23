import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { CheckCircle } from "lucide-react"; // For feature icons
import { motion } from "framer-motion"; // For animations
import { Link } from "react-router-dom"; // For linking buttons

const pricingTiers = [
  {
    name: "Starter",
    price: 499,
    description: "Ideal for individuals or small businesses needing a strong online presence.",
    features: [
      "1-3 professional pages",
      "Mobile-responsive design",
      "Basic SEO optimization",
      "Integrated contact form",
      "1-month post-launch support"
    ],
    highlight: false,
    ctaLink: "/contact" // Link to contact page
  },
  {
    name: "Professional",
    price: 999,
    description: "Perfect for growing businesses requiring custom features and more content.",
    features: [
      "Up to 7 custom-designed pages",
      "Advanced UI/UX",
      "Comprehensive SEO strategy",
      "Blog/news integration",
      "Interactive portfolio/gallery",
      "3-month dedicated support"
    ],
    highlight: true, // This tier will be highlighted
    ctaLink: "/contact"
  },
  {
    name: "Business",
    price: 1999,
    description: "For established companies needing a robust platform with advanced capabilities.",
    features: [
      "Unlimited pages & sections",
      "Full e-commerce integration (Shopify/WooCommerce)",
      "High-performance optimization",
      "Custom web applications/SaaS features",
      "6-month priority support & updates",
      "Dedicated account manager"
    ],
    highlight: false,
    ctaLink: "/contact"
  }
];

const PricingPage = () => {
  return (
    <Container className="py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Choose the plan that fits your needs. All plans are crafted to deliver high-quality, responsive web solutions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {pricingTiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
              ${tier.highlight ? "bg-blue-600 text-white dark:bg-blue-700" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"}`
            }
          >
            <div className={`p-8 ${tier.highlight ? "bg-blue-700 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"}`}>
              <h2 className={`text-2xl font-bold mb-2 ${tier.highlight ? "text-white" : "text-gray-900 dark:text-white"}`}>{tier.name}</h2>
              <p className={`text-sm ${tier.highlight ? "text-blue-200" : "text-gray-600 dark:text-gray-300"}`}>{tier.description}</p>
              <div className="mt-6 text-center">
                <span className={`text-5xl font-extrabold ${tier.highlight ? "text-white" : "text-blue-600 dark:text-blue-400"}`}>${tier.price}</span>
                <span className={`text-xl font-medium ${tier.highlight ? "text-blue-200" : "text-gray-500"}`}>/one-time</span>
              </div>
            </div>

            <div className="p-8 flex-grow">
              <ul className="space-y-3">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className={`h-5 w-5 mr-3 ${tier.highlight ? "text-blue-300" : "text-green-500"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 pt-0 mt-auto">
              <Link to={tier.ctaLink}>
                <Button
                  variant={tier.highlight ? "secondary" : "primary"}
                  className={`w-full text-lg py-3 ${tier.highlight ? "bg-white text-blue-600 hover:bg-gray-100" : ""}`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </Container>
  );
};

export default PricingPage;