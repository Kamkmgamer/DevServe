import api from "./axios";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  category: string;
  thumbnailUrl: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export const getServices = async (): Promise<Service[]> => {
  const response = await api.get("/services");
  return response.data;
};

export const getServiceById = async (id: string): Promise<Service> => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (data: ChangePasswordPayload) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};

export const requestPasswordReset = async (data: { email: string }) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

export const resetPassword = async (data: { token: string; newPassword: string }) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};