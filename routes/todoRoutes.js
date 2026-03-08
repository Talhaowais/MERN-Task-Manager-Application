const express = require("express");
const Todo = require("../models/Todo");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* ================= GET TODOS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= CREATE TODO ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { task, assignedTo } = req.body;

    if (!task)
      return res.status(400).json({ error: "Task cannot be empty" });

    if (!assignedTo)
      return res.status(400).json({ error: "Assigned user is required" });

    const newTodo = await Todo.create({
      task,
      user: req.user._id,
      assignedTo,
    });

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= UPDATE TODO ================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const { task, status } = req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        ...(task && { task }),
        ...(status && { status }),
        updatedBy: req.user._id,
      },
      { new: true }
    );

    if (!todo) return res.status(404).json({ message: "Todo not found" });

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= DELETE TODO ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) return res.status(404).json({ message: "Todo not found" });

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;