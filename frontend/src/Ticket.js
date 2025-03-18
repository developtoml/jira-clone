import React from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography, Box, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CommentIcon from '@mui/icons-material/Comment';

const priorityColors = {
  low: '#2ECC71',
  medium: '#F1C40F',
  high: '#E74C3C'
};

const Ticket = ({ ticket, columnId, onEdit }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'ticket',
    item: { id: ticket.id, columnId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Paper
      ref={drag}
      elevation={1}
      sx={{
        p: 1.5,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.04)',
          '& .actions': {
            opacity: 1
          }
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Typography 
          variant="subtitle2" 
          sx={{ 
            wordBreak: 'break-word',
            flex: 1,
            mr: 1
          }}
        >
          {ticket.title}
        </Typography>
        <Box 
          className="actions" 
          sx={{ 
            opacity: 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          {ticket.comments?.length > 0 && (
            <Box display="flex" alignItems="center" sx={{ color: 'text.secondary' }}>
              <CommentIcon fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {ticket.comments.length}
              </Typography>
            </Box>
          )}
          <IconButton size="small" onClick={() => onEdit(ticket)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {(ticket.description || ticket.priority) && (
        <Box mt={1} display="flex" alignItems="center" justifyContent="space-between">
          {ticket.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flex: 1,
                mr: 1
              }}
            >
              {ticket.description}
            </Typography>
          )}
          {ticket.priority && (
            <Chip
              size="small"
              label={ticket.priority}
              sx={{
                bgcolor: `${priorityColors[ticket.priority]}20`,
                color: priorityColors[ticket.priority],
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default Ticket; 