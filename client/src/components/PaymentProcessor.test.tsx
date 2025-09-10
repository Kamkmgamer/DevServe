import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PaymentProcessor } from './PaymentProcessor';
import { Toaster } from 'react-hot-toast';

// Mock the @paypal/react-paypal-js library
interface PayPalButtonsProps {
  createOrder: (data: unknown, actions: unknown) => Promise<string>;
  onApprove: (data: { orderID: string }, actions: { order: { authorize: () => Promise<{ purchase_units: { payments: { authorizations: { id: string }[] }[] }[] }> } }) => Promise<void>;
  onError: (err: Error) => void;
}

jest.mock('@paypal/react-paypal-js', () => ({
  PayPalButtons: jest.fn(({ createOrder, onApprove, onError }: PayPalButtonsProps) => {
    // Simulate button click and payment flow
    const handleApprove = async () => {
      const create = jest.fn<() => Promise<string>>().mockResolvedValue('order-id');
      await createOrder({}, { order: { create } });

      const authorize = jest.fn<() => Promise<{ purchase_units: { payments: { authorizations: { id: string }[] }[] }[] }>>().mockResolvedValue({
        purchase_units: [
          { payments: { authorizations: [{ id: 'auth-id' }] } }
        ],
      });
      await onApprove(
        { orderID: 'test-order-id' },
        { order: { authorize } }
      );
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
jest.mock('../api/axios', () => {
  const post = jest.fn(async () => ({}));
  return {
    __esModule: true,
    default: { post },
  };
});

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
