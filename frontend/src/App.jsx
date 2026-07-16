import React, { useState, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import CreatePlan from './pages/CreatePlan'
import SavedMeals from './pages/SavedMeals'
import MealPlanner from './pages/MealPlanner'
import CalorieCalculator from './pages/CalorieCalculator'
import Progress from './pages/Progress'
import Account from './pages/Account'
import { useAuthStore } from './store/authStore'
import './App.css'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h4" color="error">Something went wrong</Typography>
          <Typography color="textSecondary">{this.state.error?.message}</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>Reload Page</Button>
        </Box>
      )
    }

    return this.props.children
  }
}

const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32', light: '#66BB6A', dark: '#1B5E20' },
    secondary: { main: '#F57C00', light: '#FFB74D', dark: '#E65100' },
    success: { main: '#4CAF50' },
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: 16,
    h1: { fontWeight: 700, fontSize: '3.5rem' },
    h2: { fontWeight: 600, fontSize: '3rem' },
    h3: { fontWeight: 600, fontSize: '2.2rem' },
    h4: { fontWeight: 600, fontSize: '1.8rem' },
    h5: { fontWeight: 600, fontSize: '1.5rem' },
    h6: { fontWeight: 600, fontSize: '1.3rem' },
    body1: { fontSize: '1.1rem' },
    body2: { fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '1.1rem' },
  },
})

// Loading fallback
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <Box sx={{ textAlign: 'center' }}>
      <CircularProgress sx={{ color: '#2E7D32', mb: 2 }} />
      <Typography>Loading...</Typography>
    </Box>
  </Box>
)

// Protected Route wrapper
const ProtectedRoute = ({ isAuthenticated, children, redirectPath = '/login' }) => {
  return isAuthenticated ? children : <Navigate to={redirectPath} replace />
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const DRAWER_WIDTH = 260
  const contentAreaSx = {
    flex: 1,
    overflow: 'auto',
    background: 'linear-gradient(135deg, #F8FDF6 0%, #F1F8F4 50%, #FFFFFF 100%)',
    width: { xs: '100%', sm: `calc(100% - ${DRAWER_WIDTH}px)` },
    minHeight: '100vh',
    pt: { xs: 9, md: 10 }
  }

  console.log('App rendering...', 'isAuthenticated:', isAuthenticated)

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
            {/* Redirect root to login or dashboard based on auth */}
            <Route path="/" element={
              isAuthenticated ? (
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Box sx={{ width: { xs: 0, sm: DRAWER_WIDTH }, flexShrink: 0 }}>
                    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
                  </Box>
                  <Box sx={contentAreaSx}>
                    <Suspense fallback={<LoadingFallback />}>
                      <Dashboard />
                    </Suspense>
                  </Box>
                </Box>
              ) : (
                <Navigate to="/login" replace />
              )
            } />

            {/* Login */}
            <Route path="/login" element={<Login />} />

            <Route path="/create-plan" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Box sx={{ width: { xs: 0, sm: DRAWER_WIDTH }, flexShrink: 0 }}>
                    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
                  </Box>
                  <Box sx={contentAreaSx}>
                    <Suspense fallback={<LoadingFallback />}>
                      <CreatePlan />
                    </Suspense>
                  </Box>
                </Box>
              </ProtectedRoute>
            } />

            <Route path="/saved-meals" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Box sx={{ width: { xs: 0, sm: DRAWER_WIDTH }, flexShrink: 0 }}>
                    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
                  </Box>
                  <Box sx={contentAreaSx}>
                    <Suspense fallback={<LoadingFallback />}>
                      <SavedMeals />
                    </Suspense>
                  </Box>
                </Box>
              </ProtectedRoute>
            } />

            <Route path="/meal-planner" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Box sx={{ width: { xs: 0, sm: DRAWER_WIDTH }, flexShrink: 0 }}>
                    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
                  </Box>
                  <Box sx={contentAreaSx}>
                    <Suspense fallback={<LoadingFallback />}>
                      <MealPlanner />
                    </Suspense>
                  </Box>
                </Box>
              </ProtectedRoute>
            } />

            <Route path="/calculator" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Box sx={{ width: { xs: 0, sm: DRAWER_WIDTH }, flexShrink: 0 }}>
                    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
                  </Box>
                  <Box sx={contentAreaSx}>
                    <Suspense fallback={<LoadingFallback />}>
                      <CalorieCalculator />
                    </Suspense>
                  </Box>
                </Box>
              </ProtectedRoute>
            } />

            <Route path="/progress" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Box sx={{ width: { xs: 0, sm: DRAWER_WIDTH }, flexShrink: 0 }}>
                    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
                  </Box>
                  <Box sx={contentAreaSx}>
                    <Suspense fallback={<LoadingFallback />}>
                      <Progress />
                    </Suspense>
                  </Box>
                </Box>
              </ProtectedRoute>
            } />

            <Route path="/account" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Box sx={{ width: { xs: 0, sm: DRAWER_WIDTH }, flexShrink: 0 }}>
                    <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
                  </Box>
                  <Box sx={contentAreaSx}>
                    <Suspense fallback={<LoadingFallback />}>
                      <Account />
                    </Suspense>
                  </Box>
                </Box>
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
