import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset } from '../api/services'; // Will create this function

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setSuccess('If an account with that email exists, a password reset link has been sent.');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      setSuccess(null);
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block mb-1">Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full p-2 border rounded"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </form>
    </div>
  );
};

export default ForgotPasswordPage;
