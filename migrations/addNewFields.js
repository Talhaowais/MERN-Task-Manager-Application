// migrations/addNewFields.js
const mongoose = require("mongoose");
require("dotenv").config();
const Todo = require("../models/Todo");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    const todos = await Todo.find();

    for (const todo of todos) {
      let updated = false;

      // Set default status if missing
      if (!todo.status) {
        todo.status = "Pending";
        updated = true;
      }

      // Set createdBy and updatedBy if missing
      if (!todo.createdBy && todo.user) {
        todo.createdBy = todo.user;
        updated = true;
      }
      if (!todo.updatedBy && todo.user) {
        todo.updatedBy = todo.user;
        updated = true;
      }

      // Set assignedTo if missing
      if (!todo.assignedTo && todo.user) {
        todo.assignedTo = todo.user; // assigning to creator as default
        updated = true;
      }

      if (updated) {
        try {
          await todo.save();
          console.log(`Updated todo ${todo._id}`);
        } catch (err) {
          console.error(`Failed to update todo ${todo._id}:`, err.message);
        }
      }
    }

    console.log("Migration completed!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    mongoose.disconnect();
  });