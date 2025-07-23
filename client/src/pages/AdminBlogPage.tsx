import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Pencil } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
};

const AdminBlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get<BlogPost[]>("/blog");
      setPosts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const doDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await api.delete(`/blog/${id}`);
    fetch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gray-50"
    >
      <Container className="py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Blog Posts</h1>
          <Button
            onClick={() => nav("/admin/blog/new")}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition-all duration-300"
          >
            Add Post
          </Button>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full text-left border-collapse">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700">Title</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700">Created</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {posts.map((p, index) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-purple-50 transition-all"
                    >
                      <td className="px-6 py-4">{p.title}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => nav(`/admin/blog/${p.id}/edit`)}
                          className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all"
                        >
                          <Pencil size={16} /> Edit
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => doDelete(p.id)}
                          className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-all"
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </motion.div>
  );
};

export default AdminBlogPage;
