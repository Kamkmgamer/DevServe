// client/src/pages/BlogFormPage.tsx
import { useEffect, useState } from "react";
import {
  useForm,
  SubmitHandler,
  Resolver,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import api from "../api/axios";

// Zod schema for blog post
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().default(""),
});
type FormValues = z.infer<typeof schema>;

const BlogFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const resolver = zodResolver(schema) as Resolver<FormValues, any>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      thumbnailUrl: "",
    },
  });

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
  }, [id]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError("");
    const payload = {
      title: data.title,
      summary: data.summary,
      content: data.content,
      thumbnailUrl: data.thumbnailUrl || null,
    };
    try {
      if (isEdit) {
        await api.patch(`/blog/${id}`, payload);
      } else {
        await api.post("/blog", payload);
      }
      navigate("/admin/blog");
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    }
  };

  return (
    <Container className="py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? "Edit Blog Post" : "Add Blog Post"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
        className="space-y-4"
      >
        {/* Title */}
        <div>
          <label className="block mb-1">Title</label>
          <input
            {...register("title")}
            className="w-full border p-2 rounded"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <label className="block mb-1">Summary</label>
          <textarea
            {...register("summary")}
            className="w-full border p-2 rounded"
            rows={3}
          />
          {errors.summary && (
            <p className="text-red-500 text-sm">{errors.summary.message}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block mb-1">Content</label>
          <textarea
            {...register("content")}
            className="w-full border p-2 rounded"
            rows={6}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className="block mb-1">Thumbnail URL</label>
          <input
            {...register("thumbnailUrl")}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Submit */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : isEdit
            ? "Update Post"
            : "Create Post"}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </Container>
  );
};

export default BlogFormPage;