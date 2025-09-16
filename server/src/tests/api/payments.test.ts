import { Request, Response } from 'express';
import { db } from '../../lib/db';
import * as schema from '../../lib/schema';
import { eq } from 'drizzle-orm';

// Mock db
jest.mock('../../lib/db', () => ({
  __esModule: true,
  db: {
    select: jest.fn(),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([])
      })
    }),
    // Mock other methods as needed
  }
}));

const mockedDb = jest.mocked(db);

// Mock paypal utilities
jest.mock('../../lib/paypal', () => ({
  createPayPalOrder: jest.fn(),
  capturePayPalOrder: jest.fn(),
}));

describe('Payments API', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  // Declare these outside beforeEach so they are accessible throughout the describe block
  let createCheckoutSession: typeof import('../../api/payments').createCheckoutSession;
  let createPaypalOrder: typeof import('../../api/payments').createPaypalOrder;
  let capturePaypalOrder: typeof import('../../api/payments').capturePaypalOrder;
  let createPayPalOrder: typeof import('../../lib/paypal').createPayPalOrder;
  let capturePayPalOrder: typeof import('../../lib/paypal').capturePayPalOrder;

  beforeEach(() => {
    // Reset modules to ensure fresh mocks for each test
    jest.resetModules();

    // Mock environment variables before importing payments.ts
    process.env.CLIENT_URL = 'http://localhost:5173';
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';

    // Dynamically mock Stripe
    const mockStripeInstance = {
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
    };
    const MockStripe = jest.fn(() => mockStripeInstance);
    jest.doMock('stripe', () => MockStripe);

    // Re-import payments.ts after mocking Stripe
    const paymentsModule = require('../../api/payments');
    createCheckoutSession = paymentsModule.createCheckoutSession;
    createPaypalOrder = paymentsModule.createPaypalOrder;
    capturePaypalOrder = paymentsModule.capturePaypalOrder;

    // Re-obtain the mocked db and PayPal utilities after resetModules
    const paypalUtils = require('../../lib/paypal');
    createPayPalOrder = paypalUtils.createPayPalOrder;
    capturePayPalOrder = paypalUtils.capturePayPalOrder;

    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a Stripe checkout session for a valid service', async () => {
      const mockService = { id: 'service1', name: 'Test Service', price: 100 };
      const mockSession = { url: 'http://stripe.checkout.url' };

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([mockService]),
          }),
        }),
      } as any);

      (jest.requireMock('stripe') as any).mockImplementation(() => ({
        checkout: {
          sessions: {
            create: jest.fn().mockResolvedValue(mockSession),
          },
        },
      }));

      req.body = { serviceId: 'service1', clientEmail: 'test@example.com' };
      await createCheckoutSession(req as Request, res as Response);

      expect(mockedDb.select).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ url: mockSession.url });
    });

    it('should return 404 if service is not found', async () => {
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      req.body = { serviceId: 'nonexistent', clientEmail: 'test@example.com' };
      await createCheckoutSession(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Service not found' });
    });

    it('should return 500 if Stripe session creation fails', async () => {
      const mockService = { id: 'service1', name: 'Test Service', price: 100 };
      const errorMessage = 'Stripe error';

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([mockService]),
          }),
        }),
      } as any);

      (jest.requireMock('stripe') as any).mockImplementation(() => ({
        checkout: {
          sessions: {
            create: jest.fn().mockRejectedValue(new Error(errorMessage)),
          },
        },
      }));

      req.body = { serviceId: 'service1', clientEmail: 'test@example.com' };
      await createCheckoutSession(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('createPaypalOrder', () => {
    it('should create a PayPal order', async () => {
      const mockOrder = { id: 'paypal-order-id' };
      (createPayPalOrder as jest.Mock).mockResolvedValue(mockOrder);

      req.body = { totalCents: 10000 };
      await createPaypalOrder(req as Request, res as Response);

      expect(createPayPalOrder).toHaveBeenCalledWith(10000);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 500 if PayPal order creation fails', async () => {
      const errorMessage = 'PayPal order error';
      (createPayPalOrder as jest.Mock).mockRejectedValue(new Error(errorMessage));

      req.body = { totalCents: 10000 };
      await createPaypalOrder(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('capturePaypalOrder', () => {
    it('should capture a PayPal order', async () => {
      const mockCapture = { status: 'COMPLETED' };
      (capturePayPalOrder as jest.Mock).mockResolvedValue(mockCapture);

      req.body = { authorizationId: 'auth-id' };
      await capturePaypalOrder(req as Request, res as Response);

      expect(capturePayPalOrder).toHaveBeenCalledWith('auth-id');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCapture);
    });

    it('should return 500 if PayPal order capture fails', async () => {
      const errorMessage = 'PayPal capture error';
      (capturePayPalOrder as jest.Mock).mockRejectedValue(new Error(errorMessage));

      req.body = { authorizationId: 'auth-id' };
      await capturePaypalOrder(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});