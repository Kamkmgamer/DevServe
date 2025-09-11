// client/src/pages/PortfolioFormPage.tsx
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
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

// Zod schema: all fields as strings; imageUrlsCsv for CSV
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().default(""),
  imageUrlsCsv: z.string().optional().default(""),
});
type FormValues = z.infer<typeof schema>;

const PortfolioFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const resolver = zodResolver(schema) as Resolver<FormValues>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      imageUrlsCsv: "",
    },
  });

  // Load existing item
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/portfolio/${id}`)
      .then((res) => {
        const it = res.data;
        setValue("title", it.title);
        setValue("description", it.description);
        setValue("thumbnailUrl", it.thumbnailUrl || "");
        // Parse imageUrls from JSON string to array
        const imageUrls = typeof it.imageUrls === 'string' ? JSON.parse(it.imageUrls) : (it.imageUrls || []);
        setValue("imageUrlsCsv", imageUrls.join(", "));
      })
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, [id, isEdit, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError("");
    const payload = {
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl || null,
      imageUrls: data.imageUrlsCsv
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
    };
    try {
      if (isEdit) {
        await api.patch(`/portfolio/${id}`, payload);
      } else {
        await api.post("/portfolio", payload);
      }
      navigate("/admin/portfolio");
    } catch (e: { response?: { data?: { error?: string } }; message?: string }) {
      setError(e.response?.data?.error || e.message);
    }
  };

  return (
    <Container className="py-12 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? "Edit Portfolio Item" : "Add Portfolio Item"}
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

        {/* Description */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            {...register("description")}
            className="w-full border p-2 rounded"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">
              {errors.description.message}
            </p>
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

        {/* Image URLs CSV */}
        <div>
          <label className="block mb-1">Image URLs (comma-separated)</label>
          <input
            {...register("imageUrlsCsv")}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Submit */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : isEdit
            ? "Update Item"
            : "Create Item"}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </Container>
  );
};

export default PortfolioFormPage;