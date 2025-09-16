import {
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../../api/blog';
import { Request, Response } from 'express';
import { db } from '../../lib/db';
import * as schema from '../../lib/schema';
import { eq } from 'drizzle-orm';

// Mock the db
jest.mock('../../lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

const mockedDb = jest.mocked(db);

describe('Blog API', () => {
  describe('getAllBlogPosts', () => {
    it('should return all blog posts', async () => {
      const req = {} as Request;
      const res = { json: jest.fn() } as unknown as Response;
      const posts = [{ id: '1', title: 'Test Post' }];

      const mockQuery = { execute: jest.fn().mockResolvedValue(posts) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery)
      } as any);

      await getAllBlogPosts(req, res);

      expect(res.json).toHaveBeenCalledWith(posts);
    });
  });

  describe('getBlogPostById', () => {
    it('should return a blog post by id', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const post = { id: '1', title: 'Test Post' };

      const mockQuery = { execute: jest.fn().mockResolvedValue([post]) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery)
      } as any);

      await getBlogPostById(req, res);

      expect(res.json).toHaveBeenCalledWith(post);
    });

    it('should return 404 if the post is not found', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      const mockQuery = { execute: jest.fn().mockResolvedValue([]) };
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery)
      } as any);

      await getBlogPostById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });
  });

  describe('createBlogPost', () => {
    it('should create a new blog post', async () => {
      const req = { body: { title: 'New Post' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const post = { id: '1', title: 'New Post' };

      (db.insert as jest.Mock).mockResolvedValue(post);

      await createBlogPost(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(post);
    });

    it('should return 400 if creation fails', async () => {
      const req = { body: { title: 'New Post' } } as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (db.insert as jest.Mock).mockRejectedValue(new Error());

      await createBlogPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create' });
    });
  });

  describe('updateBlogPost', () => {
    it('should update a blog post', async () => {
      const req = { params: { id: '1' }, body: { title: 'Updated Post' } } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;
      const post = { id: '1', title: 'Updated Post' };

      (db.update as jest.Mock).mockResolvedValue(post);

      await updateBlogPost(req, res);

      expect(res.json).toHaveBeenCalledWith(post);
    });

    it('should return 400 if update fails', async () => {
      const req = { params: { id: '1' }, body: { title: 'Updated Post' } } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (db.update as jest.Mock).mockRejectedValue(new Error());

      await updateBlogPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update' });
    });
  });

  describe('deleteBlogPost', () => {
    it('should delete a blog post', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = { send: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      await deleteBlogPost(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 if deletion fails', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn(() => res) } as unknown as Response;

      (db.delete as jest.Mock).mockRejectedValue(new Error());

      await deleteBlogPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete' });
    });
  });
});
