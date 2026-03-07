import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import api from "../api/api";
import { supabase } from "../supabaseClient";

export default function SettingsModal({ isOpen, onClose }) {
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [birthDate, setBirthDate] = useState("");
  const [pronoun, setPronoun] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch current user info
  useEffect(() => {
    if (!isOpen) return;

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");

        setProfileImage(res.data.profileImage || "");
        setBirthDate(
          res.data.birthDate ? res.data.birthDate.split("T")[0] : ""
        );
        setPronoun(res.data.pronoun || "Mr");
        setUserId(res.data._id);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [isOpen]);

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Preview selected image instantly
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);
  };

  // Upload + Save
  const handleUpload = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      let imageUrl = profileImage;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
          .from("MERN-Profile-Images")
          .upload(fileName, imageFile, { upsert: true });

        if (error) throw error;

        const { data } = supabase.storage
          .from("MERN-Profile-Images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // Update backend
      await api.put(`/auth/update-profile/${userId}`, {
        profileImage: imageUrl,
        birthDate,
        pronoun,
      });

      setProfileImage(imageUrl);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <FaTimes style={styles.closeIcon} onClick={onClose} />

        <h2 style={styles.heading}>Profile Settings</h2>

        <div style={styles.imageContainer}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" style={styles.image} />
          ) : (
            <div style={styles.placeholder}>No Image</div>
          )}
        </div>

        <input type="file" onChange={handleFileChange} style={styles.input} />

        <label style={styles.label}>
          Date of Birth
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={styles.input}
          />
        </label>

        <div style={styles.radioGroup}>
          {["Mr", "Miss", "Mrs"].map((p) => (
            <label key={p} style={styles.radioLabel}>
              <input
                type="radio"
                value={p}
                checked={pronoun === p}
                onChange={() => setPronoun(p)}
              />
              {p}
            </label>
          ))}
        </div>

        <button onClick={handleUpload} disabled={loading} style={styles.saveBtn}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#1f1f1f",
    padding: "30px",
    borderRadius: "20px",
    width: "400px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  heading: {
    marginBottom: "20px",
  },
  closeIcon: {
    position: "absolute",
    top: "15px",
    right: "15px",
    cursor: "pointer",
  },
  imageContainer: {
    marginBottom: "15px",
  },
  image: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  placeholder: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#555",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#ccc",
    fontSize: "12px",
  },
  input: {
    margin: "8px 0",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    width: "100%",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginTop: "10px",
  },
  radioGroup: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  saveBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#00c851",
    cursor: "pointer",
  },
};