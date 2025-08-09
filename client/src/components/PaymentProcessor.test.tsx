
import { render, screen, waitFor, act } from '@testing-library/react';
import { PaymentProcessor } from './PaymentProcessor';
import { Toaster } from 'react-hot-toast';

// Mock the @paypal/react-paypal-js library
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalButtons: jest.fn(({ createOrder, onApprove, onError }) => {
    // Simulate button click and payment flow
    const handleApprove = async () => {
      const order = await createOrder({}, { order: { create: jest.fn().mockResolvedValue('order-id') } });
      await onApprove({ orderID: 'test-order-id' }, { order: { authorize: jest.fn().mockResolvedValue({ purchase_units: [{ payments: { authorizations: [{ id: 'auth-id' }] } }] }) } });
    };

    const handleError = () => {
      onError(new Error('Payment failed'));
    };

    return (
      <div>
        <button onClick={handleApprove}>Approve Payment</button>
        <button onClick={handleError}>Trigger Error</button>
      </div>
    );
  }),
}));

// Mock the api module
jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({}),
  },
}));

describe('PaymentProcessor', () => {
  it('should render the component and handle successful payment', async () => {
    render(
      <div>
        <Toaster />
        <PaymentProcessor orderId="test-order" totalAfterDiscount="100.00" />
      </div>
    );

    expect(screen.getByText('Complete Your Payment')).toBeInTheDocument();

    // Simulate a click on the approve button
    await act(async () => {
      screen.getByText('Approve Payment').click();
    });

    await waitFor(() => {
      expect(screen.getByText("Order placed! We'll begin our technical review shortly.")).toBeInTheDocument();
    });
  });

  it('should handle payment failure', async () => {
    render(
      <div>
        <Toaster />
        <PaymentProcessor orderId="test-order" totalAfterDiscount="100.00" />
      </div>
    );

    // Simulate a click on the error button
    screen.getByText('Trigger Error').click();

    await waitFor(() => {
      expect(screen.getByText('Payment failed: Payment failed')).toBeInTheDocument();
    });
  });
});
