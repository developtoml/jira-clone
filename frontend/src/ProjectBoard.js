import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Container, Box, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, IconButton, Typography, Divider,
  Select, MenuItem, FormControl, InputLabel, Avatar, ToggleButton,
  List, ListItem, ListItemText, ListItemAvatar, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Menu
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewListIcon from '@mui/icons-material/ViewList';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LoadingButton } from '@mui/lab';
import Column from './Column';
import { API_URL } from './config';

const TicketDialog = ({ open, ticket, onClose, onSave, onDelete }) => {
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    comments: []
  });
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTicketData({
        ...ticket,
        comments: ticket.comments || []
      });
    } else {
      setTicketData({
        title: '',
        description: '',
        priority: 'medium',
        comments: []
      });
    }
  }, [ticket, open]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const success = await onSave(ticketData);
      if (!success) {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';

    const comment = {
      id: Date.now(),
      text: newComment,
      author: fullName,
      createdAt: new Date().toISOString()
    };

    setTicketData(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }));
    setNewComment('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ px: 3, py: 2, bgcolor: 'grey.100' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {ticket ? 'Modifier le ticket' : 'Nouveau ticket'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex' }}>
        <Box flex={2} p={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
          <TextField
            autoFocus
            variant="outlined"
            label="Titre"
            fullWidth
            value={ticketData.title}
            onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Priorité</InputLabel>
            <Select
              value={ticketData.priority}
              onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
              label="Priorité"
            >
              <MenuItem value="low">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2ECC71' }} />
                  Basse
                </Box>
              </MenuItem>
              <MenuItem value="medium">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F1C40F' }} />
                  Moyenne
                </Box>
              </MenuItem>
              <MenuItem value="high">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E74C3C' }} />
                  Haute
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={ticketData.description}
            onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Commentaires
          </Typography>

          <Box 
            sx={{ 
              maxHeight: 'calc(90vh - 450px)',
              overflowY: 'auto',
              mb: 2
            }}
          >
            <List>
              {ticketData.comments.map((comment) => (
                <React.Fragment key={comment.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={comment.text}
                      secondaryTypographyProps={{
                        sx: { mt: 1, whiteSpace: 'pre-wrap' }
                      }}
                    />
                  </ListItem>
                  <Divider component="li" sx={{ my: 1 }} />
                </React.Fragment>
              ))}
            </List>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ajouter un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <IconButton 
              color="primary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              sx={{
                alignSelf: 'flex-end',
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        {ticket && (
          <Button
            color="error"
            onClick={() => onDelete(ticket.id)}
            startIcon={<DeleteIcon />}
          >
            Supprimer
          </Button>
        )}
        <Box flex={1} />
        <Button onClick={onClose}>
          Annuler
        </Button>
        <LoadingButton
          loading={loading}
          variant="contained"
          onClick={handleSave}
          disabled={!ticketData.title.trim()}
        >
          {ticket ? 'Mettre à jour' : 'Créer'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

const BacklogView = ({ columns, onEditTicket, onCreateTicket }) => {
  const [sortOrder, setSortOrder] = useState('desc');
  const allTickets = Object.entries(columns).reduce((acc, [columnName, column]) => {
    return [...acc, ...column.tickets.map(ticket => ({ ...ticket, status: columnName }))];
  }, []);

  const sortedTickets = [...allTickets].sort((a, b) => {
    const priorityValues = { high: 3, medium: 2, low: 1 };
    const priorityA = priorityValues[a.priority] || 0;
    const priorityB = priorityValues[b.priority] || 0;
    return sortOrder === 'desc' ? priorityB - priorityA : priorityA - priorityB;
  });

  const priorityColors = {
    low: '#2ECC71',
    medium: '#F1C40F',
    high: '#E74C3C'
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Titre</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Priorité</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Commentaires</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTickets.map((ticket) => (
            <TableRow key={ticket.id} hover>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>{ticket.description}</TableCell>
              <TableCell>
                <Chip
                  label={ticket.priority}
                  size="small"
                  sx={{
                    bgcolor: `${priorityColors[ticket.priority]}20`,
                    color: priorityColors[ticket.priority],
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}
                />
              </TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{ticket.comments?.length || 0}</TableCell>
              <TableCell>
                <IconButton 
                  size="small" 
                  onClick={() => onEditTicket(ticket, ticket.status)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('board');
  const [ticketDialog, setTicketDialog] = useState({
    open: false,
    ticket: null,
    columnId: null
  });
  const [columnDialog, setColumnDialog] = useState({
    open: false,
    title: ''
  });

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Projet non trouvé');
      }

      const data = await response.json();
      setProject(data);
      setColumns(data.columns);
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/');
    }
  };

  const handleDeleteProject = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleMoveTicket = async (ticketId, sourceColumnId, targetColumnId) => {
    const updatedColumns = { ...columns };
    const sourceTickets = updatedColumns[sourceColumnId].tickets;
    const targetTickets = updatedColumns[targetColumnId].tickets;
    const ticketIndex = sourceTickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex !== -1) {
      const [ticket] = sourceTickets.splice(ticketIndex, 1);
      targetTickets.push(ticket);
      setColumns(updatedColumns);

      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/projects/${projectId}/columns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ columns: updatedColumns })
        });
      } catch (error) {
        console.error('Error updating columns:', error);
      }
    }
  };

  const handleOpenTicketDialog = (ticket = null, columnId = null) => {
    setTicketDialog({
      open: true,
      ticket,
      columnId
    });
  };

  const handleCloseTicketDialog = () => {
    setTicketDialog({
      open: false,
      ticket: null,
      columnId: null
    });
  };

  const handleCreateTicket = async (columnId, ticketData) => {
    const updatedColumns = { ...columns };
    const newTicket = {
      id: Date.now().toString(),
      comments: [],
      ...ticketData
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          columns: {
            ...updatedColumns,
            [columnId]: {
              ...updatedColumns[columnId],
              tickets: [...updatedColumns[columnId].tickets, newTicket]
            }
          }
        })
      });

      if (response.ok) {
        setColumns({
          ...updatedColumns,
          [columnId]: {
            ...updatedColumns[columnId],
            tickets: [...updatedColumns[columnId].tickets, newTicket]
          }
        });
        return true;
      }
      throw new Error('Erreur lors de la création du ticket');
    } catch (error) {
      console.error('Error creating ticket:', error);
      return false;
    }
  };

  const handleUpdateTicket = async (columnId, ticketId, updatedData) => {
    const updatedColumns = { ...columns };
    const column = updatedColumns[columnId];
    const ticketIndex = column.tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex !== -1) {
      const updatedTicket = { 
        ...column.tickets[ticketIndex], 
        ...updatedData,
        comments: updatedData.comments || column.tickets[ticketIndex].comments || []
      };

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/projects/${projectId}/columns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            columns: {
              ...updatedColumns,
              [columnId]: {
                ...column,
                tickets: [
                  ...column.tickets.slice(0, ticketIndex),
                  updatedTicket,
                  ...column.tickets.slice(ticketIndex + 1)
                ]
              }
            }
          })
        });

        if (response.ok) {
          setColumns({
            ...updatedColumns,
            [columnId]: {
              ...column,
              tickets: [
                ...column.tickets.slice(0, ticketIndex),
                updatedTicket,
                ...column.tickets.slice(ticketIndex + 1)
              ]
            }
          });
          return true;
        }
        throw new Error('Erreur lors de la mise à jour du ticket');
      } catch (error) {
        console.error('Error updating ticket:', error);
        return false;
      }
    }
    return false;
  };

  const handleDeleteTicket = async (ticketId) => {
    const { columnId } = ticketDialog;
    const updatedColumns = { ...columns };
    const column = updatedColumns[columnId];
    column.tickets = column.tickets.filter(t => t.id !== ticketId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ columns: updatedColumns })
      });

      if (response.ok) {
        setColumns(updatedColumns);
        handleCloseTicketDialog();
      } else {
        throw new Error('Erreur lors de la suppression du ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const handleSaveTicket = async (ticketData) => {
    const { columnId, ticket } = ticketDialog;
    let success = false;
    
    if (ticket) {
      success = await handleUpdateTicket(columnId, ticket.id, ticketData);
    } else {
      success = await handleCreateTicket(columnId, ticketData);
    }

    if (success) {
      handleCloseTicketDialog();
    }
    return success;
  };

  const handleAddColumn = async () => {
    if (!columnDialog.title.trim()) return;

    const newColumnId = columnDialog.title;
    const updatedColumns = {
      ...columns,
      [newColumnId]: {
        id: Date.now().toString(),
        tickets: []
      }
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ columns: updatedColumns })
      });

      if (response.ok) {
        setColumns(updatedColumns);
        setColumnDialog({ open: false, title: '' });
      }
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    const updatedColumns = { ...columns };
    delete updatedColumns[columnId];

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ columns: updatedColumns })
      });

      if (response.ok) {
        setColumns(updatedColumns);
      }
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  if (!project) {
    return null;
  }

  return (
    <Container>
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <h2>{project.name}</h2>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(e, newView) => newView && setView(newView)}
              size="small"
            >
              <ToggleButton value="board">
                <ViewColumnIcon sx={{ mr: 1 }} />
                Board
              </ToggleButton>
              <ToggleButton value="backlog">
                <ViewListIcon sx={{ mr: 1 }} />
                Backlog
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setColumnDialog({ open: true, title: '' })}
            >
              Ajouter une colonne
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteProject}
            >
              Supprimer le projet
            </Button>
          </Box>
        </Box>

        {view === 'board' ? (
          <DndProvider backend={HTML5Backend}>
            <Box
              display="flex"
              gap={2}
              sx={{
                overflowX: 'auto',
                pb: 2,
                '& > div': {
                  minWidth: 300,
                  maxWidth: 300
                }
              }}
            >
              {Object.entries(columns).map(([columnName, column]) => (
                <Column
                  key={column.id}
                  id={columnName}
                  title={columnName}
                  tickets={column.tickets}
                  onMoveTicket={handleMoveTicket}
                  onCreateTicket={() => handleOpenTicketDialog(null, columnName)}
                  onEditTicket={(ticket) => handleOpenTicketDialog(ticket, columnName)}
                  onDeleteTicket={handleDeleteTicket}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
            </Box>
          </DndProvider>
        ) : (
          <BacklogView
            columns={columns}
            onEditTicket={handleOpenTicketDialog}
            onCreateTicket={handleOpenTicketDialog}
          />
        )}

        <TicketDialog
          open={ticketDialog.open}
          ticket={ticketDialog.ticket}
          onClose={handleCloseTicketDialog}
          onSave={handleSaveTicket}
          onDelete={handleDeleteTicket}
        />

        <Dialog
          open={columnDialog.open}
          onClose={() => setColumnDialog({ open: false, title: '' })}
        >
          <DialogTitle>Nouvelle colonne</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nom de la colonne"
              fullWidth
              value={columnDialog.title}
              onChange={(e) => setColumnDialog({ ...columnDialog, title: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setColumnDialog({ open: false, title: '' })}>
              Annuler
            </Button>
            <Button 
              variant="contained"
              onClick={handleAddColumn}
              disabled={!columnDialog.title.trim()}
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProjectBoard; 