import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/services'; // Will create this function

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

const resetPasswordSchema = z.object({
  newPassword: z.string().regex(strongPasswordRegex, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Password reset token is missing.');
    }
  }, [location.search]);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setSuccess('Password has been reset successfully. You can now log in with your new password.');
      setError(null);
      setTimeout(() => {
        navigate('/login'); // Redirect to login page after a delay
      }, 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      setSuccess(null);
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) {
      setError('Password reset token is missing.');
      return;
    }
    const { newPassword } = data; // Destructure to exclude confirmNewPassword
    mutation.mutate({ token, newPassword });
  };

  if (error && !token) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="newPassword" className="block mb-1">New Password</label>
          <input
            id="newPassword"
            type="password"
            {...register('newPassword')}
            className="w-full p-2 border rounded"
          />
          {errors.newPassword && <p className="text-red-500">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="block mb-1">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            {...register('confirmNewPassword')}
            className="w-full p-2 border rounded"
          />
          {errors.confirmNewPassword && <p className="text-red-500">{errors.confirmNewPassword.message}</p>}
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={mutation.isPending || !token}>
          {mutation.isPending ? 'Resetting...' : 'Reset Password'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </form>
    </div>
  );
};

export default ResetPasswordPage;
