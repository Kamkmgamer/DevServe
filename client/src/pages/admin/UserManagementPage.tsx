import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { User } from '../../types';
import UserForm from '../../components/admin/UserForm';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const UserManagementPage: React.FC = () => {
  const { user: loggedInUser } = useAuth(); // Get logged-in user from AuthContext
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string, userRole: string) => {
    if (!loggedInUser) {
      setError("You are not authenticated.");
      return;
    }

    // Prevent self-deletion
    if (loggedInUser.id === userId) {
      setError("You cannot delete your own account.");
      return;
    }

    // Only SUPERADMIN can delete ADMIN users
    if (userRole === "ADMIN" && loggedInUser.role !== "SUPERADMIN") {
      setError("Only superadmins can delete admin accounts.");
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        fetchUsers(); // Refresh the list after deletion
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete user.');
        console.error(err);
      }
    }
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentUser(null);
  };

  const handleSaveForm = () => {
    fetchUsers();
    handleCloseForm();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <button
        onClick={handleAddUser}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add New User
      </button>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300 font-semibold">ID</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Email</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Name</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Role</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 px-4">{user.id}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.name || 'N/A'}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.role)}
                    className={`bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm ${loggedInUser?.role !== "SUPERADMIN" && user.role === "ADMIN" ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loggedInUser?.role !== "SUPERADMIN" && user.role === "ADMIN"}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <UserForm
          user={currentUser}
          onClose={handleCloseForm}
          onSave={handleSaveForm}
        />
      )}
    </div>
  );
};

export default UserManagementPage;