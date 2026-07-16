import React, { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Rating from '@mui/material/Rating'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import BackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/BookmarkAdd'
import FavoriteIcon from '@mui/icons-material/FavoriteBorder'
import FavoritedIcon from '@mui/icons-material/Favorite'
import LinearProgress from '@mui/material/LinearProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useNavigate } from 'react-router-dom'
import { useMealStore } from '../store/mealStore'

// Animation styles
const animationStyles = `
  @keyframes slideInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  @keyframes rotateIn { from { opacity: 0; transform: rotate(-5deg) scale(0.95); } to { opacity: 1; transform: rotate(0deg) scale(1); } }
  @keyframes bounceIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = animationStyles
  document.head.appendChild(style)
}

function MealPlanner() {
  const navigate = useNavigate()
  const { nutritionTargets, mealPlan, addSavedMeal, addSavedPlan } = useMealStore()
  const [favorites, setFavorites] = useState([])
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [mealDialogOpen, setMealDialogOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [saveNotification, setSaveNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('Meal saved!')
  const [planSaved, setPlanSaved] = useState(false)

  const toggleFavorite = (mealId) => {
    if (favorites.includes(mealId)) {
      setFavorites(favorites.filter((id) => id !== mealId))
    } else {
      setFavorites([...favorites, mealId])
    }
  }

  const handleSaveMeal = (meal) => {
    addSavedMeal(meal)
    setNotificationMessage(`✅ ${meal.name} saved!`)
    setSaveNotification(true)
    setTimeout(() => setSaveNotification(false), 2000)
  }

  const handleSavePlan = () => {
    if (!mealPlan || !nutritionTargets) {
      setNotificationMessage('❌ Cannot save - no meal plan found!')
      setSaveNotification(true)
      setTimeout(() => setSaveNotification(false), 2000)
      return
    }

    const planToSave = {
      id: Date.now(),
      mealPlan: mealPlan,
      nutritionTargets: nutritionTargets,
      timestamp: new Date().toISOString(),
      type: mealPlan.type || 'daily',
    }

    // Save to Zustand store
    addSavedPlan(planToSave)

    // Save to localStorage
    const existingSavedPlans = JSON.parse(localStorage.getItem('savedMealPlans') || '[]')
    existingSavedPlans.push(planToSave)
    localStorage.setItem('savedMealPlans', JSON.stringify(existingSavedPlans))

    setNotificationMessage('✅ Meal plan saved successfully!')
    setSaveNotification(true)
    setPlanSaved(true)
    setTimeout(() => setSaveNotification(false), 2000)
  }

  const handleMealClick = (meal) => {
    setSelectedMeal(meal)
    setMealDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setMealDialogOpen(false)
    setSelectedMeal(null)
  }

  const dedupeMeals = (meals = []) => {
    const seen = new Set()
    return meals.filter((meal) => {
      const key = meal?.meal_id ?? meal?.id ?? meal?.meal_name ?? meal?.name
      if (key == null) return true
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Check if this is a weekly plan
  const isWeeklyPlan = mealPlan?.type === 'weekly'
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // For daily plans: organize by meal type
  const organizeMealsByType = () => {
    const organized = { Breakfast: [], Lunch: [], Dinner: [], Snack: [] }
    if (mealPlan && !isWeeklyPlan) {
      Object.values(mealPlan).forEach((mealsArray) => {
        if (Array.isArray(mealsArray)) {
          mealsArray.forEach((meal) => {
            const mealType = meal.type || meal.meal_type || 'Snack'
            if (!organized[mealType]) organized[mealType] = []
            organized[mealType].push(meal)
          })
        }
      })
    }
    return organized
  }

  // For weekly plans: organize by day
  const organizeMealsByDay = () => {
    const organized = {}
    if (mealPlan && isWeeklyPlan) {
      if (Array.isArray(mealPlan.weekly_plan) && mealPlan.weekly_plan.length > 0) {
        mealPlan.weekly_plan.forEach((entry) => {
          const day = entry?.day
          const meals = entry?.meals || {}
          if (!day) return

          organized[day] = {}
          if (meals.breakfast) organized[day].Breakfast = [meals.breakfast]
          if (meals.lunch) organized[day].Lunch = [meals.lunch]
          if (meals.dinner) organized[day].Dinner = [meals.dinner]

          const snacks = Array.isArray(meals.snacks) ? meals.snacks : []
          snacks.forEach((snack, snackIdx) => {
            organized[day][`Snack ${snackIdx + 1}`] = [snack]
          })
        })
      } else {
        daysOfWeek.forEach((day) => {
          if (mealPlan[day]) {
            organized[day] = mealPlan[day]
          }
        })
      }
    }
    return organized
  }

  const mealsByType = organizeMealsByType()
  const mealsByDay = organizeMealsByDay()
  const snacksPerDay = mealPlan?.snacksPerDay || 0
  
  let tabLabels = []
  const mealTypeIcons = {
    Breakfast: '🍳', Lunch: '🥗', Dinner: '🍽️', Snack: '🍿',
  }
  const dayIcons = {
    Monday: '🌅', Tuesday: '☀️', Wednesday: '🌤️', Thursday: '⛅', Friday: '🌞', Saturday: '🌻', Sunday: '🌙'
  }

  if (isWeeklyPlan) {
    tabLabels = Object.keys(mealsByDay)
  } else {
    let mealTypeKeys = ['Breakfast', 'Lunch', 'Dinner']
    if (snacksPerDay > 0) mealTypeKeys.push('Snack')
    tabLabels = mealTypeKeys.filter((type) => mealsByType[type]?.length > 0)
  }

  const mealTypeColors = {
    Breakfast: '#FF9800', Lunch: '#2196F3', Dinner: '#4CAF50', Snack: '#9C27B0',
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 1.5, md: 2 }, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'slideInDown 0.6s ease-out' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/create-plan')} sx={{ color: '#2E7D32', fontWeight: 600, transition: 'all 0.3s', '&:hover': { transform: 'translateX(-4px)' } }}>
            Back to Edit
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#2E7D32', mb: 1, fontSize: '2.2rem', animation: 'fadeInScale 0.6s ease-out 0.1s backwards' }}>
            Your Personalized Meal Plan
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.1rem', animation: 'fadeInScale 0.6s ease-out 0.2s backwards' }}>
            {isWeeklyPlan ? '📆 Weekly nutrition plan with different meals each day' : '📅 Perfectly tailored daily nutrition plan for your goals'}
          </Typography>
        </Box>
      </Box>

      {nutritionTargets && (
        <Card sx={{ mb: 6, background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', color: 'white', borderRadius: 2, boxShadow: '0 8px 24px rgba(46, 125, 50, 0.3)', animation: 'slideInUp 0.6s ease-out 0.3s backwards' }}>
          <CardContent sx={{ p: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, fontSize: '1.8rem' }}>
              📊 Daily Nutrition Targets
            </Typography>
            <Grid container spacing={3.5}>
              {[{ label: 'Daily Calories', value: nutritionTargets.dailyCalories, unit: 'kcal' },
                { label: 'Protein', value: nutritionTargets.protein, unit: 'g' },
                { label: 'Carbs', value: nutritionTargets.carbs, unit: 'g' },
                { label: 'Fat', value: nutritionTargets.fat, unit: 'g' }].map((item, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2.5, borderRadius: 2, backdropFilter: 'blur(10px)', textAlign: 'center', border: '2px solid rgba(255,255,255,0.2)', transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', animation: `bounceIn 0.6s ease-out ${0.3 + i * 0.1}s backwards`, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', transform: 'translateY(-6px)', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' } }}>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1, fontSize: '1rem', fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: '2rem' }}>{Math.round(item.value)}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.95rem', fontWeight: 600 }}>{item.unit}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: 5, animation: 'slideInUp 0.6s ease-out 0.4s backwards' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ borderBottom: '3px solid #e0e0e0', '& .MuiTab-root': { textTransform: 'none', fontSize: '1.2rem', fontWeight: 700, minWidth: isWeeklyPlan ? 140 : 160, padding: '16px 20px', transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', '&:hover': { color: '#2E7D32', transform: 'translateY(-2px)' } }, '& .Mui-selected': { color: '#2E7D32' }, '& .MuiTabs-indicator': { backgroundColor: '#2E7D32', height: '4px' } }}>
          {tabLabels.map((label) => (
            <Tab 
              key={label} 
              label={`${isWeeklyPlan ? dayIcons[label] : mealTypeIcons[label]} ${label}`}
              sx={{ '&.Mui-selected': { backgroundColor: 'rgba(46, 125, 50, 0.08)', borderRadius: '8px 8px 0 0' } }} 
            />
          ))}
        </Tabs>
      </Box>

      {/* Display meals based on plan type */}
      {isWeeklyPlan ? (
        // Weekly plan display - show each day
        tabLabels.map((day, dayIndex) => (
          <Box key={day} sx={{ display: dayIndex === tabValue ? 'block' : 'none', animation: dayIndex === tabValue ? 'fadeInScale 0.4s ease-out' : 'none' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: '#2E7D32', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              {dayIcons[day]} {day}'s Meals
            </Typography>
            {mealsByDay[day] && Object.keys(mealsByDay[day]).length > 0 ? (
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {Object.entries(mealsByDay[day]).map(([mealType, meals]) =>
                  Array.isArray(meals) && dedupeMeals(meals).map((meal, mealIndex) => {
                    const mealId = `${day}-${mealType}-${meal.id || mealIndex}`
                    const isFavorited = favorites.includes(mealId)
                    const displayColor = mealTypeColors[mealType] || '#2E7D32'
                    return (
                      <Grid item xs={12} sm={6} md={4} key={mealIndex}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '2px solid transparent', background: 'linear-gradient(to bottom, #fff, #f9f9f9)', animation: `rotateIn 0.5s ease-out ${0.1 + mealIndex * 0.1}s backwards`, '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.15)', transform: 'translateY(-8px)', border: '2px solid #2E7D32' } }}>
                          <Box sx={{ background: `linear-gradient(135deg, ${displayColor} 0%, ${displayColor}cc 100%)`, color: 'white', p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{mealTypeIcons[mealType] || '🍴'} {mealType}</Typography>
                            <Box onClick={(e) => { e.stopPropagation(); toggleFavorite(mealId) }} sx={{ cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', '&:hover': { transform: 'scale(1.3) rotate(15deg)' } }}>
                              {isFavorited ? <FavoritedIcon sx={{ color: '#FFD700', fontSize: 28, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }} /> : <FavoriteIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} />}
                            </Box>
                          </Box>
                          <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                            <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#1B5E20', fontSize: '1.3rem', lineHeight: 1.3 }}>{meal.name}</Typography>
                            {meal.cuisine && <Chip label={meal.cuisine} size="small" sx={{ mb: 2, backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 8px rgba(46, 125, 50, 0.15)' } }} />}
                            {meal.healthiness && (
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Health Score</Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 700, color: meal.healthiness >= 7 ? '#4CAF50' : meal.healthiness >= 4 ? '#FF9800' : '#F44336' }}>{Math.min(meal.healthiness, 10).toFixed(1)}/10</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={Math.min((meal.healthiness / 10) * 100, 100)} sx={{ height: 6, borderRadius: 3, backgroundColor: '#e0e0e0', transition: 'all 0.4s ease-out', '& .MuiLinearProgress-bar': { backgroundColor: meal.healthiness >= 7 ? '#4CAF50' : meal.healthiness >= 4 ? '#FF9800' : '#F44336', borderRadius: 3 } }} />
                              </Box>
                            )}
                            <Grid container spacing={1}>
                              {[{ bg: '#FFF3E0', color: '#F57C00', label: 'Calories', val: meal.calories, unit: '' },
                                { bg: '#E3F2FD', color: '#1976D2', label: 'Protein', val: meal.protein, unit: 'g' },
                                { bg: '#F3E5F5', color: '#7B1FA2', label: 'Carbs', val: meal.carbs, unit: 'g' },
                                { bg: '#FCE4EC', color: '#C2185B', label: 'Fat', val: meal.fat, unit: 'g' }].map((stat, i) => (
                                <Grid item xs={6} key={i}>
                                  <Box sx={{ p: 1.3, backgroundColor: stat.bg, borderRadius: 1.5, textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 12px rgba(0,0,0,0.1)' } }}>
                                    <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, fontSize: '0.75rem', display: 'block', mb: 0.3, textTransform: 'uppercase' }}>{stat.label}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: stat.color, fontSize: '1.25rem' }}>{Math.round(stat.val)}{stat.unit}</Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                            {meal.rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <Rating value={Math.min(meal.rating, 5) / 1} readOnly size="small" />
                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{meal.rating.toFixed(1)}</Typography>
                              </Box>
                            )}
                          </CardContent>
                          <Box sx={{ p: 2, pt: 1, display: 'flex', gap: 1 }}>
                            <Button 
                              fullWidth 
                              variant="contained" 
                              sx={{ 
                                backgroundColor: displayColor, 
                                color: 'white', 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
                                '&:hover': { opacity: 0.9, transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' } 
                              }} 
                              onClick={() => handleMealClick(meal)}
                            >
                              View Details
                            </Button>
                            <Button 
                              fullWidth 
                              variant="contained" 
                              startIcon={<SaveIcon />}
                              sx={{ 
                                backgroundColor: '#FF9800', 
                                color: 'white', 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
                                '&:hover': { backgroundColor: '#F57C00', opacity: 0.9, transform: 'translateY(-2px)' } 
                              }} 
                              onClick={() => handleSaveMeal(meal)}
                            >
                              Save
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    )
                  })
                )}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, animation: 'fadeInScale 0.4s ease-out' }}>
                <Typography color="textSecondary">No meals available for {day}</Typography>
              </Box>
            )}
          </Box>
        ))
      ) : (
        // Daily plan display - show meal types
        tabLabels.map((mealType, typeIndex) => (
          <Box key={mealType} sx={{ display: typeIndex === tabValue ? 'block' : 'none', animation: typeIndex === tabValue ? 'fadeInScale 0.4s ease-out' : 'none' }}>
            {mealsByType[mealType] && mealsByType[mealType].length > 0 ? (
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {dedupeMeals(mealsByType[mealType]).map((meal, mealIndex) => {
                  const mealId = meal.id || `${mealType}-${mealIndex}`
                  const isFavorited = favorites.includes(mealId)
                  return (
                    <Grid item xs={12} sm={6} md={4} key={mealIndex}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '2px solid transparent', background: 'linear-gradient(to bottom, #fff, #f9f9f9)', animation: `rotateIn 0.5s ease-out ${0.1 + mealIndex * 0.1}s backwards`, '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.15)', transform: 'translateY(-8px)', border: '2px solid #2E7D32' } }}>
                        <Box sx={{ background: `linear-gradient(135deg, ${mealTypeColors[mealType]} 0%, ${mealTypeColors[mealType]}cc 100%)`, color: 'white', p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{mealTypeIcons[mealType]} {meal.name}</Typography>
                          <Box onClick={(e) => { e.stopPropagation(); toggleFavorite(mealId) }} sx={{ cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', '&:hover': { transform: 'scale(1.3) rotate(15deg)' } }}>
                            {isFavorited ? <FavoritedIcon sx={{ color: '#FFD700', fontSize: 28, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }} /> : <FavoriteIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} />}
                          </Box>
                        </Box>
                        <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                          <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#1B5E20', fontSize: '1.3rem', lineHeight: 1.3 }}>{meal.name}</Typography>
                          {meal.cuisine && <Chip label={meal.cuisine} size="small" sx={{ mb: 2, backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 8px rgba(46, 125, 50, 0.15)' } }} />}
                          {meal.healthiness && (
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Health Score</Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 700, color: meal.healthiness >= 7 ? '#4CAF50' : meal.healthiness >= 4 ? '#FF9800' : '#F44336' }}>{Math.min(meal.healthiness, 10).toFixed(1)}/10</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={Math.min((meal.healthiness / 10) * 100, 100)} sx={{ height: 6, borderRadius: 3, backgroundColor: '#e0e0e0', transition: 'all 0.4s ease-out', '& .MuiLinearProgress-bar': { backgroundColor: meal.healthiness >= 7 ? '#4CAF50' : meal.healthiness >= 4 ? '#FF9800' : '#F44336', borderRadius: 3 } }} />
                            </Box>
                          )}
                          <Grid container spacing={1}>
                            {[{ bg: '#FFF3E0', color: '#F57C00', label: 'Calories', val: meal.calories, unit: '' },
                              { bg: '#E3F2FD', color: '#1976D2', label: 'Protein', val: meal.protein, unit: 'g' },
                              { bg: '#F3E5F5', color: '#7B1FA2', label: 'Carbs', val: meal.carbs, unit: 'g' },
                              { bg: '#FCE4EC', color: '#C2185B', label: 'Fat', val: meal.fat, unit: 'g' }].map((stat, i) => (
                              <Grid item xs={6} key={i}>
                                <Box sx={{ p: 1.3, backgroundColor: stat.bg, borderRadius: 1.5, textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 12px rgba(0,0,0,0.1)' } }}>
                                  <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, fontSize: '0.75rem', display: 'block', mb: 0.3, textTransform: 'uppercase' }}>{stat.label}</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: stat.color, fontSize: '1.25rem' }}>{Math.round(stat.val)}{stat.unit}</Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                          {meal.rating && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                              <Rating value={Math.min(meal.rating, 5) / 1} readOnly size="small" />
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{meal.rating.toFixed(1)}</Typography>
                            </Box>
                          )}
                        </CardContent>
                        <Box sx={{ p: 2, pt: 1, display: 'flex', gap: 1 }}>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            sx={{ 
                              backgroundColor: mealTypeColors[mealType], 
                              color: 'white', 
                              textTransform: 'none', 
                              fontWeight: 600, 
                              transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
                              '&:hover': { opacity: 0.9, transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' } 
                            }} 
                            onClick={() => handleMealClick(meal)}
                          >
                            View Details
                          </Button>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            startIcon={<SaveIcon />}
                            sx={{ 
                              backgroundColor: '#FF9800', 
                              color: 'white', 
                              textTransform: 'none', 
                              fontWeight: 600, 
                              transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
                              '&:hover': { backgroundColor: '#F57C00', opacity: 0.9, transform: 'translateY(-2px)' } 
                            }} 
                            onClick={() => handleSaveMeal(meal)}
                          >
                            Save
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, animation: 'fadeInScale 0.4s ease-out' }}>
                <Typography color="textSecondary">No {mealType.toLowerCase()} meals available</Typography>
              </Box>
            )}
          </Box>
        ))
      )}

      <Dialog open={mealDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedMeal && (
          <>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#2E7D32', pb: 1 }}>{selectedMeal.name}</DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={`${mealTypeIcons[selectedMeal.type] || '?'} ${selectedMeal.type}`} sx={{ backgroundColor: mealTypeColors[selectedMeal.type] || '#757575', color: 'white', fontWeight: 600, transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)' } }} />
                {selectedMeal.cuisine && <Chip label={selectedMeal.cuisine} sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)' } }} />}
              </Box>
              {selectedMeal.description && <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, fontSize: '1rem' }}>{selectedMeal.description}</Typography>}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.2rem', color: '#1B5E20' }}>Nutrition Information</Typography>
              <Grid container spacing={2}>
                {[{ bg: '#E8F5E9', color: '#2E7D32', label: 'Calories', val: selectedMeal.calories, unit: 'kcal' },
                  { bg: '#FFF3E0', color: '#F57C00', label: 'Protein', val: selectedMeal.protein, unit: 'g' },
                  { bg: '#F3E5F5', color: '#7B1FA2', label: 'Carbs', val: selectedMeal.carbs, unit: 'g' },
                  { bg: '#FCE4EC', color: '#C2185B', label: 'Fat', val: selectedMeal.fat, unit: 'g' }].map((stat, i) => (
                  <Grid item xs={6} key={i}>
                    <Box sx={{ p: 2.5, backgroundColor: stat.bg, borderRadius: 2, textAlign: 'center', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 16px rgba(0,0,0,0.1)' } }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{stat.label}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color, fontSize: '1.5rem', mt: 0.5 }}>{Math.round(stat.val)}</Typography>
                      <Typography variant="caption" sx={{ color: stat.color, fontSize: '0.8rem', fontWeight: 600 }}>{stat.unit}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {selectedMeal.rating && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(46, 125, 50, 0.08)', borderRadius: 2, border: '2px solid #E8F5E9' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Meal Rating</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Rating value={Math.min(selectedMeal.rating, 5) / 1} readOnly />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2E7D32' }}>{selectedMeal.rating.toFixed(1)}/5.0</Typography>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog} sx={{ color: '#666', transition: 'all 0.2s', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>Close</Button>
              <Button onClick={handleCloseDialog} variant="contained" sx={{ backgroundColor: mealTypeColors[selectedMeal.type] || '#2E7D32', color: 'white', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-2px)' } }}>Got It</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Save Meal Notification */}
      <Snackbar
        open={saveNotification}
        autoHideDuration={4000}
        onClose={() => setSaveNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          sx={{ width: '100%', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}
          action={
            planSaved ? (
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  navigate('/saved-meals')
                  setSaveNotification(false)
                }}
                sx={{ fontWeight: 700 }}
              >
                View Saved Plans
              </Button>
            ) : null
          }
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      {/* Bottom Action Buttons */}
      <Box sx={{ mt: 8, mb: 4, display: 'flex', justifyContent: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, animation: 'slideInUp 0.6s ease-out' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/saved-meals')}
          sx={{ 
            color: '#2E7D32', 
            borderColor: '#2E7D32',
            fontWeight: 700, 
            textTransform: 'none',
            fontSize: '1rem',
            px: 4,
            py: 1.5,
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            '&:hover': { 
              backgroundColor: 'rgba(46, 125, 50, 0.08)',
              borderColor: '#1B5E20',
              transform: 'translateY(-2px)'
            } 
          }}
        >
          📋 View Saved Plans
        </Button>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSavePlan}
          sx={{ 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            fontWeight: 700, 
            textTransform: 'none',
            fontSize: '1rem',
            px: 4,
            py: 1.5,
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
            '&:hover': { 
              backgroundColor: '#388E3C', 
              transform: 'translateY(-3px)',
              boxShadow: '0 8px 24px rgba(46, 125, 50, 0.3)'
            } 
          }}
        >
          Save This Meal Plan
        </Button>
      </Box>
    </Container>
  )
}

export default MealPlanner
