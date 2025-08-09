import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from './UserForm';
import axios from '../../api/axios';

// Mock axios
jest.mock('../../api/axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockOnClose.mockClear();
    mockOnSave.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();
    mockedAxios.get.mockClear(); // Ensure get is also cleared if used elsewhere
  });

  // Test Case 1: Renders correctly for adding a new user
  test('renders correctly for adding a new user', () => {
    render(<UserForm onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByRole('heading', { name: /Add New User/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Password:/i)).toBeRequired();
    expect(screen.getByLabelText(/Name:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Role:/i)).toHaveValue('USER');
    expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  // Test Case 2: Renders correctly for editing an existing user
  test('renders correctly for editing an existing user', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
    };
    render(<UserForm user={mockUser} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByRole('heading', { name: /Edit User/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toHaveValue(mockUser.email);
    expect(screen.getByLabelText(/Password:/i)).not.toBeRequired(); // Password not required for edit
    expect(screen.getByLabelText(/Name:/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/Role:/i)).toHaveValue(mockUser.role);
    expect(screen.getByRole('button', { name: /Update User/i })).toBeInTheDocument();
  });

  // Test Case 3: Handles input changes
  test('handles input changes', () => {
    render(<UserForm onClose={mockOnClose} onSave={mockOnSave} />);

    const emailInput = screen.getByLabelText(/Email:/i);
    fireEvent.change(emailInput, { target: { name: 'email', value: 'new@example.com' } });
    expect(emailInput).toHaveValue('new@example.com');

    const passwordInput = screen.getByLabelText(/Password:/i);
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'newpassword' } });
    expect(passwordInput).toHaveValue('newpassword');

    const nameInput = screen.getByLabelText(/Name:/i);
    fireEvent.change(nameInput, { target: { name: 'name', value: 'New Name' } });
    expect(nameInput).toHaveValue('New Name');

    const roleSelect = screen.getByLabelText(/Role:/i);
    fireEvent.change(roleSelect, { target: { name: 'role', value: 'ADMIN' } });
    expect(roleSelect).toHaveValue('ADMIN');
  });

  // Test Case 4: Submits new user data successfully
  test('submits new user data successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'User created' } });

    render(<UserForm onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { name: 'email', value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { name: 'password', value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { name: 'name', value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/Role:/i), { target: { name: 'role', value: 'USER' } });

    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

    expect(screen.getByRole('button', { name: /Saving.../i })).toBeDisabled();

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith('/admin/users', {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'USER',
      });
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // Test Case 5: Submits updated user data successfully
  test('submits updated user data successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    };
    mockedAxios.put.mockResolvedValueOnce({ data: { message: 'User updated' } });

    render(<UserForm user={mockUser} onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { name: 'name', value: 'Updated Name' } });
    fireEvent.change(screen.getByLabelText(/Role:/i), { target: { name: 'role', value: 'ADMIN' } });

    fireEvent.click(screen.getByRole('button', { name: /Update User/i }));

    expect(screen.getByRole('button', { name: /Saving.../i })).toBeDisabled();

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(`/admin/users/${mockUser.id}`, {
        email: mockUser.email, // Email should remain unchanged if not edited
        password: '', // Password should be empty as it's not pre-filled
        name: 'Updated Name',
        role: 'ADMIN',
      });
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // Test Case 6: Displays error message on API failure
  test('displays error message on API failure', async () => {
    const errorMessage = 'Network Error';
    mockedAxios.post.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    render(<UserForm onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { name: 'email', value: 'fail@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { name: 'password', value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
    expect(screen.getByRole('button', { name: /Add User/i })).not.toBeDisabled(); // Button should be re-enabled
  });

  // Test Case 7: Calls onClose when Cancel button is clicked
  test('calls onClose when Cancel button is clicked', () => {
    render(<UserForm onClose={mockOnClose} onSave={mockOnSave} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
