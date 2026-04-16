import React, { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import NavBar from "../components/NavBar";
import { Trash2, Edit } from "lucide-react";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PageContainer from "../components/common/PageContainer";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import IconButton from "../components/common/IconButton";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/users");
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const { data } = await api.delete("/auth/delete", {
          data: { id },
        });
        if (data.success) {
          toast.success("User deleted successfully");
          fetchUsers();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <NavBar />
      <PageContainer className="p-2 py-8">
        <h1 className="text-3xl font-bold mb-4">Users</h1>
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b-2 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-4 py-4">
                  Name
                </th>
                <th scope="col" className="px-4 py-4">
                  Email
                </th>
                <th scope="col" className="px-4 py-4">
                  Role
                </th>
                <th scope="col" className="px-4 py-4 text-center">
                  Types
                </th>
                <th scope="col" className="px-4 py-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-4 font-medium">{user.username}</td>
                  <td className="px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4">
                    <Badge tone={user.role === "admin" ? "purple" : "blue"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">{user.typesCount}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <IconButton
                        icon={<Edit size={18} />}
                        label="Edit User"
                        tone="info"
                        onClick={() => toast.info("Edit feature coming soon")}
                      />
                      <IconButton
                        icon={<Trash2 size={18} />}
                        label="Delete User"
                        tone="danger"
                        onClick={() => handleDelete(user._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No users found.
            </div>
          )}
        </Card>
      </PageContainer>
    </div>
  );
};

export default Dashboard;
