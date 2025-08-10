jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../api/services', () => ({
  resetPassword: jest.fn(),
}));

// Mock react-router-dom
const mockUseLocation = jest.fn();
const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockUseNavigate,
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResetPasswordPage from './ResetPasswordPage';
import { resetPassword } from '../api/services'; // Now this import will get the mock
import { mockMutate } from '../../__mocks__/@tanstack/react-query';
import toast from 'react-hot-toast'; // Now this import will get the mock

const queryClient = new QueryClient();

const renderComponent = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <ResetPasswordPage />
    </QueryClientProvider>
  );

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ search: '?token=test-token' });
    mockUseNavigate.mockClear();
    mockMutate.mockClear(); // Clear mockMutate calls before each test
    (toast.success as jest.Mock).mockClear(); // Correct way to clear mock
    (toast.error as jest.Mock).mockClear();   // Correct way to clear mock
  });

  it('should render password inputs and submit button', () => {
    renderComponent();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('should show error if token is missing', () => {
    mockUseLocation.mockReturnValue({ search: '' }); // No token
    renderComponent();
    expect(screen.getByText('Password reset token is missing.')).toBeInTheDocument();
    // No need to check for button if error message is displayed and button is not rendered
  });

  it('should show validation error for weak password', async () => {
    renderComponent();
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await userEvent.type(newPasswordInput, 'weak');
    await userEvent.type(confirmNewPasswordInput, 'weak');
    await userEvent.click(submitButton);

    expect(await screen.findByText('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled(); // Should not call mutate if validation fails
    expect(toast.error).not.toHaveBeenCalled(); // No toast error for client-side validation
  });

  it('should show validation error if passwords do not match', async () => {
    renderComponent();
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await userEvent.type(newPasswordInput, 'StrongPassword123!');
    await userEvent.type(confirmNewPasswordInput, 'StrongPassword123'); // Mismatch
    await userEvent.click(submitButton);

    expect(await screen.findByText('Passwords don\'t match')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled(); // Should not call mutate if validation fails
    expect(toast.error).not.toHaveBeenCalled(); // No toast error for client-side validation
  });

  it('should call resetPassword on valid submission and show success message, then navigate to login', async () => {
    // Mock mockMutate to simulate a successful API call
    mockMutate.mockResolvedValue({});

    renderComponent();
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await userEvent.type(newPasswordInput, 'StrongPassword123!');
    await userEvent.type(confirmNewPasswordInput, 'StrongPassword123!');
    await userEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({ token: 'test-token', newPassword: 'StrongPassword123!' });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password has been reset successfully. You can now log in with your new password.');
    });
    expect(screen.queryByText('Password has been reset successfully. You can now log in with your new password.')).not.toBeInTheDocument();
    // Wait for navigation
    await waitFor(() => {
      expect(mockUseNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3500 }); // Adjust timeout to be slightly longer than setTimeout in component
  });

  it('should show error message on API failure', async () => {
    // Mock mockMutate to simulate a failed API call
    mockMutate.mockRejectedValue({ response: { data: { error: 'Invalid token' } } });

    renderComponent();
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await userEvent.type(newPasswordInput, 'StrongPassword123!');
    await userEvent.type(confirmNewPasswordInput, 'StrongPassword123!');
    await userEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({ token: 'test-token', newPassword: 'StrongPassword123!' });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid token');
    });
    expect(screen.queryByText('Invalid token')).not.toBeInTheDocument();
  });
});