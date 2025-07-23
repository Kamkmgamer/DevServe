import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from "./ContactForm";
import api from '../../api/axios';

jest.mock('../../api/axios');
const mocked = api as jest.Mocked<typeof api>;

beforeEach(() => {
  mocked.post.mockResolvedValue({ data: { message: 'ok' } });
});

test('shows validation errors on empty submit', async () => {
  render(<ContactForm />);
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(await screen.findByText(/name is too short/i)).toBeInTheDocument();
  expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
});

test('submits valid form', async () => {
  render(<ContactForm />);
  fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'Khalil' } });
  fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'contact@khalil.excellence.sd' } });
  fireEvent.input(screen.getByLabelText(/message/i), { target: { value: 'Hello world!!' } });
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  await waitFor(() =>
    expect(mocked.post).toHaveBeenCalledWith('/contact', {
      name: 'Khalil',
      email: 'contact@khalil.excellence.sd',
      message: 'Hello world!!'
    })
  );
});