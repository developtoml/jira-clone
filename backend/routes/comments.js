const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/comment');

// Get comments for a ticket
router.get('/:ticketId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ ticketId: req.params.ticketId });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new comment
router.post('/', auth, async (req, res) => {
  try {
    const comment = new Comment({
      ...req.body,
      createdBy: req.user.id
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 