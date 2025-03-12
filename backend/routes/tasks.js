
const express = require('express');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const router = express.Router();
const nodemailer = require('nodemailer');

// Authentication middleware
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vinuureddy555@gmail.com', // Replace with your email
    pass: 'pwiz rvxa sots bcyy'   // Replace with your app password
  }
});

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Apply auth middleware to all routes
router.use(auth);

// Get all tasks for current user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, files } = req.body;
    
    const task = new Task({
      title,
      description,
      dueDate,
      files: files || [],
      completed: false,
      user: req.userId
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update task fields
    Object.keys(updates).forEach(update => {
      task[update] = updates[update];
    });
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Mark a task as complete
router.patch('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    task.completed = true;
    await task.save();
    
    // Send completion email
    if (task.user && task.user.email) {
      const mailOptions = {
        from: 'vinuureddy555@gmail.com',
        to: task.user.email,
        subject: 'Task Completed: ' + task.title,
        text: `Hello,\n\nYour task "${task.title}" has been successfully completed. Great job!\n\nRegards,\nTask Manager`
      };
      await transporter.sendMail(mailOptions);
      console.log(`Completion email sent to ${task.user.email} for task: ${task.title}`);
    }
    
    res.json(task);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
