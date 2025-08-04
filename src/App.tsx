import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { GrandExchangeProvider } from './contexts/GrandExchangeContext';
import Dashboard from './pages/Dashboard';
import FlippingPage from './pages/FlippingPage';

// Criação do tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a3c6c', // Azul escuro do RuneScape
      light: '#4d6b9a',
      dark: '#001242',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffbf00', // Dourado do RuneScape
      light: '#fff24c',
      dark: '#c78f00',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"RuneScape"', // Fonte do RuneScape, se disponível
    ].join(','),
    h1: {
      fontWeight: 700,
      color: '#1a3c6c',
    },
    h2: {
      fontWeight: 600,
      color: '#1a3c6c',
    },
    h3: {
      fontWeight: 500,
      color: '#1a3c6c',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
});

// Componente de navegação
const Navigation = () => {
  const location = useLocation();
  
  return (
    <AppBar position="static" color="primary" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              color: 'white', 
              textDecoration: 'none',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box component="span" sx={{ color: '#ffbf00', mr: 1 }}>RS3</Box> Market Monitor
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              component={Link} 
              to="/" 
              color="inherit" 
              variant={location.pathname === '/' ? 'outlined' : 'text'}
              sx={{ 
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Início
            </Button>
            <Button 
              component={Link} 
              to="/flipping" 
              color="inherit"
              variant={location.pathname === '/flipping' ? 'contained' : 'text'}
              sx={{ 
                backgroundColor: location.pathname === '/flipping' ? '#ffbf00' : 'transparent',
                color: location.pathname === '/flipping' ? '#000' : '#fff',
                '&:hover': {
                  backgroundColor: location.pathname === '/flipping' ? '#e6ac00' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Oportunidades de Flipping
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Componente principal
const AppContent = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/flipping" element={<FlippingPage />} />
        </Routes>
      </Box>
      <Box component="footer" sx={{ py: 3, backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="textSecondary" align="center">
            RuneScape 3 Market Monitor - Dados não oficiais. RuneScape é uma marca registrada da Jagex Ltd.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

// Componente raiz da aplicação
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <GrandExchangeProvider>
          <AppContent />
        </GrandExchangeProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
