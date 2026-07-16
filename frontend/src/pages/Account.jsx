import React, { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import LogoutIcon from '@mui/icons-material/Logout'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useMealStore } from '../store/mealStore'

// Animation styles
const styles = `
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.85);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .slide-in-down {
    animation: slideInDown 0.6s ease-out;
  }

  .slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }

  .scale-in {
    animation: scaleIn 0.5s ease-out;
  }

  .fade-in-scale {
    animation: fadeInScale 0.5s ease-out;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

function Account() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()
  const { setUserData: setMealUserData } = useMealStore()
  const [editing, setEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [savingState, setSavingState] = useState(false)
  const [userData, setUserData] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    gender: user?.gender || '',
    goal: user?.goal || 'weight_loss',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    setSavingState(true)
    setTimeout(() => {
      setEditing(false)
      // Update both auth store and meal store so Progress page can access profile data
      updateUser(userData)
      setMealUserData({
        age: userData.age ? Number(userData.age) : null,
        height: userData.height ? Number(userData.height) : null,
        gender: userData.gender || userData.sex,
        weight: userData.weight ? Number(userData.weight) : null,
        goal: userData.goal || 'weight_loss',
      })
      setSavingState(false)
      setSuccessMessage('✅ Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 4000)
    }, 1000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 3.5 } }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 5,
        className: 'slide-in-down'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
          👤 Account Settings
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 1.2,
            fontWeight: 700,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)'
            }
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Success Message */}
      {successMessage && (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '1rem',
            animation: 'slideInUp 0.6s ease-out',
            border: '2px solid #4CAF50',
            bgcolor: '#f1f8f4'
          }}
        >
          {successMessage}
        </Alert>
      )}

      {/* Profile Card */}
      <Card sx={{ 
        mb: 4,
        borderRadius: 3,
        boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
        border: '2px solid #E8F5E9',
        transition: 'all 0.3s ease',
        className: 'slide-in-up',
        '&:hover': {
          boxShadow: '0 16px 40px rgba(46, 125, 50, 0.15)',
          transform: 'translateY(-4px)'
        }
      }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5, mb: 4 }}>
            <Avatar sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%)',
              fontSize: 44,
              fontWeight: 900,
              boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 12px 32px rgba(46, 125, 50, 0.4)'
              }
            }}>
              {userData.name[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b5e20', mb: 0.5 }}>
                {userData.name}
              </Typography>
              <Typography sx={{ color: '#666', fontWeight: 600, fontSize: '0.95rem', mb: 1 }}>
                📧 {userData.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#f1f8f4', borderRadius: 1, border: '1px solid #E8F5E9' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#2E7D32' }}>
                    ✅ Verified Member
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#E8F5E9' }} />

          {!editing && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
              sx={{ 
                bgcolor: '#2E7D32',
                borderRadius: 2,
                px: 3,
                py: 1.3,
                fontWeight: 700,
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#1b5e20',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 20px rgba(46, 125, 50, 0.4)'
                }
              }}
            >
              Edit Profile
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editing && (
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          border: '2px solid #F57C00',
          className: 'fade-in-scale'
        }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, color: '#1b5e20', fontSize: '1.2rem' }}>
              ✏️ Edit Your Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  disabled={savingState}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: '#2E7D32' },
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={userData.email}
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Age (years)"
                  name="age"
                  type="number"
                  value={userData.age}
                  onChange={handleChange}
                  disabled={savingState}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: '#2E7D32' },
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={userData.weight}
                  onChange={handleChange}
                  disabled={savingState}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: '#2E7D32' },
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={userData.height}
                  onChange={handleChange}
                  disabled={savingState}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: '#2E7D32' },
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                  }
                }}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={userData.gender}
                    onChange={handleChange}
                    label="Gender"
                    disabled={savingState}
                    sx={{
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)' }
                    }}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={savingState}
                sx={{ 
                  bgcolor: '#2E7D32',
                  borderRadius: 2,
                  px: 3,
                  py: 1.3,
                  fontWeight: 700,
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover:not(:disabled)': {
                    bgcolor: '#1b5e20',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(46, 125, 50, 0.4)'
                  }
                }}
              >
                {savingState ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setEditing(false)}
                disabled={savingState}
                sx={{ 
                  color: '#2E7D32', 
                  borderColor: '#2E7D32',
                  borderRadius: 2,
                  px: 3,
                  py: 1.3,
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    bgcolor: '#f1f8f4',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)'
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}

export default Account
