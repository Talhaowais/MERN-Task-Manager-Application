import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Eye, EyeOff } from "lucide-react"; // 👈 added

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 NEW
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("⚠ All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/auth/signup", { name, email, password });
      navigate("/todos");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Signup</h2>

        <form onSubmit={handleSignup} style={styles.form}>
          {/* NAME */}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setError("")}
            style={{ ...styles.input, width: "100%" }}
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setError("")}
            style={{ ...styles.input, width: "100%" }}
          />

          {/* PASSWORD WITH EYE */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setError("")}
              style={{
                ...styles.input,
                width: "100%",
                paddingRight: "45px",
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                color: "#aaa",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* BUTTON */}
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.linkText}>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} style={styles.link}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

/* STYLES (UNCHANGED) */
export const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    fontFamily: "Segoe UI, sans-serif",
  },
  container: {
    width: "400px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    color: "#fff",
  },
  title: { textAlign: "center", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },
  submitBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#00c6ff",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "13px",
    marginTop: "10px",
  },
  linkText: {
    marginTop: "15px",
    fontSize: "14px",
    textAlign: "center",
    opacity: 0.8,
  },
  link: { color: "#00c6ff", cursor: "pointer" },
};