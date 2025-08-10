import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../api/services';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().regex(strongPasswordRegex, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setSuccess('Password changed successfully');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'An error occurred');
      setSuccess(null);
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    const { currentPassword, newPassword } = data; // Destructure to exclude confirmPassword
    mutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block mb-1">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            {...register('currentPassword')}
            className="w-full p-2 border rounded"
          />
          {errors.currentPassword && <p className="text-red-500">{errors.currentPassword.message}</p>}
        </div>
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
          <label htmlFor="confirmPassword" className="block mb-1">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="w-full p-2 border rounded"
          />
          {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={mutation.isPending}>
          {mutation.isPending ? 'Changing...' : 'Change Password'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </form>
    </div>
  );
};

export default ChangePasswordPage;

