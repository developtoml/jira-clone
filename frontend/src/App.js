import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ProjectList from './ProjectList';
import ProjectBoard from './ProjectBoard';
import Login from './Login';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedProjectId');
    window.location.href = '/';
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Button
            component={Link}
            to="/"
            color="inherit"
            startIcon={<HomeIcon />}
            sx={{ mr: 2 }}
          >
            Projets
          </Button>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Jira Clone
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/project/:projectId" element={<ProjectBoard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App; 