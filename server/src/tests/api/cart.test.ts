import { getCart, addToCart, removeFromCart } from '../../api/cart';
import { AuthRequest } from '../../middleware/auth';
import { Response } from 'express';
import prisma from '../../lib/prisma';

// Mock the prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Cart API', () => {
  const mockUserId = 'user123';
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { userId: mockUserId };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(), // Correctly mock chainable status
      send: jest.fn(),
    };
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return the user\'s cart with items', async () => {
      const mockCart = {
        id: 'cart1',
        userId: mockUserId,
        items: [
          { id: 'item1', serviceId: 'service1', quantity: 1, service: { name: 'Service A' } },
        ],
      };
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);

      await getCart(req as AuthRequest, res as Response);

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: { items: { include: { service: true } } },
      });
      expect(res.json).toHaveBeenCalledWith(mockCart);
    });

    it('should return null if the user has no cart', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null);

      await getCart(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith(null);
    });
  });

  describe('addToCart', () => {
    it('should create a new cart and add an item if no cart exists', async () => {
      const serviceId = 'service1';
      const quantity = 1;
      const newCart = { id: 'newCart1', userId: mockUserId };
      const newItem = { id: 'newItem1', cartId: newCart.id, serviceId, quantity };

      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.cart.create as jest.Mock).mockResolvedValue(newCart);
      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.cartItem.create as jest.Mock).mockResolvedValue(newItem);

      req.body = { serviceId, quantity };
      await addToCart(req as AuthRequest, res as Response);

      expect(prisma.cart.create).toHaveBeenCalledWith({ data: { userId: mockUserId } });
      expect(prisma.cartItem.create).toHaveBeenCalledWith({ data: { cartId: newCart.id, serviceId, quantity } });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newItem);
    });

    it('should add a new item to an existing cart', async () => {
      const serviceId = 'service1';
      const quantity = 1;
      const existingCart = { id: 'cart1', userId: mockUserId };
      const newItem = { id: 'newItem1', cartId: existingCart.id, serviceId, quantity };

      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(existingCart);
      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.cartItem.create as jest.Mock).mockResolvedValue(newItem);

      req.body = { serviceId, quantity };
      await addToCart(req as AuthRequest, res as Response);

      expect(prisma.cart.create).not.toHaveBeenCalled();
      expect(prisma.cartItem.create).toHaveBeenCalledWith({ data: { cartId: existingCart.id, serviceId, quantity } });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newItem);
    });

    it('should update quantity if item already exists in cart', async () => {
      const serviceId = 'service1';
      const quantity = 1;
      const existingCart = { id: 'cart1', userId: mockUserId };
      const existingItem = { id: 'item1', cartId: existingCart.id, serviceId, quantity: 2 };
      const updatedItem = { ...existingItem, quantity: 3 };

      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(existingCart);
      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(existingItem);
      (prisma.cartItem.update as jest.Mock).mockResolvedValue(updatedItem);

      req.body = { serviceId, quantity };
      await addToCart(req as AuthRequest, res as Response);

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      expect(res.json).toHaveBeenCalledWith(updatedItem);
    });
  });

  describe('removeFromCart', () => {
    it('should remove an item from the cart', async () => {
      const itemId = 'item1';
      const existingItem = { id: itemId, cart: { userId: mockUserId } };

      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(existingItem);
      (prisma.cartItem.delete as jest.Mock).mockResolvedValue(null);

      req.params = { itemId };
      await removeFromCart(req as AuthRequest, res as Response);

      expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({
        where: { id: itemId, cart: { userId: mockUserId } },
      });
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: itemId } });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if item not found in user\'s cart', async () => {
      const itemId = 'item1';

      (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      req.params = { itemId };
      await removeFromCart(req as AuthRequest, res as Response);

      expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({
        where: { id: itemId, cart: { userId: mockUserId } },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Item not found in your cart.' });
    });
  });
});