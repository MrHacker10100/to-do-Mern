import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ text: "", priority: "", deadline: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://todo-crud-api.onrender.com/todos");
      const data = await res.json();
      setTodos(data.data);
    } catch (err) {
      setError("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async () => {
    if (!form.text || !form.priority || !form.deadline)
      return toast.error("Fill all fields");

    try {
      setSubmitting(true);
      if (editingId) {
        await fetch(`http://localhost:4000/update/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Todo updated");
      } else {
        await fetch("http://localhost:4000/create-todo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Todo added");
      }

      setForm({ text: "", priority: "", deadline: "" });
      setEditingId(null);
      setShowModal(false);
      fetchTodos();
    } catch {
      toast.error("Failed to save todo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (todoId) => {
    try {
      setSubmitting(true);
      await fetch(`http://localhost:4000/${todoId}`, { method: "PATCH" });
      toast.success("Todo deleted");
      fetchTodos();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (todo) => {
    setForm({
      text: todo.text,
      priority: todo.priority,
      deadline: todo.deadline,
    });
    setEditingId(todo._id);
    setShowModal(true);
  };

  const openAddModal = () => {
    setForm({ text: "", priority: "", deadline: "" });
    setEditingId(null);
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-medium">Loading...</div>
    );

  if (error)
    return (
      <div className="text-center mt-20 text-red-600 font-medium">{error}</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto relative">
        <ToastContainer />

        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
          Todo Manager
        </h1>

        <button
          onClick={openAddModal}
          className="block w-full sm:w-auto mx-auto sm:mx-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold mb-6"
        >
          Add New Todo
        </button>

        <div className="space-y-5">
          {todos.length === 0 ? (
            <p className="text-center text-gray-600">No todos yet.</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {todo.text}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>Priority:</strong> {todo.priority}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Deadline:</strong> {todo.deadline}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 space-x-3">
                  <button
                    onClick={() => handleEdit(todo)}
                    className="px-4 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(todo._id)}
                    className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    disabled={submitting}
                  >
                    {submitting ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              {editingId ? "Edit Todo" : "Add New Todo"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="text"
                placeholder="Task"
                value={form.text}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddOrUpdate}
                className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition ${
                  submitting ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={submitting}
              >
                {submitting
                  ? "Processing..."
                  : editingId
                  ? "Update Todo"
                  : "Add Todo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
