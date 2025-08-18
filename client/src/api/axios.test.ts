/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn() },
}));

// Prepare axios mock capturing created instance and interceptors
const mockCreatedApi = {
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockCreatedApi),
  },
}));

// Import module under test AFTER mocks so interceptors are registered on our mock
import api from './axios';
import { toast } from 'react-hot-toast';

const getRegisteredHandlers = () => {
  const reqHandler = (mockCreatedApi.interceptors.request.use as jest.Mock).mock.calls[0][0];
  const resErrorHandler = (mockCreatedApi.interceptors.response.use as jest.Mock).mock.calls[0][1];
  return { reqHandler, resErrorHandler };
};

// Utility to mock window.location.assign and path
const mockLocation = () => {
  const assign = jest.fn();
  const original = window.location;
  Object.defineProperty(window, 'location', {
    value: { ...original, assign, pathname: '/somewhere' },
    writable: true,
  });
  return assign;
};

describe('api/axios configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // reset csrf token cache by re-importing module if needed could be done via jest.resetModules, but tests here avoid persisting
  });

  afterEach(() => {
    // no-op
  });

  it('adds CSRF header on state-changing requests', async () => {
    // Arrange: CSRF endpoint returns token
    (mockCreatedApi.get as jest.Mock).mockResolvedValueOnce({ data: { csrfToken: 'abc123' } });
    const { reqHandler } = getRegisteredHandlers();

    const cfg: any = { method: 'POST', headers: {} };
    const out = await reqHandler(cfg);

    expect(out.headers['x-csrf-token']).toBe('abc123');
  });

  it('does not add CSRF header on GET', async () => {
    const { reqHandler } = getRegisteredHandlers();
    const cfg: any = { method: 'GET', headers: {} };
    const out = await reqHandler(cfg);
    expect(out.headers['x-csrf-token']).toBeUndefined();
  });

  it('handles 400 INVALID_TOKEN by toasting and redirecting', async () => {
    const assign = mockLocation();
    const { resErrorHandler } = getRegisteredHandlers();
    const spyDispatch = jest.spyOn(window, 'dispatchEvent');

    const error = { response: { status: 400, data: { code: 'INVALID_TOKEN', message: 'Bad' } } };
    await expect(resErrorHandler(error as any)).rejects.toBe(error);

    expect((toast.error as jest.Mock)).toHaveBeenCalled();
    expect(spyDispatch).toHaveBeenCalledWith(expect.any(Event));
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('handles 401 by toasting and redirecting', async () => {
    const assign = mockLocation();
    const { resErrorHandler } = getRegisteredHandlers();

    const error = { response: { status: 401, data: { message: 'Nope' } } };
    await expect(resErrorHandler(error as any)).rejects.toBe(error);

    expect((toast.error as jest.Mock)).toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('handles 403/404/500 and default errors by toasting', async () => {
    const { resErrorHandler } = getRegisteredHandlers();

    for (const status of [403, 404, 500, 418]) {
      const error = { response: { status, data: { message: 'x' } } };
      await expect(resErrorHandler(error as any)).rejects.toBe(error);
    }
    expect((toast.error as jest.Mock)).toHaveBeenCalled();
  });

  it('handles network/no-response and request errors', async () => {
    const { resErrorHandler } = getRegisteredHandlers();

    const noResp = { request: {} };
    await expect(resErrorHandler(noResp as any)).rejects.toBe(noResp);

    const reqErr = { message: 'boom' };
    await expect(resErrorHandler(reqErr as any)).rejects.toBe(reqErr);

    expect((toast.error as jest.Mock)).toHaveBeenCalled();
  });
});
