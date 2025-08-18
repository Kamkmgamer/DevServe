/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForgotPasswordPage from './ForgotPasswordPage';
import { mockMutate } from '../../__mocks__/@tanstack/react-query';
// import toast from 'react-hot-toast'; // No longer needed as component uses internal state

const queryClient = new QueryClient();

const renderComponent = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <ForgotPasswordPage />
    </QueryClientProvider>
  );

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear(); // Clear mockMutate calls before each test
    // toast.success.mockClear(); // No longer needed
    // toast.error.mockClear();   // No longer needed
  });

  it('should render the email input and submit button', () => {
    renderComponent();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('should show validation error for invalid email', async () => {
    renderComponent();
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled(); // Still not called if validation fails
    // expect(toast.error).not.toHaveBeenCalled(); // No longer needed
  });

  it('should call requestPasswordReset on valid submission and show success message', async () => {
    // Mock mockMutate to simulate a successful API call
    (mockMutate as unknown as jest.Mock).mockResolvedValue({});

    renderComponent();
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({ email: 'test@example.com' });
    await waitFor(() => {
      expect(screen.getByText('If an account with that email exists, a password reset link has been sent.')).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    // Mock mockMutate to simulate a failed API call
    (mockMutate as unknown as jest.Mock).mockRejectedValue({ response: { data: { error: 'An error occurred. Please try again.' } } });

    renderComponent();
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({ email: 'test@example.com' });
    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });
});