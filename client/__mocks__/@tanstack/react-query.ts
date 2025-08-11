import React from 'react';

export const QueryClient = jest.fn();
export const QueryClientProvider = ({ children, client }: { children: React.ReactNode; client?: any }) => children;

// Create a mock for the mutate function that can be controlled by tests
export const mockMutate = jest.fn();

export const useMutation = jest.fn((options) => ({
  mutate: async (variables: any) => {
    try {
      // Simulate an asynchronous operation
      const result = await mockMutate(variables);
      // If mockMutate resolves, call onSuccess
      if (options && options.onSuccess) {
        options.onSuccess(result);
      }
    } catch (error) {
      // If mockMutate rejects, call onError
      if (options && options.onError) {
        options.onError(error);
      }
    }
  },
  isPending: false,
  // Add other properties if your components use them, e.g., isLoading, isError, data, error
}));

export const useQuery = jest.fn(() => ({
  data: undefined,
  isLoading: false,
  isError: false,
  error: undefined,
}));