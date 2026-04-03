const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Todo = require('../models/Todo');

// Get all todos for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create a todo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newTodo = new Todo({
      task: req.body.task,
      deadline: req.body.deadline,
      userId: req.user.id
    });
    const todo = await newTodo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update a todo (toggle status or edit task)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (todo.userId.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

    const { task, completed, deadline } = req.body;
    if (task !== undefined) todo.task = task;
    if (completed !== undefined) todo.completed = completed;
    if (deadline !== undefined) todo.deadline = deadline;

    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete a todo
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (todo.userId.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

    await todo.deleteOne();
    res.json({ message: 'Todo removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
