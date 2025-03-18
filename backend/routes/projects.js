const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Create a new project
router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      owner: req.user._id,
      members: [req.user._id]
    });
    await project.save();
    res.status(201).send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });
    res.send(projects);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a specific project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });
    if (!project) {
      return res.status(404).send();
    }
    res.send(project);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update project columns
router.patch('/:id/columns', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });
    
    if (!project) {
      return res.status(404).send();
    }

    project.columns = req.body.columns;
    await project.save();
    res.send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Add comment to ticket
router.post('/:projectId/tickets/:ticketId/comments', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).send();
    }

    let ticketFound = false;
    project.columns.forEach(column => {
      const ticket = column.tickets.id(req.params.ticketId);
      if (ticket) {
        ticket.comments.push({
          ...req.body,
          createdBy: req.user._id
        });
        ticketFound = true;
      }
    });

    if (!ticketFound) {
      return res.status(404).send({ error: 'Ticket not found' });
    }

    await project.save();
    res.send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete comment from ticket
router.delete('/:projectId/tickets/:ticketId/comments/:commentId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).send();
    }

    let ticketFound = false;
    project.columns.forEach(column => {
      const ticket = column.tickets.id(req.params.ticketId);
      if (ticket) {
        ticket.comments.pull(req.params.commentId);
        ticketFound = true;
      }
    });

    if (!ticketFound) {
      return res.status(404).send({ error: 'Ticket not found' });
    }

    await project.save();
    res.send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router; 