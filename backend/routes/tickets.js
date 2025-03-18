const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ticket = require('../models/ticket');

// Create a new ticket
router.post('/', auth, async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      createdBy: req.user.id
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a ticket
router.put('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a ticket
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Move a ticket
router.put('/:id/move', auth, async (req, res) => {
  try {
    const { sourceColumn, targetColumn } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    ticket.column = targetColumn;
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 