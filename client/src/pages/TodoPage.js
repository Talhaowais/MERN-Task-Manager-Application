import { useEffect, useState } from "react";
import api from "../api/api";
import TodoCard from "../components/TodoCard";
import { useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import SettingsModal from "../components/SettingsModal";

export default function TodoPage() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [error, setError] = useState("");

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editError, setEditError] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  /* ================= FETCH TODOS ================= */
  const fetchTodos = async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/login");
    }
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ADD TODO ================= */
  const addTodo = async (e) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("⚠ Task cannot be empty");
      return;
    }
    try {
      setLoadingAdd(true);
      setError("");
      await api.post("/todos", { task }); // backend should handle 'user'
      setTask("");
      fetchTodos();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoadingAdd(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteTodo = async (id) => {
    try {
      setLoadingDelete(id);
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDelete(null);
    }
  };

  /* ================= EDIT MODAL ================= */
  const openEditModal = (todo) => {
    setEditingId(todo._id);
    setEditTask(todo.task);
    setEditError("");
    setIsEditOpen(true);
  };

  const updateTodo = async () => {
    if (!editTask.trim()) {
      setEditError("⚠ Task cannot be empty");
      return;
    }
    try {
      setLoadingUpdate(true);
      setEditError("");
      await api.put(`/todos/${editingId}`, { task: editTask });
      setIsEditOpen(false);
      fetchTodos();
    } catch (err) {
      setEditError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER WITH SETTINGS AND LOGOUT */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Task Manager</h1>
            <p style={styles.subtitle}>MERN Stack Application</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <FaCog
              style={styles.settingsIcon}
              onClick={() => setIsSettingsOpen(true)}
            />
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>

        {/* ADD FORM */}
        <form onSubmit={addTodo} style={styles.form}>
          <input
            type="text"
            placeholder="Write your task here..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onFocus={() => setError("")}
            style={styles.input}
          />
          <button type="submit" disabled={loadingAdd} style={styles.addBtn}>
            {loadingAdd ? "Please wait..." : "Create"}
          </button>
        </form>
        {error && <p style={styles.error}>{error}</p>}

        {/* TODO LIST */}
        <div style={styles.listContainer}>
          {todos.map((todo) => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onEdit={openEditModal}
              onDelete={deleteTodo}
              loadingDelete={loadingDelete}
            />
          ))}
        </div>
      </div>

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* EDIT TASK MODAL */}
      {isEditOpen && editingId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalHeading}>Update Task</h3>
            <input
              type="text"
              value={editTask}
              onChange={(e) => setEditTask(e.target.value)}
              onFocus={() => setEditError("")}
              style={styles.input}
            />
            {editError && <p style={styles.error}>{editError}</p>}
            <button
              onClick={updateTodo}
              disabled={loadingUpdate}
              style={styles.updateBtn}
            >
              {loadingUpdate ? "Updating..." : "Save Changes"}
            </button>
            <button
              onClick={() => !loadingUpdate && setIsEditOpen(false)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Segoe UI, sans-serif",
  },
  container: {
    width: "500px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  settingsIcon: {
    fontSize: "20px",
    cursor: "pointer",
    color: "#fff",
  },
  logoutBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#ff4d4d",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  title: { marginBottom: "5px" },
  subtitle: { fontSize: "14px", opacity: 0.7 },
  form: { display: "flex", gap: "10px" },
  input: {
    width: "100%",
    boxSizing: "border-box",
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },
  addBtn: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#00c6ff",
    color: "#fff",
    cursor: "pointer",
  },
  listContainer: { marginTop: "25px" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#1f1f1f",
    padding: "30px",
    borderRadius: "15px",
    width: "350px",
    color: "#fff",
  },
  modalHeading: { textAlign: "center", marginBottom: "15%" },
  updateBtn: {
    marginTop: "15px",
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#00c851",
    color: "#fff",
    cursor: "pointer",
  },
  cancelBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#555",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "13px",
    marginTop: "8px",
  },
};