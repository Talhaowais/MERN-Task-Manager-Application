const mongoose = require("mongoose");
const User = require("../models/User"); // adjust path if needed

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/your_db_name", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrate() {
  try {
    // Update users only if these fields are missing
    const result = await User.updateMany(
      {
        $or: [
          { profileImage: { $exists: false } },
          { birthDate: { $exists: false } },
          { pronoun: { $exists: false } },
        ],
      },
      {
        $set: {
          profileImage: "",
          birthDate: null,
          pronoun: null,
        },
      }
    );

    console.log("Migration completed:", result.modifiedCount, "users updated.");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    mongoose.connection.close();
  }
}

migrate();