import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Alert from '@mui/material/Alert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import RestoreIcon from '@mui/icons-material/Restore'
import { useNavigate } from 'react-router-dom'
import { useMealStore } from '../store/mealStore'
import LoadingSpinner from '../components/LoadingSpinner'

const animationStyles = `
  @keyframes slideInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes rotateIn { from { opacity: 0; transform: rotate(-5deg) scale(0.95); } to { opacity: 1; transform: rotate(0) scale(1); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = animationStyles
  document.head.appendChild(style)
}

function SavedMeals() {
  const navigate = useNavigate()
  const { savedPlans, setSavedPlans, removeSavedPlan, setMealPlan, setNutritionTargets } = useMealStore()
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [localPlans, setLocalPlans] = useState([])

  // Load saved plans from localStorage
  useEffect(() => {
    const loadSavedPlans = async () => {
      try {
        const storedPlans = localStorage.getItem('savedMealPlans')
        if (storedPlans) {
          const parsedPlans = JSON.parse(storedPlans)
          setLocalPlans(parsedPlans)
          setSavedPlans(parsedPlans)
        }
      } catch (error) {
        console.error('Error loading saved plans:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSavedPlans()
  }, [])

  const handleDeletePlan = (planId) => {
    removeSavedPlan(planId)
    const updated = localPlans.filter(p => p.id !== planId)
    setLocalPlans(updated)
    localStorage.setItem('savedMealPlans', JSON.stringify(updated))
  }

  const handleRestorePlan = (plan) => {
    setMealPlan(plan.mealPlan)
    setNutritionTargets(plan.nutritionTargets)
    navigate('/dashboard')
  }

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan)
    setOpenDialog(true)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date'
    const date = new Date(timestamp)
    if (isNaN(date)) return 'Invalid date'
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDietEmoji = (diet) => {
    const emojiMap = {
      'Vegan': '🌱',
      'Vegetarian': '🥬',
      'Balanced': '🥗',
      'high_protein': '🥩',
      'low_carb': '🌾',
    }
    return emojiMap[diet] || '🍽️'
  }

  const getSavedDate = (plan) => {
    return plan.timestamp || plan.savedDate || new Date().toISOString()
  }

  // Get sample meal names from plan
  const getSampleMeals = (plan) => {
    const meals = []
    if (plan?.mealPlan?.weekly_plan && plan.mealPlan.weekly_plan.length > 0) {
      const firstDay = plan.mealPlan.weekly_plan[0]
      if (firstDay?.meals?.breakfast?.name) meals.push(firstDay.meals.breakfast.name)
      if (firstDay?.meals?.lunch?.name) meals.push(firstDay.meals.lunch.name)
      if (firstDay?.meals?.dinner?.name) meals.push(firstDay.meals.dinner.name)
    } else if (plan?.mealPlan?.meals && Array.isArray(plan.mealPlan.meals)) {
      plan.mealPlan.meals.slice(0, 3).forEach((meal) => {
        if (meal?.name) meals.push(meal.name)
      })
    }
    return meals
  }

  // Get all meal names from plan
  const getAllMeals = (plan) => {
    const allMeals = {}
    if (plan?.mealPlan?.weekly_plan && plan.mealPlan.weekly_plan.length > 0) {
      plan.mealPlan.weekly_plan.forEach((day) => {
        allMeals[day?.day || 'Day'] = []
        if (day?.meals?.breakfast?.name) allMeals[day.day].push({ type: 'Breakfast', name: day.meals.breakfast.name })
        if (day?.meals?.lunch?.name) allMeals[day.day].push({ type: 'Lunch', name: day.meals.lunch.name })
        if (day?.meals?.dinner?.name) allMeals[day.day].push({ type: 'Dinner', name: day.meals.dinner.name })
        if (day?.meals?.snacks && Array.isArray(day.meals.snacks)) {
          day.meals.snacks.forEach((snack) => {
            if (snack?.name) allMeals[day.day].push({ type: 'Snack', name: snack.name })
          })
        }
      })
    } else if (plan?.mealPlan?.meals && Array.isArray(plan.mealPlan.meals)) {
      allMeals['Daily'] = plan.mealPlan.meals.map((m) => ({
        type: m?.type || m?.meal_type || 'Meal',
        name: m?.name || m?.meal_name || 'Unknown'
      }))
    }
    return allMeals
  }

  if (loading) {
    return <LoadingSpinner message="Loading your saved meal plans..." />
  }

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 60px)', py: 4, px: { xs: 1, sm: 2 }, background: 'linear-gradient(135deg, #f5faf7 0%, #e8f5e9 100%)' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header with better animation */}
        <Box sx={{ textAlign: 'center', mb: 6, animation: 'slideInDown 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
          <Typography sx={{ 
            fontWeight: 900, 
            mb: 1.5, 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }, 
            color: '#2E7D32', 
            textShadow: '0 2px 8px rgba(0,0,0,0.08)',
            letterSpacing: '-0.5px'
          }}>
            💾 Saved Meal Plans
          </Typography>
          <Box sx={{ height: '4px', width: '80px', background: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 50%, #2E7D32 100%)', borderRadius: '2px', margin: '0 auto', mb: 2 }} />
          <Typography sx={{ 
            fontWeight: 500, 
            fontSize: { xs: '0.95rem', md: '1.15rem' }, 
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Manage your nutrition plans - View, restore, or delete with one click! 🎯
          </Typography>
        </Box>

        {/* Empty State with better styling */}
        {localPlans.length === 0 ? (
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)', 
            border: '2px dashed #2E7D32', 
            animation: 'slideInUp 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            textAlign: 'center', 
            p: { xs: 3, sm: 5, md: 6 },
            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.02) 0%, rgba(76, 175, 80, 0.02) 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 16px 40px rgba(46, 125, 50, 0.2)',
              borderColor: '#1B5E20',
              transform: 'translateY(-4px)'
            }
          }}>
            <Typography sx={{ fontSize: '5rem', mb: 2, animation: 'bounceIn 0.8s ease' }}>📋</Typography>
            <Typography sx={{ fontWeight: 900, mb: 1.5, fontSize: { xs: '1.5rem', sm: '1.8rem' }, color: '#1B5E20' }}>
              No Saved Plans Yet
            </Typography>
            <Typography sx={{ fontWeight: 500, mb: 4, fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: '500px', margin: '0 auto' }}>
              Start creating personalized meal plans and save them here for easy access anytime! Your saved plans will appear here. 🚀
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/create-plan')}
              sx={{
                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                py: 1.6,
                px: 4,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                fontWeight: 900,
                borderRadius: 2.5,
                transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                textTransform: 'none',
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1B5E20 0%, #0D3B1C 100%)',
                  boxShadow: '0 10px 30px rgba(46, 125, 50, 0.5)',
                  transform: 'translateY(-4px) scale(1.02)'
                },
                '&:active': {
                  transform: 'translateY(-2px) scale(0.98)'
                }
              }}
            >
              ✨ Create Your First Plan
            </Button>
          </Card>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.4rem' }, color: '#1B5E20' }}>
                ✨ {localPlans.length} {localPlans.length === 1 ? 'Plan' : 'Plans'} Saved
              </Typography>
              <Chip 
                icon={<span>📊</span>}
                label={`Total: ${localPlans.length} Plans`} 
                sx={{ 
                  bgcolor: 'rgba(46, 125, 50, 0.15)', 
                  color: '#2E7D32', 
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  py: 2.5,
                  px: 1
                }}
              />
            </Box>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {localPlans.map((plan, index) => (
                <Grid item xs={12} sm={6} lg={4} key={plan.id} sx={{ animation: `slideInUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${index * 0.08}s backwards` }}>
                  <Card
                    sx={{
                      borderRadius: 2.5,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      border: '2px solid #E8F5E9',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                      position: 'relative',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FDFB 100%)',
                      '&::before': {
                        content: '\"\"',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #4CAF50, transparent)',
                        transition: 'left 0.6s ease'
                      },
                      '&:hover::before': {
                        left: '100%'
                      },
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 20px 40px rgba(46, 125, 50, 0.25)',
                        borderColor: '#2E7D32'
                      }
                    }}
                  >
                    <CardContent sx={{ pb: 2 }}>
                      {/* Plan Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#1B5E20', mb: 0.5 }}>
                            {plan.planName || `Plan ${index + 1}`}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>
                            📅 {formatDate(getSavedDate(plan))}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePlan(plan.id)}
                          sx={{
                            color: '#d32f2f',
                            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      {/* Plan Info */}
                      <Box sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid #E8F5E9' }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                          <Chip
                            label={`${(plan.mealPlan?.type || 'daily') === 'weekly' ? '📆' : '📅'} ${((plan.mealPlan?.type || 'daily').charAt(0).toUpperCase() + (plan.mealPlan?.type || 'daily').slice(1))} Plan`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(46, 125, 50, 0.15)',
                              color: '#2E7D32',
                              fontWeight: 700,
                              borderRadius: 2
                            }}
                          />
                          {plan.nutritionTargets?.dietType && (
                            <Chip
                              label={`${getDietEmoji(plan.nutritionTargets.dietType)} ${plan.nutritionTargets.dietType}`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255, 152, 0, 0.15)',
                                color: '#FF9800',
                                fontWeight: 700,
                                borderRadius: 2
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Nutrition Info */}
                      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                        <Grid item xs={6}>
                          <Box sx={{ bgcolor: '#f8fdf6', p: 1.5, borderRadius: 1.5, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', mb: 0.5 }}>
                              Calories
                            </Typography>
                            <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#2E7D32' }}>
                              {Math.round(plan.nutritionTargets?.dailyCalories || 0)}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>kcal</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ bgcolor: '#f8fdf6', p: 1.5, borderRadius: 1.5, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', mb: 0.5 }}>
                              Protein
                            </Typography>
                            <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#FF9800' }}>
                              {Math.round(plan.nutritionTargets?.protein || 0)}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>g</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Meals Count & Sample Meals */}
                      <Typography sx={{ fontSize: '0.9rem', color: '#666', fontWeight: 600, mb: 1.5 }}>
                        🍽️ {plan.mealPlan?.meals?.length || 0} meals • {plan.mealPlan?.mealsPerDay || 0} per day
                      </Typography>
                      
                      {/* Sample Meal Names */}
                      {getSampleMeals(plan).length > 0 && (
                        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f8fdf6', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E7D32', mb: 0.8, textTransform: 'uppercase' }}>Sample Meals:</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {getSampleMeals(plan).map((meal, idx) => (
                              <Typography key={idx} sx={{ fontSize: '0.85rem', color: '#1B5E20', fontWeight: 600 }}>
                                ✨ {meal}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewPlan(plan)}
                          sx={{
                            color: '#2E7D32',
                            borderColor: '#2E7D32',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            borderRadius: 1.5,
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'rgba(46, 125, 50, 0.1)',
                              transition: 'left 0.3s ease'
                            },
                            '&:hover::before': {
                              left: '100%'
                            },
                            '&:hover': {
                              bgcolor: 'rgba(46, 125, 50, 0.08)',
                              borderColor: '#1b5e20',
                              borderWidth: 2,
                              transform: 'scale(1.05)',
                              boxShadow: '0 8px 16px rgba(46, 125, 50, 0.15)'
                            },
                            '&:active': {
                              transform: 'scale(0.98)'
                            }
                          }}
                        >
                          👁️ View
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<RestoreIcon />}
                          onClick={() => handleRestorePlan(plan)}
                          sx={{
                            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            borderRadius: 1.5,
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1B5E20 0%, #0D3C1B 100%)',
                              transform: 'translateY(-4px)',
                              boxShadow: '0 12px 24px rgba(46, 125, 50, 0.35)'
                            },
                            '&:active': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 6px 12px rgba(46, 125, 50, 0.25)'
                            }
                          }}
                        >
                          Load Plan
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* View Plan Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5faf7 0%, #e8f5e9 100%)'
            }
          }}
        >
          {selectedPlan && (
            <>
              <DialogTitle sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#1B5E20' }}>
                📋 {selectedPlan.planName || 'Meal Plan Details'}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  {/* Nutrition Targets */}
                  <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '1.1rem', color: '#1B5E20' }}>
                    📊 Nutrition Targets
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#E8F5E9', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#2E7D32', mb: 0.5 }}>
                          DAILY CALORIES
                        </Typography>
                        <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#1B5E20' }}>
                          {Math.round(selectedPlan?.nutritionTargets?.dailyCalories || 0)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#FFF3E0', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF9800', mb: 0.5 }}>
                          PROTEIN
                        </Typography>
                        <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#E65100' }}>
                          {Math.round(selectedPlan?.nutritionTargets?.protein || 0)}g
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#E8F5E9', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#4CAF50', mb: 0.5 }}>
                          CARBS
                        </Typography>
                        <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#2E7D32' }}>
                          {Math.round(selectedPlan?.nutritionTargets?.carbs || 0)}g
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#E3F2FD', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#2196F3', mb: 0.5 }}>
                          FAT
                        </Typography>
                        <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#1565C0' }}>
                          {Math.round(selectedPlan?.nutritionTargets?.fat || 0)}g
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Meals Section */}
                  <Typography sx={{ fontWeight: 800, mb: 2, fontSize: '1.1rem', color: '#1B5E20' }}>
                    🍽️ Complete Meal Schedule
                  </Typography>

                  {Object.keys(getAllMeals(selectedPlan)).length > 0 ? (
                    <Box>
                      {Object.entries(getAllMeals(selectedPlan)).map(([day, meals], dayIdx) => (
                        <Accordion 
                          key={dayIdx} 
                          defaultExpanded={dayIdx === 0}
                          sx={{ 
                            mb: 1.5, 
                            bgcolor: '#f8fdf6', 
                            border: '2px solid #E8F5E9',
                            borderRadius: 2,
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            '&:hover': {
                              boxShadow: '0 6px 16px rgba(46, 125, 50, 0.15)',
                              borderColor: '#2E7D32'
                            }
                          }}
                        >
                          <AccordionSummary 
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              bgcolor: 'rgba(46, 125, 50, 0.08)',
                              '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.12)' }
                            }}
                          >
                            <Typography sx={{ fontWeight: 800, color: '#1B5E20', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                              📅 {day} <Chip label={`${meals.length} meals`} size="small" sx={{ ml: 1, bgcolor: '#2E7D32', color: 'white', fontWeight: 700 }} />
                            </Typography>
                          </AccordionSummary>
                          
                          <AccordionDetails sx={{ p: 2 }}>
                            <Grid container spacing={1.5}>
                              {meals.map((meal, mealIdx) => {
                                const mealTypeEmoji = {
                                  'Breakfast': '🌅',
                                  'Lunch': '🌞',
                                  'Dinner': '🌙',
                                  'Snack': '🍿'
                                }
                                const mealTypeColor = {
                                  'Breakfast': '#FF9800',
                                  'Lunch': '#2196F3',
                                  'Dinner': '#4CAF50',
                                  'Snack': '#9C27B0'
                                }
                                
                                return (
                                  <Grid item xs={12} key={mealIdx}>
                                    <Card 
                                      sx={{
                                        background: `linear-gradient(135deg, ${mealTypeColor[meal.type] || '#2E7D32'}15 0%, ${mealTypeColor[meal.type] || '#2E7D32'}08 100%)`,
                                        border: `2px solid ${mealTypeColor[meal.type] || '#2E7D32'}`,
                                        borderRadius: 2,
                                        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                        '&:hover': {
                                          transform: 'translateX(8px)',
                                          boxShadow: `0 6px 16px ${mealTypeColor[meal.type] || '#2E7D32'}40`
                                        }
                                      }}
                                    >
                                      <CardContent sx={{ p: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                          <Box 
                                            sx={{
                                              width: 42,
                                              height: 42,
                                              borderRadius: '50%',
                                              background: `linear-gradient(135deg, ${mealTypeColor[meal.type] || '#2E7D32'} 0%, ${mealTypeColor[meal.type] || '#2E7D32'}80 100%)`,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '1.5rem',
                                              color: 'white',
                                              fontWeight: 700
                                            }}
                                          >
                                            {mealTypeEmoji[meal.type] || '🍴'}
                                          </Box>
                                          <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 700, color: '#1B5E20', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                              {meal.type}
                                            </Typography>\n                                            <Typography sx={{ fontWeight: 600, color: '#2E7D32', fontSize: '1rem', mt: 0.3 }}>
                                              {meal.name}
                                            </Typography>
                                          </Box>\n                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                )
                              })}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : (
                    <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fdf6', border: '1px solid #E8F5E9' }}>
                      <Typography sx={{ color: '#666', fontStyle: 'italic', fontWeight: 600 }}>
                        📋 No meal details available for this plan
                      </Typography>
                    </Card>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setOpenDialog(false)} sx={{ color: '#2E7D32', fontWeight: 700 }}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  )
}

export default SavedMeals
