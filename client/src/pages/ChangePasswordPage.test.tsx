import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChangePasswordPage from './ChangePasswordPage';
import { changePassword } from '../api/services'; // Now this import will get the mock
import { mockMutate } from '../../__mocks__/@tanstack/react-query';
// import toast from 'react-hot-toast'; // No longer needed as component uses internal state

const queryClient = new QueryClient();

const renderComponent = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <ChangePasswordPage />
    </QueryClientProvider>
  );

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear(); // Clear mockMutate calls before each test
    // (toast.success as jest.Mock).mockClear(); // No longer needed
    // (toast.error as jest.Mock).mockClear();   // No longer needed
  });

  it('should render password inputs and submit button', () => {
    renderComponent();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('should show validation error for weak new password', async () => {
    renderComponent();
    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    await userEvent.type(currentPasswordInput, 'CurrentPassword123!');
    await userEvent.type(newPasswordInput, 'weak');
    await userEvent.type(confirmNewPasswordInput, 'weak');
    await userEvent.click(submitButton);

    expect(await screen.findByText('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled(); // Should not call mutate if validation fails
    // expect(toast.error).not.toHaveBeenCalled(); // No toast error for client-side validation
  });

  it('should show validation error if new passwords do not match', async () => {
    renderComponent();
    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    await userEvent.type(currentPasswordInput, 'CurrentPassword123!');
    await userEvent.type(newPasswordInput, 'StrongPassword123!');
    await userEvent.type(confirmNewPasswordInput, 'StrongPassword123'); // Mismatch
    await userEvent.click(submitButton);

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled(); // Should not call mutate if validation fails
    // expect(toast.error).not.toHaveBeenCalled(); // No toast error for client-side validation
  });

  it('should call changePassword on valid submission and show success message', async () => {
    // Mock mockMutate to simulate a successful API call
    mockMutate.mockResolvedValue({});

    renderComponent();
    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    await userEvent.type(currentPasswordInput, 'CurrentPassword123!');
    await userEvent.type(newPasswordInput, 'NewStrongPassword123!');
    await userEvent.type(confirmNewPasswordInput, 'NewStrongPassword123!');
    await userEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      currentPassword: 'CurrentPassword123!',
      newPassword: 'NewStrongPassword123!',
    });
    await waitFor(() => {
      expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
    });
    // expect(screen.queryByText('Password changed successfully')).not.toBeInTheDocument(); // No longer relevant
  });

  it('should show error message on API failure', async () => {
    // Mock mockMutate to simulate a failed API call
    mockMutate.mockRejectedValue({ response: { data: { error: 'Invalid current password' } } });

    renderComponent();
    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    await userEvent.type(currentPasswordInput, 'WrongPassword!');
    await userEvent.type(newPasswordInput, 'NewStrongPassword123!');
    await userEvent.type(confirmNewPasswordInput, 'NewStrongPassword123!');
    await userEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      currentPassword: 'WrongPassword!',
      newPassword: 'NewStrongPassword123!',
    });
    await waitFor(() => {
      expect(screen.getByText('Invalid current password')).toBeInTheDocument();
    });
    // expect(screen.queryByText('Invalid current password')).not.toBeInTheDocument(); // No longer relevant
  });
});