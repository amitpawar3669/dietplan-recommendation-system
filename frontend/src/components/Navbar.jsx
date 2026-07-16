import React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Button, Box, Container, AppBar, Toolbar, Typography } from '@mui/material'

function Navbar() {
  const navigate = useNavigate()

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: '1.5rem',
              color: 'white',
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
            onClick={() => navigate('/')}
          >
            🍽️ FitMeals
          </Typography>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ color: 'white', textTransform: 'none', fontSize: '1rem', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to="/calculator"
              sx={{ color: 'white', textTransform: 'none', fontSize: '1rem', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Calculator
            </Button>
            <Button
              component={RouterLink}
              to="/meal-planner"
              sx={{ color: 'white', textTransform: 'none', fontSize: '1rem', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Meals
            </Button>
            <Button
              component={RouterLink}
              to="/account"
              sx={{ color: 'white', textTransform: 'none', fontSize: '1rem', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Account
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="contained"
              sx={{
                bgcolor: '#F57C00',
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                px: 2.5,
                py: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: '#E65100' }
              }}
            >
              🔐 Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar

