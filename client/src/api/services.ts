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