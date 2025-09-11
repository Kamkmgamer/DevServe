import { useEffect, useState } from "react";
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

// Zod schema for blog post
const schema = z.object({
  title: z.string().min(1, "Title is required").max(160, "Max 160 characters"),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(300, "Max 300 characters"),
  content: z.string().min(1, "Content is required"),
  thumbnailUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

const BlogFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const resolver = zodResolver(schema) as Resolver<FormValues>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      thumbnailUrl: "",
    },
    mode: "onBlur",
  });

  const title = watch("title");
  const summary = watch("summary");
  const thumbnailUrl = watch("thumbnailUrl");

  // Load existing post
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/blog/${id}`)
      .then((res) => {
        const p = res.data;
        setValue("title", p.title);
        setValue("summary", p.summary);
        setValue("content", p.content);
        setValue("thumbnailUrl", p.thumbnailUrl || "");
      })
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, [id, isEdit, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError("");
    const payload = {
      title: data.title.trim(),
      summary: data.summary.trim(),
      content: data.content, // Markdown or HTML by your choice; BlogDetails renders Markdown
      thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl.trim() : null,
    };
    try {
      if (isEdit) {
        await api.patch(`/blog/${id}`, payload);
      } else {
        await api.post("/blog", payload);
      }
      navigate("/admin/blog");
    } catch (e: { response?: { data?: { error?: string } }; message?: string }) {
      setError(e.response?.data?.error || e.message);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <Container className="py-10 max-w-2xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Blog Post" : "Add Blog Post"}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Provide the article details. You can add a thumbnail image URL for
              previews and listings.
            </p>
          </div>
          <Link to="/admin/blog">
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
          {/* Post Details */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Post Details
            </h2>

            {/* Title */}
            <div className="mb-4">
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Title *
              </label>
              <input
                id="title"
                {...register("title")}
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
                maxLength={160}
                placeholder="Write a compelling title"
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.title ? (
                  <p id="title-error" className="text-sm text-red-500">
                    {errors.title.message}
                  </p>
                ) : (
                  <span className="text-xs text-slate-500">
                    {(title?.length || 0)}/160
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="mb-4">
              <label
                htmlFor="summary"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Summary *
              </label>
              <textarea
                id="summary"
                {...register("summary")}
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                rows={3}
                aria-invalid={!!errors.summary}
                aria-describedby={errors.summary ? "summary-error" : undefined}
                maxLength={300}
                placeholder="Short synopsis for list pages and meta description"
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.summary ? (
                  <p id="summary-error" className="text-sm text-red-500">
                    {errors.summary.message}
                  </p>
                ) : (
                  <span className="text-xs text-slate-500">
                    {(summary?.length || 0)}/300
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mb-1">
              <label
                htmlFor="content"
                className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
              >
                Content *
              </label>
              <textarea
                id="content"
                {...register("content")}
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                rows={10}
                aria-invalid={!!errors.content}
                aria-describedby={errors.content ? "content-error" : undefined}
                placeholder="Write your article content here (Markdown supported)..."
              />
              {errors.content && (
                <p id="content-error" className="mt-1 text-sm text-red-500">
                  {errors.content.message}
                </p>
              )}
            </div>
          </section>

          {/* Media */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Media
            </h2>
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
                className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950"
                placeholder="https://example.com/thumbnail.jpg"
              />
              {errors.thumbnailUrl && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.thumbnailUrl.message}
                </p>
              )}

              {thumbnailUrl && (
                <div className="mt-3">
                  <img
                    src={thumbnailUrl}
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

          {/* Spacer for sticky bar */}
          <div className="h-20" />

          {/* Sticky Action Bar */}
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <Container className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {isEdit ? "Editing post" : "Creating new post"}
                {isDirty ? " • Unsaved changes" : ""}
              </div>
              <div className="flex gap-3">
                <Link to="/admin/blog">
                  <Button variant="secondary" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : isEdit ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </Container>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default BlogFormPage;