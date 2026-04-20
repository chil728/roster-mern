import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import { Plus, X, Pencil } from "lucide-react";
import api from "../lib/api";
import { toast } from "react-toastify";
import Button from "../components/common/Button";
import IconButton from "../components/common/IconButton";
import Badge from "../components/common/Badge";
import TextField from "../components/common/TextField";
import Card from "../components/common/Card";
import PageContainer from "../components/common/PageContainer";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Type = () => {
  const { isLoggedIn, types, getUserTypes } = useContext(AuthContext);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bgColor: "#3B82F6",
    textColor: "#FFFFFF",
  });

  useEffect(() => {
    if (isLoggedIn) {
      getUserTypes();
    }
  }, [isLoggedIn, getUserTypes]);

  const getRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  };

  const getReadableTextColor = (hexColor) => {
    const hex = (hexColor || "").replace("#", "");
    if (hex.length !== 6) {
      return "#1E293B";
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 180 ? "#1E293B" : "#FFFFFF";
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", description: "", bgColor: "#3B82F6", textColor: "#FFFFFF" });
  };

  const handleEdit = (type) => {
    setEditingId(type._id);
    setFormData({
      name: type.name,
      description: type.description,
      bgColor: type.bgColor || "#3B82F6",
      textColor: type.textColor || "#FFFFFF",
    });
    setIsCreating(true);
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this type?")) {
  //     try {
  //       const { data } = await api.delete(`/types/${id}`);
  //       if (data.success) {
  //         toast.success("Type deleted successfully");
  //         getUserTypes();
  //       } else {
  //         toast.error(data.message);
  //       }
  //     } catch (error) {
  //       toast.error(error.message);
  //     }
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data;
      if (editingId) {
        const response = await api.put(`/types/${editingId}`, formData);
        data = response.data;
      } else {
        const response = await api.post("/types", formData);
        data = response.data;
      }

      if (data.success) {
        toast.success(editingId ? "Type updated successfully" : "Type created successfully");
        resetForm();
        getUserTypes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <NavBar />
      <PageContainer className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Types</h1>
            <Button
              onClick={() => {
                if (isCreating) {
                  resetForm();
                } else {
                  const randomBgColor = getRandomColor().toUpperCase();
                  setFormData({
                    name: "",
                    description: "",
                    bgColor: randomBgColor,
                    textColor: getReadableTextColor(randomBgColor),
                  });
                  setIsCreating(true);
                }
              }}
              leftIcon={isCreating ? <X size={18} /> : <Plus size={18} />}
              variant="primary"
              size="md"
            >
              {isCreating ? "Cancel" : "Create Type"}
            </Button>
          </div>

          {isCreating && (
            <Card className="mb-6 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
                {editingId ? "Edit Shift Type" : "New Shift Type"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <TextField
                      label="Name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Morning Shift"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-gray-300">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value.toUpperCase() })}
                        className="h-9 w-16 cursor-pointer rounded border border-slate-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700"
                      />
                      <input
                        type="text"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value.toUpperCase() })}
                        className="w-full rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-base text-black dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-gray-300">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value.toUpperCase() })}
                        className="h-9 w-16 cursor-pointer rounded border border-slate-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700"
                      />
                      <input
                        type="text"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value.toUpperCase() })}
                        className="w-full rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-base text-black dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <TextField
                  label="Description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., 09:00 - 17:00"
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="md">
                    {editingId ? "Update Type" : "Save Type"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          {isLoggedIn && types ? (
            <Card className="overflow-hidden p-0">
              <div className="divide-y divide-slate-100 dark:divide-gray-700">
                {types.map((type, key) => (
                  <div
                    key={key} 
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-gray-700"
                  >
                    <Badge tone="slate" dotColor={type.bgColor}>
                      {type.bgColor}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white">{type.name}</h3>
                      <p className="truncate text-sm text-slate-500 dark:text-gray-400">{type.description}</p>
                    </div>
                    <IconButton
                      icon={<Pencil size={18} />}
                      label="Edit Type"
                      tone="info"
                      onClick={() => handleEdit(type)}
                    />
                  </div>
                ))}
                
                {types.length === 0 && (
                  <div className="p-12 text-center text-slate-500 dark:text-gray-400">
                    No shift types found. Create one to get started.
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          )}
      </PageContainer>
    </>
  );
};

export default Type;
