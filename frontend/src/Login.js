import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const API_URL = 'http://localhost:5000/api';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [credentials, setCredentials] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Identifiants invalides');
      }

      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    if (credentials.password !== credentials.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}
    >
      <Box
        sx={{
          p: 4,
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow: 1,
          width: '100%',
          maxWidth: 400
        }}
      >
        <h2>{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {isRegistering && (
          <>
            <TextField
              margin="dense"
              label="Prénom"
              fullWidth
              value={credentials.firstName}
              onChange={(e) => setCredentials({ ...credentials, firstName: e.target.value })}
              disabled={loading}
            />
            <TextField
              margin="dense"
              label="Nom"
              fullWidth
              value={credentials.lastName}
              onChange={(e) => setCredentials({ ...credentials, lastName: e.target.value })}
              disabled={loading}
            />
          </>
        )}
        <TextField
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Mot de passe"
          type="password"
          fullWidth
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          disabled={loading}
        />
        {isRegistering && (
          <TextField
            margin="dense"
            label="Confirmer le mot de passe"
            type="password"
            fullWidth
            value={credentials.confirmPassword}
            onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
            disabled={loading}
          />
        )}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => setIsRegistering(!isRegistering)}
            disabled={loading}
          >
            {isRegistering ? 'Déjà un compte ?' : 'Créer un compte'}
          </Button>
          <LoadingButton
            variant="contained"
            onClick={isRegistering ? handleRegister : handleLogin}
            loading={loading}
          >
            {isRegistering ? 'S\'inscrire' : 'Se connecter'}
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 