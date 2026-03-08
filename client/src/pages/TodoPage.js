import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaCog, FaEdit, FaTrash } from "react-icons/fa";
import SettingsModal from "../components/SettingsModal";

export default function TodoPage() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [task, setTask] = useState("");
  const [error, setError] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editError, setEditError] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  
  // State for User Info
  const [userData, setUserData] = useState({ name: "User", avatar: null });

  /* ================= FETCH DATA ================= */
  const fetchTodos = useCallback(async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/login");
    }
  }, [navigate]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);


  useEffect(() => {
    fetchTodos();
    fetchUsers();
    const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");

      setUserData({
        name: res.data.name,
        avatar: res.data.profileImage || "/default-avatar.png"
      });

    } catch (err) {
      console.error(err);
    }
  };

  fetchUser();
  }, [fetchTodos, fetchUsers]);

  /* ================= HANDLERS ================= */
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

 const addTodo = async (e) => {
  e.preventDefault();

  if (!task.trim()) return setError("⚠ Task cannot be empty");
  if (!assignedTo) return setError("⚠ Please select a user");

  try {
    setLoadingAdd(true);
    setError("");

    await api.post("/todos", { task, assignedTo });

    setTask("");
    setAssignedTo("");
    fetchTodos();
  } catch (err) {
    setError(err.response?.data?.error || "Something went wrong");
  } finally {
    setLoadingAdd(false);
  }
};

  const deleteTodo = async (id) => {
    try {
      setLoadingDeleteId(id);
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const openEditModal = (todo) => {
    setEditingId(todo._id);
    setEditTask(todo.task);
    setEditError("");
    setIsEditOpen(true);
  };

  const updateTodo = async () => {
    if (!editTask.trim()) return setEditError("⚠ Task cannot be empty");
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

  const changeStatus = async (id, status) => {
    try {
      await api.put(`/todos/${id}`, { status });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Task Manager</h1>
            <p style={styles.subtitle}>MERN Stack Application</p>
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <FaCog
              style={styles.settingsIcon}
              onClick={() => setIsSettingsOpen(true)}
            />
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>

        {/* --- NEW CENTERED WELCOME SECTION --- */}
        <div style={styles.welcomeContainer}>
           <img src={userData.avatar} alt="Avatar" style={styles.userAvatar} />
           <h2 style={styles.welcomeText}>Welcome, {userData.name}</h2>
        </div>

        {/* ADD FORM */}
        <form onSubmit={addTodo} style={styles.form}>
          <input
            type="text"
            placeholder="Enter Task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onFocus={() => setError("")}
            style={styles.input}
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            style={styles.select}
          >
            <option value="">Assign To</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loadingAdd} style={styles.addBtn}>
            {loadingAdd ? "..." : "Create"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {/* TODO LIST TABLE */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "25%" }}>Task</th>
                <th style={{ ...styles.th, width: "15%" }}>Status</th>
                <th style={{ ...styles.th, width: "15%" }}>Assigned To</th>
                <th style={{ ...styles.th, width: "15%" }}>Created By</th>
                <th style={{ ...styles.th, width: "15%" }}>Updated By</th>
                <th style={{ ...styles.th, width: "15%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todos.map((todo) => (
                <tr key={todo._id}>
                  <td style={styles.td}>{todo.task}</td>
                  <td style={styles.td}>
                    <select
                      value={todo.status || "Pending"}
                      onChange={(e) => changeStatus(todo._id, e.target.value)}
                      style={styles.statusSelect}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td style={styles.td}>{todo.assignedTo?.name || todo.assignedTo?.email || "-"}</td>
                  <td style={styles.td}>{todo.createdBy?.name || todo.createdBy?.email || "-"}</td>
                  <td style={styles.td}>{todo.updatedBy?.name || todo.updatedBy?.email || "-"}</td>
                  <td style={styles.actionTd}>
                    <button onClick={() => openEditModal(todo)} style={styles.editActionBtn}><FaEdit /></button>
                    <button onClick={() => deleteTodo(todo._id)} disabled={loadingDeleteId === todo._id} style={styles.deleteActionBtn}>
                      {loadingDeleteId === todo._id ? "..." : <FaTrash />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {isEditOpen && editingId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalHeading}>Update Task</h3>
            <input
              type="text"
              value={editTask}
              onChange={(e) => setEditTask(e.target.value)}
              onFocus={() => setEditError("")}
              style={{...styles.input, color: "#000", marginBottom: "10px"}}
            />
            {editError && <p style={styles.error}>{editError}</p>}
            <button onClick={updateTodo} disabled={loadingUpdate} style={styles.updateBtn}>
              {loadingUpdate ? "Updating..." : "Save Changes"}
            </button>
            <button onClick={() => !loadingUpdate && setIsEditOpen(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #16222a, #3a6073)", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Segoe UI', Roboto, sans-serif", padding: "20px" },
  container: { width: "100%", maxWidth: "950px", background: "#263238", padding: "35px", borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", color: "#fff" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  
  // Centered Welcome Style
  welcomeContainer: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "25px" },
  userAvatar: {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  border: "3px solid #00b0ff",
  marginBottom: "10px",
  objectFit: "cover"
},
  welcomeText: { margin: 0, fontSize: "1.5rem" },

  title: { fontSize: "2.2rem", margin: 0, fontWeight: "bold" },
  subtitle: { fontSize: "14px", opacity: 0.6, margin: "5px 0 0 0" },
  settingsIcon: { fontSize: "22px", cursor: "pointer", color: "#fff", transition: "0.3s" },
  logoutBtn: { padding: "10px 20px", borderRadius: "8px", border: "none", background: "#ff5252", color: "#fff", cursor: "pointer", fontWeight: "bold" },
  form: { display: "flex", gap: "15px", marginBottom: "15px", alignItems: "center" },
  input: { width: "100%", boxSizing: "border-box",flex: 3, padding: "12px 18px", borderRadius: "10px", border: "none", outline: "none", fontSize: "16px", background: "#fff", color: "#333" },
  select: { flex: 1, padding: "12px", borderRadius: "10px", border: "none", outline: "none", background: "#fff", color: "#333", cursor: "pointer" },
  addBtn: { padding: "12px 25px", borderRadius: "10px", border: "none", background: "#00b0ff", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  error: { color: "#ff8a80", fontSize: "14px", marginBottom: "15px", fontWeight: "500" },
  tableContainer: { marginTop: "20px", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 10px", borderBottom: "2px solid rgba(255,255,255,0.1)", fontSize: "14px", color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  td: { padding: "15px 10px", fontSize: "14px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  statusSelect: { background: "#fff", color: "#000", padding: "6px 10px", borderRadius: "6px", border: "none", fontSize: "13px", cursor: "pointer", fontWeight: "500" },
  actionTd: { display: "flex", gap: "8px", padding: "15px 10px", justifyContent: "center" },
  editActionBtn: { background: "#00b0ff", border: "none", color: "#fff", padding: "8px", borderRadius: "6px", cursor: "pointer", display: "flex" },
  deleteActionBtn: { background: "#ff5252", border: "none", color: "#fff", padding: "8px", borderRadius: "6px", cursor: "pointer", display: "flex" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#37474f", padding: "30px", borderRadius: "15px", width: "400px", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" },
  modalHeading: { textAlign: "center", marginBottom: "20px" },
  updateBtn: { marginTop: "10px", width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#4caf50", color: "#fff", cursor: "pointer", fontWeight: "bold" },
  cancelBtn: { marginTop: "10px", width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#78909c", color: "#fff", cursor: "pointer" },
};