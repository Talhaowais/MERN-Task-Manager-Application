// migrations/addAssignedToField.js
const mongoose = require("mongoose");
require("dotenv").config();
const Todo = require("../models/Todo");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Only select todos missing assignedTo
    const todos = await Todo.find({ assignedTo: { $exists: false } });

    console.log(`Found ${todos.length} todos missing assignedTo`);

    for (const todo of todos) {
      if (!todo.user) {
        console.warn(`Skipping todo ${todo._id} because user is missing`);
        continue;
      }

      // Assign assignedTo = user
      todo.assignedTo = todo.user;

      try {
        await todo.save();
        console.log(`Updated todo ${todo._id}`);
      } catch (err) {
        console.error(`Failed to update todo ${todo._id}:`, err.message);
      }
    }

    console.log("Migration completed!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    mongoose.disconnect();
  });