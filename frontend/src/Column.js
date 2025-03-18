import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Typography, Button, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Ticket from './Ticket';

const Column = ({ id, title, tickets = [], onMoveTicket, onCreateTicket, onEditTicket, onDeleteTicket }) => {
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortedTickets, setSortedTickets] = useState(tickets);

  useEffect(() => {
    handleSort(sortOrder);
  }, [tickets, sortOrder]);

  const handleSort = (order) => {
    const priorityValues = { high: 3, medium: 2, low: 1 };
    const sorted = [...tickets].sort((a, b) => {
      const priorityA = priorityValues[a.priority] || 0;
      const priorityB = priorityValues[b.priority] || 0;
      return order === 'desc' ? priorityB - priorityA : priorityA - priorityB;
    });
    setSortedTickets(sorted);
  };

  const toggleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'ticket',
    drop: (item) => {
      if (item.columnId !== id) {
        onMoveTicket(item.id, item.columnId, id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <Paper
      ref={drop}
      elevation={1}
      sx={{
        p: 2,
        bgcolor: isOver ? 'rgba(0, 0, 0, 0.04)' : 'background.paper',
        height: 'fit-content',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">{title}</Typography>
          <IconButton 
            size="small" 
            onClick={toggleSort}
            sx={{ 
              transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s'
            }}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onCreateTicket()}
        >
          Ajouter
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: 1,
          minHeight: 0
        }}
      >
        {sortedTickets.map((ticket) => (
          <Ticket
            key={ticket.id}
            ticket={ticket}
            columnId={id}
            onEdit={() => onEditTicket(ticket)}
            onDelete={() => onDeleteTicket(ticket.id)}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default Column; 