import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Container, Grid, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Switch } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import { useDrag, useDrop } from 'react-dnd';

const Column = ({ title, tickets, onDrop, onTicketClick, deleteTicket }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'ticket',
    drop: (item) => onDrop(item.ticket, item.sourceColumn, title),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <Box
      ref={drop}
      sx={{
        width: 300,
        minHeight: 500,
        bgcolor: isOver ? '#f0f0f0' : 'background.paper',
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
        {title}
      </Typography>
      {tickets.map((ticket) => (
        <Ticket
          key={ticket.id}
          ticket={ticket}
          onClick={() => onTicketClick(ticket)}
          sourceColumn={title}
        />
      ))}
    </Box>
  );
};

const Ticket = ({ ticket, onClick, sourceColumn }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'ticket',
    item: { ticket, sourceColumn },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const priorityColors = {
    high: '#ef5350',
    medium: '#fb8c00',
    low: '#66bb6a'
  };

  return (
    <Card
      ref={drag}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        mb: 2,
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s ease-in-out',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: priorityColors[ticket.priority] || '#757575',
              mr: 1
            }}
          />
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            {ticket.content}
          </Typography>
        </Box>
        {ticket.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {ticket.description}
          </Typography>
        )}
        <Box
          onClick={onClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {ticket.comments?.length || 0} commentaire(s)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const ProjectBoard = () => {
  const API_URL = 'https://jira-clone-backend-jj1q326im-toms-projects-36b08638.vercel.app';
  const [columns, setColumns] = useState({
    'À faire': { id: 1, tickets: [] },
    'En cours': { id: 2, tickets: [] },
    'Terminé': { id: 3, tickets: [] }
  });
  const [open, setOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentImage, setCommentImage] = useState(null);
  const [viewMode, setViewMode] = useState('board');

  useEffect(() => {
    const savedColumns = localStorage.getItem('columns');
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('columns', JSON.stringify(columns));
  }, [columns]);

  const handleDrop = (ticket, sourceColumn, targetColumn) => {
    if (sourceColumn === targetColumn) return;

    setColumns(prev => {
      const newColumns = { ...prev };
      newColumns[sourceColumn].tickets = newColumns[sourceColumn].tickets.filter(t => t.id !== ticket.id);
      newColumns[targetColumn].tickets = [...newColumns[targetColumn].tickets, ticket];
      return newColumns;
    });
  };

  const handleOpen = (ticket = null) => {
    setCurrentTicket(ticket);
    if (ticket) {
      const savedComments = localStorage.getItem(`comments_${ticket.id}`);
      setComments(savedComments ? JSON.parse(savedComments) : []);
    } else {
      setComments([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentTicket(null);
    setNewComment('');
    setCommentImage(null);
  };

  const handleSave = () => {
    if (currentTicket) {
      setColumns(prev => {
        const newColumns = { ...prev };
        Object.keys(newColumns).forEach(columnTitle => {
          const columnTickets = newColumns[columnTitle].tickets;
          const ticketIndex = columnTickets.findIndex(t => t.id === currentTicket.id);
          if (ticketIndex !== -1) {
            columnTickets[ticketIndex] = {
              ...currentTicket,
              comments: comments
            };
          }
        });
        return newColumns;
      });
      localStorage.setItem(`comments_${currentTicket.id}`, JSON.stringify(comments));
    } else {
      const newTicket = {
        id: Date.now(),
        content: document.getElementById('ticketTitle').value,
        description: document.getElementById('ticketDescription').value,
        priority: document.getElementById('ticketPriority').value,
        comments: []
      };
      setColumns(prev => ({
        ...prev,
        'À faire': {
          ...prev['À faire'],
          tickets: [...prev['À faire'].tickets, newTicket]
        }
      }));
    }
    handleClose();
  };

  const handleAddComment = () => {
    if (newComment.trim() || commentImage) {
      const comment = {
        id: Date.now(),
        text: newComment,
        image: commentImage
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setCommentImage(null);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeColumn = (columnTitle) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      delete newColumns[columnTitle];
      return newColumns;
    });
  };

  const addProject = (projectName) => {
    setColumns(prev => ({
      ...prev,
      [projectName]: {
        id: Date.now(),
        tickets: []
      }
    }));
  };

  const sortTickets = (columnTitle) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      
      newColumns[columnTitle].tickets.sort((a, b) => {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      return newColumns;
    });
  };

  const deleteComment = (commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const deleteTicketFromModal = () => {
    if (currentTicket) {
      setColumns(prev => {
        const newColumns = { ...prev };
        Object.keys(newColumns).forEach(columnTitle => {
          newColumns[columnTitle].tickets = newColumns[columnTitle].tickets.filter(
            t => t.id !== currentTicket.id
          );
        });
        return newColumns;
      });
      localStorage.removeItem(`comments_${currentTicket.id}`);
      handleClose();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#1976d2' }}>
            Project Board
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleOpen(null)}
            sx={{ textTransform: 'none' }}
          >
            Ajouter un ticket
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
          {Object.entries(columns).map(([title, column]) => (
            <Box key={title} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                  onClick={() => sortTickets(title)}
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  Trier par priorité
                </Button>
              </Box>
              <Column
                title={title}
                tickets={column.tickets}
                onDrop={handleDrop}
                onTicketClick={handleOpen}
              />
            </Box>
          ))}
        </Box>

        <Dialog 
          open={open} 
          onClose={handleClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {currentTicket ? currentTicket.content : "Créer un nouveau ticket"}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              ×
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: '70vh' }}>
              {!currentTicket ? (
                <>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="ticketTitle"
                    label="Titre"
                    type="text"
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    margin="dense"
                    id="ticketDescription"
                    label="Description"
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="priority-label">Priorité</InputLabel>
                    <Select
                      labelId="priority-label"
                      id="ticketPriority"
                      defaultValue="medium"
                      label="Priorité"
                    >
                      <MenuItem value="low">Basse</MenuItem>
                      <MenuItem value="medium">Moyenne</MenuItem>
                      <MenuItem value="high">Haute</MenuItem>
                    </Select>
                  </FormControl>
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography paragraph>
                    {currentTicket.description || "Aucune description"}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Commentaires
                  </Typography>
                  {comments.length === 0 ? (
                    <Typography color="text.secondary">
                      Aucun commentaire pour le moment
                    </Typography>
                  ) : (
                    comments.map((comment) => (
                      <Card key={comment.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography>{comment.text}</Typography>
                          {comment.image && (
                            <Box sx={{ mt: 2 }}>
                              <img 
                                src={comment.image} 
                                alt="Comment attachment" 
                                style={{ maxWidth: '100%', maxHeight: 200 }}
                              />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </>
              )}
            </Box>
            {currentTicket && (
              <Box sx={{ width: '300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={deleteTicketFromModal}
                  sx={{ mb: 2 }}
                >
                  Supprimer le ticket
                </Button>
                <TextField
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    color="primary"
                    component="label"
                    sx={{ padding: '4px' }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <UploadIcon />
                  </IconButton>
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() && !commentImage}
                  >
                    Envoyer
                  </Button>
                </Box>
                {commentImage && (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <img
                      src={commentImage}
                      alt="Upload preview"
                      style={{ maxWidth: '100%', maxHeight: 200 }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'background.paper'
                      }}
                      onClick={() => setCommentImage(null)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button onClick={handleSave} variant="contained">
              Sauvegarder
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndProvider>
  );
};

export default ProjectBoard; 