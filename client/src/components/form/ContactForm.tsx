import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios";
import Button from "../ui/Button";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormInputs = z.infer<typeof contactSchema>;

export const ContactForm = () => {
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    message: string;
  }>({ submitted: false, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<ContactFormInputs>({
    // @ts-expect-error Zod v4 compatibility with @hookform/resolvers v3
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ContactFormInputs) => {
    try {
      await api.post("/contact", data);
      setFormStatus({
        submitted: true,
        message: "Thank you! Your message has been sent.",
      });
      reset();
    } catch {
      setFormStatus({
        submitted: false,
        message: "An error occurred. Please try again later.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Success/Error banners */}
      {formStatus.message && (
        <div
          role="status"
          className={[
            "rounded-lg border p-3 text-sm",
            formStatus.submitted
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300",
          ].join(" ")}
        >
          {formStatus.message}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="w-full rounded-md border border-slate-300 bg-slate-100 px-4 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder="Your name"
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="w-full rounded-md border border-slate-300 bg-slate-100 px-4 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-1 block text-sm font-medium text-slate-800 dark:text-slate-100"
        >
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="w-full rounded-md border border-slate-300 bg-slate-100 px-4 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder="How can we help?"
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-red-500">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {/* Hint to discourage double-submit */}
      {!isSubmitSuccessful && !isSubmitting && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          We usually respond within 1–2 business days.
        </p>
      )}
    </form>
  );
};