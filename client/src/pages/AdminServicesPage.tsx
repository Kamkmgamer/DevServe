import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import api from "../api/axios";
import toast from 'react-hot-toast';

type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
};

const AdminServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const fetch = async () => {
    try {
      const res = await api.get<Service[]>("/services");
      setServices(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const doDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      fetch();
    } catch (e: any) {
      toast.success(e.response?.data?.error || e.message);
    }
  };

  if (loading) return <Container>Loading…</Container>;
  if (error) return <Container><div className="text-red-500">{error}</div></Container>;

  return (
    <Container className="py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Services</h1>
        <Button onClick={() => nav("/admin/services/new")}>Add Service</Button>
      </div>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Category</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td className="border px-4 py-2">{s.name}</td>
              <td className="border px-4 py-2">{s.category}</td>
              <td className="border px-4 py-2">${s.price}</td>
              <td className="border px-4 py-2 space-x-2">
                <Button variant="secondary" onClick={() => nav(`/admin/services/${s.id}/edit`)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => doDelete(s.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
};

export default AdminServicesPage;