const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const ticketSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  description: String,
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Low'
  },
  comments: [commentSchema]
});

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  tickets: [ticketSchema]
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  columns: {
    type: Object,
    default: {
      'À faire': { id: 1, tickets: [] },
      'En cours': { id: 2, tickets: [] },
      'Terminé': { id: 3, tickets: [] }
    }
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project; 