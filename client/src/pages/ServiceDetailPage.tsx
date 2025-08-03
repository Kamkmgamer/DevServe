import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  Copy,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  category: string;
  thumbnailUrl?: string;
  imageUrls: string[];
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    setError("");
    setService(null);
    setCurrentImageIndex(0);
    api
      .get(`/services/${id}`)
      .then((res) => setService(res.data))
      .catch((err) =>
        setError(
          err?.response?.data?.error ||
            err.message ||
            "Failed to load service."
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  const images = useMemo(() => {
    const list = service?.imageUrls?.length ? service.imageUrls : [];
    const all = service?.thumbnailUrl ? [service.thumbnailUrl, ...list] : list;
    return all;
  }, [service]);

  const prev = useCallback(() => {
    if (!images.length) return;
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    if (!images.length) return;
    setCurrentImageIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const handleAdd = useCallback(() => {
    if (!service) return;
    addToCart(service.id, 1);
    toast.success(`${service.name} added to cart!`);
  }, [service, addToCart]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: service?.name || "Service",
          text: service?.description?.slice(0, 100),
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.error("Failed to copy link");
      }
    }
  }, [service]);

  if (loading)
    return (
      <Container className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Loading service…
        </p>
      </Container>
    );

  if (error)
    return (
      <Container className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-red-600">{error}</p>
        <Link
          to="/services"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to Services
        </Link>
      </Container>
    );

  if (!service)
    return (
      <Container className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p>Service not found.</p>
        <Link
          to="/services"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to Services
        </Link>
      </Container>
    );

  const mainImage = images[currentImageIndex];

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <div className="bg-gradient-to-b from-blue-50/70 to-transparent py-6 dark:from-slate-900/40">
        <Container className="px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/services"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Back to Services
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-blue-700 ring-1 ring-blue-200 dark:bg-slate-900 dark:text-blue-200 dark:ring-slate-700">
            <Sparkles className="h-4 w-4" />
            {service.category}
          </div>
        </Container>
      </div>

      <Container className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <motion.div
          className="grid grid-cols-1 gap-10 md:grid-cols-2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Gallery */}
          <div className="relative">
            <motion.div
              layoutId={`service-image-${service.id}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {mainImage && (
                <img
                  src={mainImage}
                  alt={service.name}
                  className="w-full object-cover"
                />
              )}
            </motion.div>

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next image"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={[
                        "h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg border",
                        idx === currentImageIndex
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-slate-200 dark:border-slate-800",
                      ].join(" ")}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
                {service.name}
              </h1>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {typeof navigator.share === "function" ? (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy link"}
                  </>
                )}
              </button>
            </div>

            <p className="mb-6 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {service.description}
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800">
                High performance
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-800">
                SEO friendly
              </span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800">
                Responsive
              </span>
            </div>

            <div className="mb-8">
              <h3 className="mb-3 text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                What’s Included
              </h3>
              <ul className="space-y-2">
                {service.features.map((f, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-200">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <div className="relative">
                <div className="sticky bottom-0 left-0 right-0 bg-white p-4 shadow sm:static sm:bg-transparent sm:p-0 dark:bg-slate-900 dark:sm:bg-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {formatPrice(service.price)}
                    </span>
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Secure checkout. No hidden fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/services" className="text-blue-600 hover:underline">
            ← Back to Services
          </Link>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45 }}
            className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            Looking for something tailored? I can customize features, integrate
            third-party APIs, or build internal tools that suit your workflow.
            <Link to="/contact" className="text-blue-600 hover:underline">
              {" "}
              Start a conversation →
            </Link>
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
};

export default ServiceDetailPage;
