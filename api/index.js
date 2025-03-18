const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Models
const User = require('./models/User');
const Project = require('./models/Project');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Veuillez vous authentifier' });
  }
};

// Routes d'authentification
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, firstName, lastName });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, email, firstName, lastName } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Identifiants invalides');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Identifiants invalides');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Routes des projets
app.get('/api/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      userId: req.user._id,
      columns: {
        'À faire': { id: '1', tickets: [] },
        'En cours': { id: '2', tickets: [] },
        'Terminé': { id: '3', tickets: [] }
      }
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) throw new Error('Projet non trouvé');
    res.json(project);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) throw new Error('Projet non trouvé');
    res.json({ message: 'Projet supprimé' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post('/api/projects/:id/columns', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) throw new Error('Projet non trouvé');

    project.columns = req.body.columns;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = app; 