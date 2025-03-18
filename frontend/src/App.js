import React from 'react';
import ProjectBoard from './ProjectBoard';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ProjectBoard />
    </ThemeProvider>
  );
}

export default App; 