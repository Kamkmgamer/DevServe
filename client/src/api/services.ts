import api from "./axios";

// This is a placeholder. We will define the Service type later.
interface Service {
  id: string;
  name: string;
  description: string;
}

export const getServices = async (): Promise<Service[]> => {
  const response = await api.get("//services");
  return response.data;
};

export const getServiceById = async (id: string): Promise<Service> => {
  const response = await api.get(`//services/${id}`);
  return response.data;
};