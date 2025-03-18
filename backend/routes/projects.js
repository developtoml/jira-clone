const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Créer un projet
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const project = new Project({
      name,
      userId: req.user.id,
      columns: {
        'À faire': { id: 'todo', tickets: [] },
        'En cours': { id: 'inProgress', tickets: [] },
        'Terminé': { id: 'done', tickets: [] }
      }
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du projet' });
  }
});

// Récupérer tous les projets de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des projets' });
  }
});

// Get a specific project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du projet' });
  }
});

// Mettre à jour les colonnes d'un projet
router.post('/:id/columns', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    project.columns = req.body.columns;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des colonnes' });
  }
});

// Récupérer les colonnes d'un projet
router.get('/:id/columns', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    res.json(project.columns);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des colonnes' });
  }
});

// Add comment to ticket
router.post('/:projectId/tickets/:ticketId/comments', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
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
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Delete comment from ticket
router.delete('/:projectId/tickets/:ticketId/comments/:commentId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
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
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Supprimer un projet
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du projet' });
  }
});

module.exports = router; 