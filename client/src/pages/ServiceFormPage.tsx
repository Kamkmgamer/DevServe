// client/src/pages/ServiceFormPage.tsx
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

// 1) Zod schema (all fields as strings; no transforms)
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().nonempty("Price is required"),
  category: z.string().min(1, "Category is required"),
  thumbnailUrl: z.string().url("Must be a URL").optional().default(""),
  featuresCsv: z.string().optional().default(""),
  imageUrlsCsv: z.string().optional().default(""),
});

// 2) Input type for the form (what RHF will return)
type FormValues = z.infer<typeof schema>;

const ServiceFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // 3) Cast the zodResolver to our FormValues
  const resolver = zodResolver(schema) as Resolver<FormValues, any>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
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
  });

  // 4) Load existing data for edit
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/services/${id}`)
      .then((res) => {
        const s = res.data;
        setValue("name", s.name);
        setValue("description", s.description);
        setValue("price", s.price.toString());
        setValue("category", s.category);
        setValue("thumbnailUrl", s.thumbnailUrl || "");
        setValue("featuresCsv", (s.features || []).join(", "));
        setValue("imageUrlsCsv", (s.imageUrls || []).join(", "));
      })
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, [id]);

  // 5) On submit: convert price to number, split CSV → arrays
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError("");
    const payload = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      category: data.category,
      thumbnailUrl: data.thumbnailUrl || null,
      features: data.featuresCsv
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      imageUrls: data.imageUrlsCsv
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
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
    <Container className="py-12 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? "Edit Service" : "Add Service"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)} // cast here too
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label className="block mb-1">Name</label>
          <input {...register("name")} className="w-full border p-2 rounded" />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
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

        {/* Price */}
        <div>
          <label className="block mb-1">Price (USD)</label>
          <input {...register("price")} className="w-full border p-2 rounded" />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1">Category</label>
          <input
            {...register("category")}
            className="w-full border p-2 rounded"
          />
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
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

        {/* Features CSV */}
        <div>
          <label className="block mb-1">Features (comma-separated)</label>
          <input
            {...register("featuresCsv")}
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
          {isSubmitting ? "Saving…" : isEdit ? "Update" : "Create"}
        </Button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </Container>
  );
};

export default ServiceFormPage;