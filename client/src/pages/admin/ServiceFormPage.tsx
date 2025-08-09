import { useEffect, useMemo, useState } from "react";
import {
  useForm,
  SubmitHandler,
  Resolver,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate, Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

// -------------------- Schema --------------------
const schema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Max 120 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Max 2000 characters"),
  price: z
    .string()
    .nonempty("Price is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
      message: "Enter a valid non‑negative number",
    }),
  category: z.string().min(1, "Category is required").max(80, "Max 80 chars"),
  thumbnailUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  featuresCsv: z.string().optional().default(""),
  imageUrlsCsv: z.string().optional().default(""),
});

type FormValues = z.infer<typeof schema>;

// -------------------- Utilities --------------------
const splitCsv = (csv?: string) =>
  (csv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const dedupe = (arr: string[]) => Array.from(new Set(arr));

const isProbablyUrl = (s: string) => /^https?:\/\//i.test(s);

// -------------------- Component --------------------
const ServiceFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const resolver = zodResolver(schema) as Resolver<FormValues, any>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      thumbnailUrl: "",
      featuresCsv: "",
      imageUrlsCsv: "",
    },
    mode: "onBlur",
  });

  const featuresCsv = watch("featuresCsv");
  const imageUrlsCsv = watch("imageUrlsCsv");
  const description = watch("description");
  const name = watch("name");

  const featuresPreview = useMemo(
    () => dedupe(splitCsv(featuresCsv)),
    [featuresCsv]
  );

  const imageUrlsPreview = useMemo(
    () => dedupe(splitCsv(imageUrlsCsv)),
    [imageUrlsCsv]
  );

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/services/${id}`)
      .then((res) => {
        const s = res.data;
        setValue("name", s.name);
        setValue("description", s.description);
        setValue("price", String(s.price ?? ""));
        setValue("category", s.category);
        setValue("thumbnailUrl", s.thumbnailUrl || "");
        // Parse features from JSON string to array
        const features = typeof s.features === 'string' ? JSON.parse(s.features) : (s.features || []);
        setValue("featuresCsv", features.join(", "));
        // Parse imageUrls from JSON string to array
        const imageUrls = typeof s.imageUrls === 'string' ? JSON.parse(s.imageUrls) : (s.imageUrls || []);
        setValue("imageUrlsCsv", imageUrls.join(", "));
      })
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, [id, isEdit, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError("");

    const parsedPrice = Number(data.price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid non‑negative price.");
      return;
    }

    const features = dedupe(splitCsv(data.featuresCsv));
    const imageUrls = dedupe(splitCsv(data.imageUrlsCsv));

    // Optional: basic URL guard for image URLs
    const invalidUrls = imageUrls.filter((u) => !isProbablyUrl(u));
    if (invalidUrls.length > 0) {
      setError("One or more image URLs are not valid http(s) URLs.");
      return;
    }

    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      price: parsedPrice,
      category: data.category.trim(),
      thumbnailUrl: data.thumbnailUrl?.trim() || null,
      features,
      imageUrls,
    };

    try {
      if (isEdit) {
        await api.patch(`/services/${id}`, payload);
      } else {
        await api.post("/services", payload);
      }
      navigate("/admin/services");
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <Container className="py-10">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Service" : "Add Service"}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Fill in the details below. You can add features and multiple image
              URLs as comma‑separated lists.
            </p>
          </div>
          <Link to="/admin/services">
            <Button variant="secondary">Back to list</Button>
          </Link>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
          className="space-y-8"
          noValidate
        >
          {/* Details */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold">Details</h2>

            {/* Name */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Name
              </label>
              <input
                id="name"
                {...register("name")}
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                maxLength={120}
                placeholder="e.g., Premium Landing Page"
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.name ? (
                  <p id="name-error" className="text-sm text-red-500">
                    {errors.name.message}
                  </p>
                ) : (
                  <span className="text-xs text-slate-500">
                    {name?.length || 0}/120
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={5}
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                aria-invalid={!!errors.description}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                maxLength={2000}
                placeholder="What’s included, outcomes, timelines..."
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.description ? (
                  <p id="description-error" className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                ) : (
                  <span className="text-xs text-slate-500">
                    {description?.length || 0}/2000
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <label
                htmlFor="price"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Price (USD)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <input
                  id="price"
                  {...register("price")}
                  inputMode="decimal"
                  placeholder="1999"
                  className="w-full rounded border border-slate-300 pl-7 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                  aria-invalid={!!errors.price}
                  aria-describedby={errors.price ? "price-error" : undefined}
                />
              </div>
              {errors.price && (
                <p id="price-error" className="mt-1 text-sm text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="mb-1">
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Category
              </label>
              <input
                id="category"
                {...register("category")}
                placeholder="e.g., Design, Development, SEO"
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                aria-invalid={!!errors.category}
                aria-describedby={
                  errors.category ? "category-error" : undefined
                }
              />
              {errors.category && (
                <p id="category-error" className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>
          </section>

          {/* Media */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold">Media</h2>

            {/* Thumbnail URL */}
            <div>
              <label
                htmlFor="thumbnailUrl"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Thumbnail URL
              </label>
              <input
                id="thumbnailUrl"
                {...register("thumbnailUrl")}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                aria-invalid={!!errors.thumbnailUrl}
                aria-describedby={
                  errors.thumbnailUrl ? "thumbnail-error" : undefined
                }
              />
              {errors.thumbnailUrl && (
                <p id="thumbnail-error" className="mt-1 text-sm text-red-500">
                  {errors.thumbnailUrl.message as string}
                </p>
              )}

              {isProbablyUrl(watch("thumbnailUrl") || "") && (
                <div className="mt-3">
                  <img
                    src={watch("thumbnailUrl")!}
                    alt="Thumbnail preview"
                    className="h-28 w-auto rounded border border-slate-200 object-cover dark:border-slate-800"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Lists */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold">Lists</h2>

            {/* Features CSV */}
            <div className="mb-6">
              <label
                htmlFor="featuresCsv"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Features (comma‑separated)
              </label>
              <input
                id="featuresCsv"
                {...register("featuresCsv")}
                placeholder="Responsive design, SEO‑ready, Analytics setup"
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
              />
              {featuresPreview.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
                  {featuresPreview.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Image URLs CSV */}
            <div>
              <label
                htmlFor="imageUrlsCsv"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Image URLs (comma‑separated)
              </label>
              <input
                id="imageUrlsCsv"
                {...register("imageUrlsCsv")}
                placeholder="https://site.com/1.jpg, https://site.com/2.png"
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
              />
              {imageUrlsPreview.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {imageUrlsPreview.slice(0, 6).map((u) =>
                    isProbablyUrl(u) ? (
                      <img
                        key={u}
                        src={u}
                        alt="Gallery preview"
                        className="h-24 w-full rounded border border-slate-200 object-cover dark:border-slate-800"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div
                        key={u}
                        className="flex h-24 items-center justify-center rounded border border-amber-300 bg-amber-50 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                      >
                        Not a valid URL
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Spacer to avoid being covered by sticky bar */}
          <div className="h-20" />
          {/* Sticky action bar */}
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <Container className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {isEdit ? "Editing existing service" : "Creating new service"}
                {isDirty ? " • Unsaved changes" : ""}
              </div>
              <div className="flex gap-3">
                <Link to="/admin/services">
                  <Button variant="secondary" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving…"
                    : isEdit
                    ? "Update Service"
                    : "Create Service"}
                </Button>
              </div>
            </Container>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default ServiceFormPage;