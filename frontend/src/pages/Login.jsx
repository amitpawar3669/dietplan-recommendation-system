import React, { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Animation styles
const styles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }

  .fade-in {
    animation: fadeIn 0.8s ease-out;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return false
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }

    if (isSignup) {
      if (!formData.name) {
        setError('Name is required')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate loading
    setTimeout(() => {
      if (!validateForm()) {
        setLoading(false)
        return
      }

      try {
        if (isSignup) {
          useAuthStore.getState().signup(formData.email, formData.password, formData.name)
        } else {
          useAuthStore.getState().login(formData.email, formData.password)
        }
        setLoading(false)
        navigate('/')
      } catch (err) {
        setError(err.message || 'An error occurred')
        setLoading(false)
      }
    }, 800)
  }

  const toggleAuthMode = () => {
    setIsSignup(!isSignup)
    setError('')
    setFormData({ email: '', password: '', name: '', confirmPassword: '' })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2E7D32 0%, #F57C00 50%, #1976D2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'fadeIn 1s ease-out',
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{ 
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: 3,
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          className: 'slide-in-up'
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography sx={{ fontSize: '3.5rem', mb: 2, display: 'inline-block' }}>
                🍽️
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#1b5e20', mb: 0.5 }}>
                FitMeals
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
                {isSignup ? '✨ Create your account' : '👋 Welcome back'}
              </Typography>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {isSignup && (
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ 
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: '#2E7D32' },
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                    }
                  }}
                />
              )}

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                sx={{ 
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': { borderColor: '#2E7D32' },
                    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                        sx={{ color: '#2E7D32' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': { borderColor: '#2E7D32' },
                    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                  }
                }}
              />

              {isSignup && (
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          disabled={loading}
                          sx={{ color: '#2E7D32' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: '#2E7D32' },
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                    }
                  }}
                />
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{ 
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%)',
                  mb: 3,
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  textTransform: 'none',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(46, 125, 50, 0.4)',
                  },
                  '&:disabled': {
                    opacity: 0.7,
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                    <Typography sx={{ fontWeight: 800 }}>{isSignup ? 'Creating...' : 'Logging in...'}</Typography>
                  </Box>
                ) : (
                  `${isSignup ? '✨ Sign Up' : '🚀 Login'}`
                )}
              </Button>
            </Box>

            {/* Toggle Form */}
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                {isSignup ? '✓ Already have an account? ' : '✨ No account yet? '}
                <Link
                  component="button"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleAuthMode()
                  }}
                  disabled={loading}
                  sx={{
                    color: '#2E7D32',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      textDecoration: 'underline',
                      color: '#1b5e20',
                    },
                    '&:disabled': { opacity: 0.6 }
                  }}
                >
                  {isSignup ? 'Login here' : 'Sign up now'}
                </Link>
              </Typography>
            </Box>


          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Login
