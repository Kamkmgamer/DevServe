/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the api instance used by services
const getMock = jest.fn<() => Promise<{ data: unknown }>>();
const postMock = jest.fn<() => Promise<{ data: unknown }>>();
jest.mock('./axios', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
  },
}));

import { getServices, getServiceById, changePassword, requestPasswordReset, resetPassword } from './services';

beforeEach(() => {
  getMock.mockReset();
  postMock.mockReset();
});

describe('api/services', () => {
  it('getServices returns data', async () => {
    const data = [{ id: '1', name: 'A', description: '', price: 1, features: [], category: 'c', thumbnailUrl: null, imageUrls: [], createdAt: '', updatedAt: '' }];
    getMock.mockResolvedValueOnce({ data });
    const res = await getServices();
    expect(getMock).toHaveBeenCalledWith('/services');
    expect(res).toEqual(data);
  });

  it('getServiceById returns data', async () => {
    const data = { id: '42', name: 'B', description: '', price: 2, features: [], category: 'c', thumbnailUrl: null, imageUrls: [], createdAt: '', updatedAt: '' };
    getMock.mockResolvedValueOnce({ data });
    const res = await getServiceById('42');
    expect(getMock).toHaveBeenCalledWith('/services/42');
    expect(res).toEqual(data);
  });

  it('changePassword posts payload and returns response data', async () => {
    const payload = { currentPassword: 'old', newPassword: 'new' };
    postMock.mockResolvedValueOnce({ data: { ok: true } });
    const res = await changePassword(payload);
    expect(postMock).toHaveBeenCalledWith('/auth/change-password', payload);
    expect(res).toEqual({ ok: true });
  });

  it('requestPasswordReset posts email and returns response data', async () => {
    const payload = { email: 'a@b.com' };
    postMock.mockResolvedValueOnce({ data: { ok: true } });
    const res = await requestPasswordReset(payload);
    expect(postMock).toHaveBeenCalledWith('/auth/forgot-password', payload);
    expect(res).toEqual({ ok: true });
  });

  it('resetPassword posts token/newPassword and returns response data', async () => {
    const payload = { token: 't', newPassword: 'Nn123456!' };
    postMock.mockResolvedValueOnce({ data: { ok: true } });
    const res = await resetPassword(payload);
    expect(postMock).toHaveBeenCalledWith('/auth/reset-password', payload);
    expect(res).toEqual({ ok: true });
  });
});
