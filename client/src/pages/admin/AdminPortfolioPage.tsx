import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

const AdminPortfolioPage = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetch = async () => {
    const res = await api.get<PortfolioItem[]>("/portfolio");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  const doDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/portfolio/${id}`);
    fetch();
  };

  if (loading) return <Container>Loading…</Container>;

  return (
    <Container className="py-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <Button onClick={() => nav("/admin/portfolio/new")}>
          Add Item
        </Button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Title</th>
            <th className="border px-2 py-1">Created</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td className="border px-2 py-1">{it.title}</td>
              <td className="border px-2 py-1">
                {new Date(it.createdAt).toLocaleDateString()}
              </td>
              <td className="border px-2 py-1 space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => nav(`/admin/portfolio/${it.id}/edit`)}
                >
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => doDelete(it.id)}>
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

export default AdminPortfolioPage;