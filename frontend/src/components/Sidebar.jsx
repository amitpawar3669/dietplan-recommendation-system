import React from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import DashboardIcon from '@mui/icons-material/Dashboard'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import CalorieIcon from '@mui/icons-material/LocalFireDepartment'
import ProgressIcon from '@mui/icons-material/TrendingUp'
import AccountIcon from '@mui/icons-material/AccountCircle'
import SavedIcon from '@mui/icons-material/SaveAlt'
import LoginIcon from '@mui/icons-material/Login'
import { useAuthStore } from '../store/authStore'

const DRAWER_WIDTH = 320
const LIGHT_BG = '#FFFFFF'
const LIGHT_BG_SECONDARY = '#F8FDF6'
const ACCENT_COLOR = '#2E7D32'
const ACCENT_LIGHT = '#E8F5E9'
const TEXT_DARK = '#1b5e20'
const TEXT_SECONDARY = '#666666'

// Animation styles for sidebar
const animationStyles = `
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes hoverScale { from { transform: scale(1); } to { transform: scale(1.02); } }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = animationStyles
  document.head.appendChild(style)
}

function Sidebar({ open, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { label: 'Create Plan', icon: <RestaurantIcon />, path: '/create-plan' },
    { label: 'Saved Meals', icon: <SavedIcon />, path: '/saved-meals' },
    { label: 'View Meal Plan', icon: <RestaurantIcon />, path: '/meal-planner' },
    { label: 'Calorie Calculator', icon: <CalorieIcon />, path: '/calculator' },
    { label: 'My Progress', icon: <ProgressIcon />, path: '/progress' },
  ]

  const sidebarContent = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: `linear-gradient(180deg, ${LIGHT_BG} 0%, ${LIGHT_BG_SECONDARY} 100%)`,
      color: TEXT_DARK
    }}>
      {/* Logo Section */}
      <Box sx={{ 
        p: 3.5, 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FDF6 100%)',
        borderBottom: `3px solid ${ACCENT_COLOR}`,
        animation: 'slideInLeft 0.6s ease-out'
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 900, 
            color: ACCENT_COLOR, 
            mb: 0.8,
            fontSize: '2.2rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.08)'
          }}
        >
          🍽️ FitMeals
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#2E7D32',
            fontWeight: 700,
            letterSpacing: 0.8,
            fontSize: '0.8rem'
          }}
        >
          PROFESSIONAL NUTRITION PLANNING
        </Typography>
      </Box>

      {/* User Profile / Login Section */}
      {isAuthenticated ? (
        <Box sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          borderBottom: `1px solid ${ACCENT_LIGHT}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: ACCENT_LIGHT,
          }
        }}>
          <Avatar 
            sx={{ 
              bgcolor: ACCENT_COLOR, 
              width: 45, 
              height: 45,
              fontWeight: 900,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)'
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 700,
                color: TEXT_DARK,
                fontSize: '0.95rem'
              }}
            >
              {user?.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: TEXT_SECONDARY,
                display: 'block',
                fontSize: '0.8rem'
              }}
            >
              ✓ Active User
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${ACCENT_LIGHT}` }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              navigate('/login')
              onClose()
            }}
            startIcon={<LoginIcon />}
            sx={{ 
              bgcolor: ACCENT_COLOR,
              color: '#FFFFFF',
              fontWeight: 700,
              py: 1.2,
              transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              '&:hover': {
                bgcolor: '#1b5e20',
                boxShadow: '0 8px 20px rgba(46, 125, 50, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Login / Sign Up
          </Button>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 2.5, px: 1.5 }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={onClose}
              sx={{
                bgcolor: isActive ? ACCENT_LIGHT : 'transparent',
                color: isActive ? ACCENT_COLOR : TEXT_SECONDARY,
                mb: 1.2,
                mx: 0,
                px: 2,
                py: 1.3,
                borderRadius: 2,
                borderLeft: isActive ? `4px solid ${ACCENT_COLOR}` : '4px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                '&::before': isActive ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, rgba(46, 125, 50, 0.15) 0%, transparent 100%)`,
                  pointerEvents: 'none'
                } : {},
                '&:hover': {
                  bgcolor: ACCENT_LIGHT,
                  color: ACCENT_COLOR,
                  transform: 'translateX(4px)',
                  '& .MuiListItemIcon-root': {
                    color: ACCENT_COLOR
                  }
                },
                animation: `slideInLeft 0.6s ease-out ${0.1 * index}s backwards`
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40, 
                  color: 'inherit',
                  fontSize: '1.35rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.98rem',
                    letterSpacing: 0.3
                  }
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: ACCENT_COLOR,
                    boxShadow: `0 0 12px ${ACCENT_COLOR}`,
                    ml: 1
                  }}
                />
              )}
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: ACCENT_LIGHT }} />

      {/* Account / Footer Section */}
      <Box sx={{ 
        p: 2.5, 
        borderTop: `1px solid ${ACCENT_LIGHT}`
      }}>
        {isAuthenticated ? (
          <ListItem
            component={RouterLink}
            to="/account"
            onClick={onClose}
            sx={{
              bgcolor: 'transparent',
              color: TEXT_SECONDARY,
              px: 2,
              py: 1.2,
              borderRadius: 2,
              transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              '&:hover': {
                bgcolor: ACCENT_LIGHT,
                color: ACCENT_COLOR,
                transform: 'translateX(4px)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <AccountIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Account Settings"
              primaryTypographyProps={{
                sx: {
                  fontWeight: 600,
                  fontSize: '0.98rem'
                }
              }}
            />
          </ListItem>
        ) : (
          <Typography 
            variant="caption" 
            sx={{ 
              color: TEXT_SECONDARY, 
              display: 'block', 
              textAlign: 'center', 
              p: 1.5,
              fontStyle: 'italic',
              fontSize: '0.8rem'
            }}
          >
            Login to access your profile and personalized features
          </Typography>
        )}
      </Box>
    </Box>
  )

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: `linear-gradient(180deg, ${LIGHT_BG} 0%, ${LIGHT_BG_SECONDARY} 100%)`,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: `linear-gradient(180deg, ${LIGHT_BG} 0%, ${LIGHT_BG_SECONDARY} 100%)`,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  )
}

export default Sidebar
