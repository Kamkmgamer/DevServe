import { getCart, addToCart, removeFromCart } from '../../api/cart';
import { AuthRequest } from '../../middleware/auth';
import { Response } from 'express';
import { db } from '../../lib/db';
import * as schema from '../../lib/schema';
import { eq } from 'drizzle-orm';

// Mock the db for unit tests
jest.mock('../../lib/db', () => ({
  __esModule: true,
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

const mockedDb = jest.mocked(db);

describe('Cart API', () => {
  const mockUserId = 'user123';
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { user: { id: mockUserId } };
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
      const mockQuery = { execute: jest.fn().mockResolvedValue([mockCart]) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue(mockQuery)
        })
      } as any);

      await getCart(req as AuthRequest, res as Response);

      expect(mockedDb.select).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCart);
    });

    it('should return null if the user has no cart', async () => {
      const mockQuery = { execute: jest.fn().mockResolvedValue([]) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue(mockQuery)
        })
      } as any);

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

      const mockQuery = { execute: jest.fn().mockResolvedValue([]) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue(mockQuery)
        })
      } as any);
      (db.insert as jest.Mock).mockReturnValue({
        into: jest.fn().mockReturnValue({
          values: jest.fn().mockResolvedValue([newCart])
        })
      });
      (db.insert as jest.Mock).mockReturnValue({
        into: jest.fn().mockReturnValue({
          values: jest.fn().mockResolvedValue([newItem])
        })
      });

      req.body = { serviceId, quantity };
      await addToCart(req as AuthRequest, res as Response);

      expect(db.insert).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newItem);
    });

    it('should add a new item to an existing cart', async () => {
      const serviceId = 'service1';
      const quantity = 1;
      const existingCart = { id: 'cart1', userId: mockUserId };
      const newItem = { id: 'newItem1', cartId: existingCart.id, serviceId, quantity };

      const mockQuery = { execute: jest.fn().mockResolvedValue([existingCart]) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue(mockQuery)
        })
      } as any);
      (db.insert as jest.Mock).mockReturnValue({
        into: jest.fn().mockReturnValue({
          values: jest.fn().mockResolvedValue([newItem])
        })
      });

      req.body = { serviceId, quantity };
      await addToCart(req as AuthRequest, res as Response);

      expect(db.insert).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newItem);
    });

    it('should update quantity if item already exists in cart', async () => {
      const serviceId = 'service1';
      const quantity = 1;
      const existingCart = { id: 'cart1', userId: mockUserId };
      const existingItem = { id: 'item1', cartId: existingCart.id, serviceId, quantity: 2 };
      const updatedItem = { ...existingItem, quantity: 3 };

      const mockQueryCart = { execute: jest.fn().mockResolvedValue([existingCart]) };
      const mockQueryItem = { execute: jest.fn().mockResolvedValue([existingItem]) };
      mockedDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue(mockQueryCart)
        })
      } as any).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue(mockQueryItem)
        })
      } as any);
      (db.update as jest.Mock).mockReturnValue({
        table: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(updatedItem)
          })
        })
      });

      req.body = { serviceId, quantity };
      await addToCart(req as AuthRequest, res as Response);

      expect(db.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(updatedItem);
    });
  });

  describe('removeFromCart', () => {
    it('should remove an item from the cart', async () => {
      const itemId = 'item1';
      const existingItem = { id: itemId, cart: { userId: mockUserId } };

      const mockQuery = { execute: jest.fn().mockResolvedValue([existingItem]) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue(mockQuery)
        })
      } as any);
      (db.delete as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(null)
        })
      });

      req.params = { itemId };
      await removeFromCart(req as AuthRequest, res as Response);

      expect(db.select).toHaveBeenCalled();
      expect(db.delete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if item not found in user\'s cart', async () => {
      const itemId = 'item1';

      const mockQuery = { execute: jest.fn().mockResolvedValue([]) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue(mockQuery)
        })
      } as any);

      req.params = { itemId };
      await removeFromCart(req as AuthRequest, res as Response);

      expect(db.select).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Item not found in your cart.' });
    });
  });
});