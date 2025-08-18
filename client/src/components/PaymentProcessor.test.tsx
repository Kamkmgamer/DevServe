import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PaymentProcessor } from './PaymentProcessor';
import { Toaster } from 'react-hot-toast';

// Mock the @paypal/react-paypal-js library
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalButtons: jest.fn(({ createOrder, onApprove, onError }: any) => {
    // Simulate button click and payment flow
    const handleApprove = async () => {
      const create = jest.fn<() => Promise<string>>().mockResolvedValue('order-id');
      const createOrderFn = createOrder as unknown as (x: any, y: any) => Promise<any>;
      await createOrderFn({}, { order: { create } });

      const authorize = jest.fn<() => Promise<any>>().mockResolvedValue({
        purchase_units: [
          { payments: { authorizations: [{ id: 'auth-id' }] } }
        ],
      });
      const onApproveFn = onApprove as unknown as (data: any, actions: any) => Promise<any>;
      await onApproveFn(
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
  const post = jest.fn(async (_url: string, _body?: unknown) => ({}));
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

    (expect(screen.getByText('Complete Your Payment')) as any).toBeInTheDocument();

    // Simulate a click on the approve button
    await act(async () => {
      screen.getByText('Approve Payment').click();
    });

    await waitFor(() => {
      (expect(screen.getByText("Order placed! We'll begin our technical review shortly.")) as any).toBeInTheDocument();
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
      (expect(screen.getByText('Payment failed: Payment failed')) as any).toBeInTheDocument();
    });
  });
});
