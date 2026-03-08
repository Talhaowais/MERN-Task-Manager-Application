const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
   profileImage: {
    type: String,
    default: "",
    allowNull: true,
  },

  birthDate: {
    type: Date,
    allowNull: true,
  },

  pronoun: {
    type: String,
    allowNull: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);