import React, { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { useNavigate } from 'react-router-dom'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useMealStore } from '../store/mealStore'
import { mealApi } from '../api/mealApi'
import LoadingSpinner from '../components/LoadingSpinner'

// Animation styles
const animationStyles = `
  @keyframes slideInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes bounceIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = animationStyles
  document.head.appendChild(style)
}

function CreatePlan() {
  const navigate = useNavigate()
  const { setNutritionTargets, setMealPlan } = useMealStore()
  const weeklyMealTypeOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  const [step, setStep] = useState(0)
  const [planType, setPlanType] = useState('daily')
  const [loading, setLoading] = useState(false)
  const [generatingState, setGeneratingState] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    goal: 'weight_loss',
    activityLevel: 'moderate',
    dietPreference: 'balanced',
    cuisinePreference: 'any',
    numMeals: '3',
    numSnacks: '1',
    weeklyVariety: 'high',
    weeklyMealTypes: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
  })
  
  const formatLabel = (text) => text.replace(/_/g, ' ').toUpperCase()
  const [nutritionData, setNutritionData] = useState(null)
  const [nutritionTargets, setNutritionTargetsLocal] = useState(null)
  const [mealPlanData, setMealPlanData] = useState(null)
  const [expandedDay, setExpandedDay] = useState('Monday')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [planName, setPlanName] = useState('')

  const handleSavePlan = () => {
    if (!planName.trim()) {
      setError('Please enter a plan name')
      return
    }

    const savedPlan = {
      id: Date.now(),
      planName: planName,
      savedDate: Date.now(),
      mealPlan: mealPlanData || {},
      nutritionTargets: {
        ...nutritionTargets,
        dietType: mapDietPreferenceToDietType(formData.dietPreference) || formData.dietPreference
      },
      formData: formData
    }

    // Load existing plans
    const existingPlans = JSON.parse(localStorage.getItem('savedMealPlans') || '[]')
    const updatedPlans = [...existingPlans, savedPlan]
    
    // Save to localStorage
    localStorage.setItem('savedMealPlans', JSON.stringify(updatedPlans))

    // Show success
    setError(null)
    alert(`✅ Meal plan "${planName}" saved successfully!`)
    setShowSaveDialog(false)
    setPlanName('')
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleWeeklyMealTypeToggle = (mealType) => {
    setFormData((prev) => {
      const alreadySelected = prev.weeklyMealTypes.includes(mealType)
      const updated = alreadySelected
        ? prev.weeklyMealTypes.filter((item) => item !== mealType)
        : [...prev.weeklyMealTypes, mealType]

      return {
        ...prev,
        weeklyMealTypes: updated,
      }
    })
  }

  const mapDietPreferenceToDietType = (dietPreference) => {
    const normalized = String(dietPreference || '').trim().toLowerCase()
    if (normalized === 'vegan') return 'Vegan'
    if (normalized === 'vegetarian') return 'Vegetarian'
    return null
  }

  const distributeMeals = (meals, numMeals, numSnacks) => {
    if (!meals || meals.length === 0) return {}

    const mealTypes = []
    const mealsPerDay = parseInt(numMeals)
    const snacksPerDay = parseInt(numSnacks)

    if (mealsPerDay >= 1) mealTypes.push('Breakfast')
    if (mealsPerDay >= 2) mealTypes.push('Lunch')
    if (mealsPerDay >= 3) mealTypes.push('Dinner')
    if (mealsPerDay >= 4) mealTypes.push('Post-Workout')
    if (mealsPerDay >= 5) mealTypes.push('Evening Meal')
    if (mealsPerDay >= 6) mealTypes.push('Late Dinner')

    for (let i = 0; i < snacksPerDay; i++) {
      mealTypes.push(`Snack ${i + 1}`)
    }

    const distribution = {}
    let mealIndex = 0

    for (let i = 0; i < mealTypes.length && mealIndex < meals.length; i++) {
      distribution[mealTypes[i]] = [meals[mealIndex]]
      mealIndex++

      if (mealIndex < meals.length && i === mealTypes.length - 1) {
        const remainingMeals = meals.slice(mealIndex)
        const mealsPerType = Math.ceil(remainingMeals.length / mealTypes.length)
        let remainingIndex = 0

        for (const mealType of mealTypes) {
          if (remainingIndex < remainingMeals.length) {
            const mealsForType = remainingMeals.slice(
              remainingIndex,
              Math.min(remainingIndex + mealsPerType, remainingMeals.length)
            )
            if (distribution[mealType]) {
              distribution[mealType] = distribution[mealType].concat(mealsForType)
            }
            remainingIndex += mealsPerType
          }
        }
      }
    }

    return distribution
  }

  const normalizeMeal = (meal, fallbackId) => ({
    id: meal.meal_id || meal.id || fallbackId,
    name: meal.name || meal.meal_name || 'Unknown Meal',
    type: meal.meal_type || meal.type || 'Main',
    calories: meal.calories || 0,
    protein: meal.protein || 0,
    carbs: meal.carbs || 0,
    fat: meal.fat || 0,
    healthiness: meal.healthiness_score || meal.healthiness || 0,
    cuisine: meal.cuisine || 'Various',
    cuisine_match: Boolean(meal.cuisine_match),
    rating: meal.rating || 0,
    description: meal.description || '',
  })

  const normalizeWeeklyPlanFromApi = (weeklyPlanArray = []) => {
    const weeklyByDay = {}
    const flatMeals = []

    weeklyPlanArray.forEach((dayEntry, dayIndex) => {
      const dayName = dayEntry?.day || `Day ${dayIndex + 1}`
      const meals = dayEntry?.meals || {}
      const dayMap = {}

      if (meals.breakfast) {
        const meal = normalizeMeal(meals.breakfast, `${dayName}-breakfast`)
        dayMap.Breakfast = [meal]
        flatMeals.push(meal)
      }
      if (meals.lunch) {
        const meal = normalizeMeal(meals.lunch, `${dayName}-lunch`)
        dayMap.Lunch = [meal]
        flatMeals.push(meal)
      }
      if (meals.dinner) {
        const meal = normalizeMeal(meals.dinner, `${dayName}-dinner`)
        dayMap.Dinner = [meal]
        flatMeals.push(meal)
      }

      const snacks = Array.isArray(meals.snacks) ? meals.snacks : []
      snacks.forEach((snack, snackIndex) => {
        const meal = normalizeMeal(snack, `${dayName}-snack-${snackIndex}`)
        const snackKey = `Snack ${snackIndex + 1}`
        dayMap[snackKey] = [meal]
        flatMeals.push(meal)
      })

      weeklyByDay[dayName] = dayMap
    })

    return { weeklyByDay, flatMeals }
  }

  const handleGeneratePlan = async () => {
    if (!formData.age || !formData.weight || !formData.height) {
      setError('Please fill in all required fields (age, weight, height)')
      return
    }

    if (parseInt(formData.age) <= 0 || parseFloat(formData.weight) <= 0 || parseInt(formData.height) <= 0) {
      setError('Please enter valid positive numbers')
      return
    }

    if (planType === 'weekly' && formData.weeklyMealTypes.length === 0) {
      setError('Please select at least one meal type for weekly plans')
      return
    }

    setError(null)
    setLoading(true)
    setGeneratingState(true)

    try {
      const userId = Date.now()

      const mealsPerDay = parseInt(formData.numMeals, 10)
      const snacksPerDay = parseInt(formData.numSnacks, 10)
      const totalDailySlots = mealsPerDay + snacksPerDay
      const weeklySlots = (planType === 'weekly' ? formData.weeklyMealTypes.length : totalDailySlots) * 7
      const topN = planType === 'weekly'
        ? Math.min(Math.max(weeklySlots * 2, 60), 120)
        : Math.max(totalDailySlots * 2, 10)

      const selectedDietType = mapDietPreferenceToDietType(formData.dietPreference)
      const selectedCuisine = formData.cuisinePreference && formData.cuisinePreference !== 'any'
        ? formData.cuisinePreference
        : null

      const requestData = {
        user_id: userId,
        top_n: topN,
        content_weight: 0.5,
        collab_weight: 0.5,
        context_weight: 0.0,
        context_preferences: {
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseInt(formData.height),
          goal: formData.goal === 'maintain_weight' ? 'maintenance' : formData.goal,
          activity_level: formData.activityLevel,
          diet_preference: formData.dietPreference,
          diet_type: selectedDietType,
          cuisine: selectedCuisine,
          meals_per_day: parseInt(formData.numMeals),
          snacks_per_day: parseInt(formData.numSnacks),
          weekly_meal_types: planType === 'weekly' ? formData.weeklyMealTypes : undefined,
          plan_type: planType,
          weekly_variety: formData.weeklyVariety,
        },
      }

      console.log('Generating meal plan with:', requestData)

      const result = await mealApi.getRecommendations(requestData)

      console.log('API Response:', result)

      if (!result || result.status === 'error') {
        setError(result?.details || `Failed to generate meal plan. Error: ${result?.message || 'Unknown error'}`)
        setLoading(false)
        return
      }

      const hasWeeklyPlan = planType === 'weekly' && Array.isArray(result.weekly_plan) && result.weekly_plan.length > 0
      if ((result.recommendations && Array.isArray(result.recommendations) && result.recommendations.length > 0) || hasWeeklyPlan) {
        const recommendations = Array.isArray(result.recommendations) ? result.recommendations : []

        let totalProtein = 0
        let totalCarbs = 0
        let totalFat = 0
        let totalCalories = 0

        const meals = recommendations.map((meal, index) => normalizeMeal(meal, index))

        meals.forEach((meal) => {
          totalProtein += meal.protein || 0
          totalCarbs += meal.carbs || 0
          totalFat += meal.fat || 0
          totalCalories += meal.calories || 0
        })

        // For weekly plans, calculate PER-DAY nutrition by dividing by 7
        let displayProtein = totalProtein
        let displayCarbs = totalCarbs
        let displayFat = totalFat
        let displayCalories = totalCalories

        if (planType === 'weekly' && hasWeeklyPlan) {
          // Weekly plan: show per-day average
          displayProtein = Math.round(totalProtein / 7)
          displayCarbs = Math.round(totalCarbs / 7)
          displayFat = Math.round(totalFat / 7)
          displayCalories = Math.round(totalCalories / 7)
        }

        setNutritionData([
          { name: 'Protein', value: Math.round(displayProtein) },
          { name: 'Carbs', value: Math.round(displayCarbs) },
          { name: 'Fat', value: Math.round(displayFat) },
        ])

        setNutritionTargetsLocal({
          dailyCalories: displayCalories,
          protein: Math.round(displayProtein),
          carbs: Math.round(displayCarbs),
          fat: Math.round(displayFat),
        })

        setNutritionTargets({
          dailyCalories: displayCalories,
          protein: Math.round(displayProtein),
          carbs: Math.round(displayCarbs),
          fat: Math.round(displayFat),
        })

        // Choose organization based on plan type
        let finalMealPlan
        let finalMeals = meals
        let weeklyPlanArray = []
        if (planType === 'weekly') {
          if (hasWeeklyPlan) {
            const normalizedWeekly = normalizeWeeklyPlanFromApi(result.weekly_plan)
            finalMealPlan = normalizedWeekly.weeklyByDay
            finalMeals = normalizedWeekly.flatMeals
            weeklyPlanArray = result.weekly_plan
          } else {
            setError('Weekly plan structure was not returned from server. Please try again.')
            setLoading(false)
            return
          }
        } else {
          finalMealPlan = distributeMeals(meals, formData.numMeals, formData.numSnacks)
        }

        const mealPlanWithMeta = {
          type: planType,
          mealsPerDay: parseInt(formData.numMeals),
          snacksPerDay: parseInt(formData.numSnacks),
          meals: finalMeals,
          weekly_plan: weeklyPlanArray,
          ...finalMealPlan,
        }

        setMealPlanData(finalMealPlan)
        setMealPlan(mealPlanWithMeta)
      }

      setTimeout(() => {
        setGeneratingState(false)
        setStep(2)
      }, 1200)
    } catch (err) {
      console.error('Error generating plan:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.details || 
                          err.message || 
                          'Failed to generate meal plan. Please check the form and try again.'
      setError(errorMessage)
      setGeneratingState(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading && step === 2) {
    return <LoadingSpinner message="Generating your meal plan..." />
  }

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 60px)', overflow: 'auto', py: 2, px: { xs: 1, sm: 2 }, background: 'linear-gradient(135deg, #f5faf7 0%, #e8f5e9 100%)' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* STEP 0: Select Plan Type */}
        {step === 0 && (
          <Box sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4, animation: 'slideInDown 0.6s ease-out' }}>
              <Typography sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '2.2rem', md: '3.2rem' }, color: '#2E7D32', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                🍽️ Create Your Meal Plan
              </Typography>
              <Typography sx={{ fontWeight: 500, fontSize: { xs: '1rem', md: '1.2rem' }, color: '#666' }}>
                Choose your preferred meal planning format
              </Typography>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #E8F5E9', animation: 'slideInUp 0.6s ease-out 0.1s backwards' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      onClick={() => setPlanType('daily')}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: planType === 'daily' ? '3px solid #2E7D32' : '2px solid #E8F5E9',
                        borderRadius: 2.5,
                        bgcolor: planType === 'daily' ? 'rgba(46, 125, 50, 0.08)' : '#fff',
                        textAlign: 'center',
                        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        '&:hover': { 
                          border: '3px solid #2E7D32',
                          bgcolor: 'rgba(46, 125, 50, 0.08)',
                          boxShadow: '0 8px 20px rgba(46, 125, 50, 0.15)',
                          transform: 'translateY(-4px)'
                        },
                        boxShadow: planType === 'daily' ? '0 8px 20px rgba(46, 125, 50, 0.15)' : 'none',
                        animation: 'slideInUp 0.5s ease-out 0.2s backwards'
                      }}
                    >
                      <Typography sx={{ fontSize: '3rem', mb: 1 }}>📅</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.5rem' }, color: '#2E7D32', mb: 0.8 }}>
                        Daily Plan
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', color: '#666', fontWeight: 500 }}>
                        Single day nutrition plan
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      onClick={() => setPlanType('weekly')}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: planType === 'weekly' ? '3px solid #2E7D32' : '2px solid #E8F5E9',
                        borderRadius: 2.5,
                        bgcolor: planType === 'weekly' ? 'rgba(46, 125, 50, 0.08)' : '#fff',
                        textAlign: 'center',
                        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        '&:hover': { 
                          border: '3px solid #2E7D32',
                          bgcolor: 'rgba(46, 125, 50, 0.08)',
                          boxShadow: '0 8px 20px rgba(46, 125, 50, 0.15)',
                          transform: 'translateY(-4px)'
                        },
                        boxShadow: planType === 'weekly' ? '0 8px 20px rgba(46, 125, 50, 0.15)' : 'none',
                        animation: 'slideInUp 0.5s ease-out 0.3s backwards'
                      }}
                    >
                      <Typography sx={{ fontSize: '3rem', mb: 1 }}>📆</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.5rem' }, color: '#2E7D32', mb: 0.8 }}>
                        Weekly Plan
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', color: '#666', fontWeight: 500 }}>
                        A week of meal plans
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setStep(1)}
                  sx={{
                    bgcolor: '#2E7D32',
                    py: 1.6,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 800,
                    borderRadius: 2.5,
                    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    textTransform: 'none',
                    animation: 'slideInUp 0.5s ease-out 0.4s backwards',
                    '&:hover': {
                      bgcolor: '#1b5e20',
                      boxShadow: '0 8px 20px rgba(46, 125, 50, 0.4)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  Continue → 
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* STEP 1: Fill Form */}
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', py: 2, animation: 'slideInUp 0.6s ease-out' }}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, color: '#2E7D32' }}>
                👤 Tell Us About You
              </Typography>
              <Typography sx={{ fontSize: '1rem', color: '#666', fontWeight: 500 }}>
                Let's personalize your nutrition plan
              </Typography>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #E8F5E9', animation: 'slideInUp 0.6s ease-out 0.1s backwards' }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                {error && <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.95rem', py: 1.2, borderRadius: 2, animation: 'slideInDown 0.4s ease-out' }}>{error}</Alert>}

                {/* Physical Metrics */}
                <Box sx={{ mb: 3, pb: 2.5, borderBottom: '2px solid #E8F5E9' }}>
                  <Typography sx={{ fontWeight: 800, mb: 2, fontSize: '1.2rem', color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontSize: '1.3rem' }}>📏</Box> Physical Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Age (years)"
                        name="age"
                        type="number"
                        placeholder="Enter your age"
                        value={formData.age}
                        onChange={handleFormChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ mr: 1 }}>
                              👤
                            </InputAdornment>
                          ),
                          style: { padding: '14px 12px', fontWeight: 600 }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: 'auto',
                            bgcolor: '#f8fdf6',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            borderRadius: '12px',
                            '& fieldset': { borderColor: '#E8F5E9', borderWidth: '2px' },
                            '&:hover fieldset': { borderColor: '#2E7D32', borderWidth: '2px' },
                            '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                          },
                          '& .MuiOutlinedInput-input::placeholder': { opacity: 0.6 },
                          '& .MuiInputBase-input': { fontWeight: 600 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Weight (kg)"
                        name="weight"
                        type="number"
                        placeholder="Enter your weight"
                        value={formData.weight}
                        onChange={handleFormChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ mr: 1 }}>
                              ⚖️
                            </InputAdornment>
                          ),
                          endAdornment: formData.weight && (
                            <InputAdornment position="end" sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#2E7D32' }}>
                              kg
                            </InputAdornment>
                          ),
                          style: { padding: '14px 12px', fontWeight: 600 }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: 'auto',
                            bgcolor: '#f8fdf6',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            borderRadius: '12px',
                            '& fieldset': { borderColor: '#E8F5E9', borderWidth: '2px' },
                            '&:hover fieldset': { borderColor: '#2E7D32', borderWidth: '2px' },
                            '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                          },
                          '& .MuiOutlinedInput-input::placeholder': { opacity: 0.6 },
                          '& .MuiInputBase-input': { fontWeight: 600 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Height (cm)"
                        name="height"
                        type="number"
                        placeholder="Enter your height"
                        value={formData.height}
                        onChange={handleFormChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ mr: 1 }}>
                              📐
                            </InputAdornment>
                          ),
                          endAdornment: formData.height && (
                            <InputAdornment position="end" sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#2E7D32' }}>
                              cm
                            </InputAdornment>
                          ),
                          style: { padding: '14px 12px', fontWeight: 600 }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: 'auto',
                            bgcolor: '#f8fdf6',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            borderRadius: '12px',
                            '& fieldset': { borderColor: '#E8F5E9', borderWidth: '2px' },
                            '&:hover fieldset': { borderColor: '#2E7D32', borderWidth: '2px' },
                            '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                          },
                          '& .MuiOutlinedInput-input::placeholder': { opacity: 0.6 },
                          '& .MuiInputBase-input': { fontWeight: 600 }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Goals & Lifestyle */}
                <Box sx={{ mb: 3, pb: 2.5, borderBottom: '2px solid #E8F5E9' }}>
                  <Typography sx={{ fontWeight: 800, mb: 2, fontSize: '1.2rem', color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontSize: '1.3rem' }}>🎯</Box> Goals & Lifestyle
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Select 
                          name="goal" 
                          value={formData.goal} 
                          onChange={handleFormChange} 
                          sx={{ 
                            height: '50px',
                            bgcolor: '#f8fdf6',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8F5E9', borderWidth: '2px' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                          }}
                        >
                          <MenuItem value="weight_loss">💪 Weight Loss</MenuItem>
                          <MenuItem value="weight_gain">📈 Weight Gain</MenuItem>
                          <MenuItem value="maintain_weight">⚖️ Maintain Weight</MenuItem>
                          <MenuItem value="muscle_gain">🏋️ Muscle Gain</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Select 
                          name="activityLevel" 
                          value={formData.activityLevel} 
                          onChange={handleFormChange} 
                          sx={{ 
                            height: '50px',
                            bgcolor: '#f8fdf6',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8F5E9', borderWidth: '2px' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                          }}
                        >
                          <MenuItem value="sedentary">🪑 Sedentary</MenuItem>
                          <MenuItem value="light">🚶 Light</MenuItem>
                          <MenuItem value="moderate">🏃 Moderate</MenuItem>
                          <MenuItem value="very_active">⚡ Very Active</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* Diet Preferences */}
                <Box sx={{ mb: 3, pb: 2.5, borderBottom: '2px solid #E8F5E9' }}>
                  <Typography sx={{ fontWeight: 800, mb: 2, fontSize: '1.2rem', color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontSize: '1.3rem' }}>🥗</Box> Diet Preferences
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Select 
                          name="dietPreference" 
                          value={formData.dietPreference} 
                          onChange={handleFormChange} 
                          sx={{ 
                            height: '50px',
                            bgcolor: '#f8fdf6',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8F5E9', borderWidth: '2px' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                          }}
                        >
                          <MenuItem value="balanced">🥗 Balanced</MenuItem>
                          <MenuItem value="high_protein">🥩 High Protein</MenuItem>
                          <MenuItem value="low_carb">🌾 Low Carb</MenuItem>
                          <MenuItem value="vegan">🌱 Vegan</MenuItem>
                          <MenuItem value="vegetarian">🥬 Vegetarian</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Select 
                          name="cuisinePreference" 
                          value={formData.cuisinePreference} 
                          onChange={handleFormChange} 
                          sx={{ 
                            height: '50px',
                            bgcolor: '#f8fdf6',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8F5E9', borderWidth: '2px' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                          }}
                        >
                          <MenuItem value="any">🌍 Any Cuisine</MenuItem>
                          <MenuItem value="Indian">🍛 Indian</MenuItem>
                          <MenuItem value="American">🍔 American</MenuItem>
                          <MenuItem value="Chinese">🥢 Chinese</MenuItem>
                          <MenuItem value="Italian">🍝 Italian</MenuItem>
                          <MenuItem value="Mediterranean">🫒 Mediterranean</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* Meal Planning */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 800, mb: 2, fontSize: '1.2rem', color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontSize: '1.3rem' }}>🍽️</Box> Meal Planning
                  </Typography>
                  <Grid container spacing={2}>
                    {planType === 'weekly' ? (
                      <>
                        <Grid item xs={12}>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#2E7D32', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ fontSize: '1.1rem' }}>✨</Box> Select meal types to include each day
                          </Typography>
                          <FormGroup row sx={{ gap: 1, flexWrap: 'wrap' }}>
                            {weeklyMealTypeOptions.map((mealType) => (
                              <FormControlLabel
                                key={mealType}
                                control={
                                  <Checkbox
                                    checked={formData.weeklyMealTypes.includes(mealType)}
                                    onChange={() => handleWeeklyMealTypeToggle(mealType)}
                                    sx={{
                                      color: '#E8F5E9',
                                      '&.Mui-checked': { color: '#2E7D32' },
                                      transition: 'all 0.3s',
                                      '&:hover': { transform: 'scale(1.15)' }
                                    }}
                                  />
                                }
                                label={mealType}
                                sx={{
                                  m: 0,
                                  p: 1.2,
                                  borderRadius: '12px',
                                  bgcolor: formData.weeklyMealTypes.includes(mealType) ? 'rgba(46, 125, 50, 0.1)' : '#f8fdf6',
                                  border: formData.weeklyMealTypes.includes(mealType) ? '2px solid #2E7D32' : '2px solid #E8F5E9',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                  fontWeight: 600,
                                  '&:hover': {
                                    border: '2px solid #2E7D32',
                                    bgcolor: 'rgba(46, 125, 50, 0.08)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)'
                                  }
                                }}
                              />
                            ))}
                          </FormGroup>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Approx. meals per day (for nutrition targets)"
                            name="numMeals"
                            type="number"
                            placeholder="Enter number"
                            value={formData.numMeals}
                            onChange={handleFormChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start" sx={{ mr: 1 }}>
                                  🍽️
                                </InputAdornment>
                              ),
                              style: { padding: '14px 12px', fontWeight: 600 }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: 'auto',
                                bgcolor: '#f8fdf6',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                borderRadius: '12px',
                                '& fieldset': { borderColor: '#E8F5E9', borderWidth: '2px' },
                                '&:hover fieldset': { borderColor: '#2E7D32', borderWidth: '2px' },
                                '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                              },
                              '& .MuiOutlinedInput-input::placeholder': { opacity: 0.6 },
                              '& .MuiInputBase-input': { fontWeight: 600 }
                            }}
                          />
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Meals per Day (3-6)"
                            name="numMeals"
                            type="number"
                            placeholder="e.g., 3"
                            value={formData.numMeals}
                            onChange={handleFormChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start" sx={{ mr: 1 }}>
                                  🍽️
                                </InputAdornment>
                              ),
                              style: { padding: '14px 12px', fontWeight: 600 }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: 'auto',
                                bgcolor: '#f8fdf6',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                borderRadius: '12px',
                                '& fieldset': { borderColor: '#E8F5E9', borderWidth: '2px' },
                                '&:hover fieldset': { borderColor: '#2E7D32', borderWidth: '2px' },
                                '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                              },
                              '& .MuiOutlinedInput-input::placeholder': { opacity: 0.6 },
                              '& .MuiInputBase-input': { fontWeight: 600 }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Snacks per Day (0-3)"
                            name="numSnacks"
                            type="number"
                            placeholder="e.g., 1"
                            value={formData.numSnacks}
                            onChange={handleFormChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start" sx={{ mr: 1 }}>
                                  🍎
                                </InputAdornment>
                              ),
                              style: { padding: '14px 12px', fontWeight: 600 }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: 'auto',
                                bgcolor: '#f8fdf6',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                borderRadius: '12px',
                                '& fieldset': { borderColor: '#E8F5E9', borderWidth: '2px' },
                                '&:hover fieldset': { borderColor: '#2E7D32', borderWidth: '2px' },
                                '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                              },
                              '& .MuiOutlinedInput-input::placeholder': { opacity: 0.6 },
                              '& .MuiInputBase-input': { fontWeight: 600 }
                            }}
                          />
                        </Grid>
                      </>
                    )}
                    {planType === 'weekly' && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Select
                            name="weeklyVariety"
                            value={formData.weeklyVariety}
                            onChange={handleFormChange}
                            sx={{
                              height: '50px',
                              bgcolor: '#f8fdf6',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              borderRadius: '12px',
                              transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8F5E9', borderWidth: '2px' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                            }}
                          >
                            <MenuItem value="high">📅 High Variety (different meals each day)</MenuItem>
                            <MenuItem value="balanced">🔁 Balanced Variety</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button 
                    fullWidth 
                    onClick={() => setStep(0)} 
                    variant="outlined" 
                    sx={{ 
                      py: 1.6, 
                      fontSize: '1rem', 
                      fontWeight: 800, 
                      color: '#2E7D32', 
                      borderColor: '#2E7D32', 
                      borderWidth: '2px',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                      '&:hover': {
                        borderWidth: '2px',
                        bgcolor: 'rgba(46, 125, 50, 0.08)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)'
                      }
                    }}
                  >
                    ← Back
                  </Button>
                  <Button 
                    fullWidth 
                    onClick={handleGeneratePlan} 
                    disabled={!formData.age || !formData.weight || !formData.height || loading} 
                    variant="contained" 
                    sx={{ 
                      py: 1.6, 
                      fontSize: '1rem', 
                      fontWeight: 800, 
                      bgcolor: '#2E7D32',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover:not(:disabled)': {
                        bgcolor: '#1b5e20',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 24px rgba(46, 125, 50, 0.3)'
                      },
                      '&:disabled': {
                        bgcolor: '#BDBDBD',
                        color: '#9E9E9E'
                      }
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: 'inherit' }} />
                        Generating...
                      </Box>
                    ) : (
                      '✨ Generate Plan'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* STEP 2: Results */}
        {step === 2 && nutritionTargets && (
          <Box sx={{ py: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, mb: 1, color: '#1b5e20' }}>
                ✨ Your Plan is Ready!
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.2rem' }, opacity: 0.75, fontWeight: 600, color: '#2E7D32', mb: 3 }}>
                Your personalized nutrition targets tailored to your goals
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 3, borderRadius: 2.5, border: '3px solid #2E7D32', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8F4 100%)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(46,125,50,0.2)' } }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🔥</Typography>
                  <Typography sx={{ fontSize: '0.85rem', mb: 0.8, fontWeight: 700, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: 0.5 }}>Daily Calories</Typography>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#1b5e20' }}>{Math.round(nutritionTargets.dailyCalories)}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#2E7D32', fontWeight: 700 }}>kcal per day</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 3, borderRadius: 2.5, border: '3px solid #FF9800', background: 'linear-gradient(135deg, #FFF3E0 0%, #FFEBEE 100%)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(255,152,0,0.2)' } }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🥩</Typography>
                  <Typography sx={{ fontSize: '0.85rem', mb: 0.8, fontWeight: 700, color: '#FF9800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Protein</Typography>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#E65100' }}>{Math.round(nutritionTargets.protein)}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#FF9800', fontWeight: 700 }}>grams daily</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 3, borderRadius: 2.5, border: '3px solid #4CAF50', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8F4 100%)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(76,175,80,0.2)' } }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🌾</Typography>
                  <Typography sx={{ fontSize: '0.85rem', mb: 0.8, fontWeight: 700, color: '#4CAF50', textTransform: 'uppercase', letterSpacing: 0.5 }}>Carbohydrates</Typography>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#2E7D32' }}>{Math.round(nutritionTargets.carbs)}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#4CAF50', fontWeight: 700 }}>grams daily</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', p: 3, borderRadius: 2.5, border: '3px solid #2196F3', background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(33,150,243,0.2)' } }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🧈</Typography>
                  <Typography sx={{ fontSize: '0.85rem', mb: 0.8, fontWeight: 700, color: '#2196F3', textTransform: 'uppercase', letterSpacing: 0.5 }}>Dietary Fats</Typography>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#1565C0' }}>{Math.round(nutritionTargets.fat)}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#2196F3', fontWeight: 700 }}>grams daily</Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Your Profile Info */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, mb: 3, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ fontSize: '1.5rem' }}>👤</Box>Your Profile Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Card sx={{ p: 2.5, borderRadius: 2, border: '2px solid #E8F5E9', background: '#f8fdf6', textAlign: 'center', transition: 'all 0.3s', '&:hover': { border: '2px solid #2E7D32', boxShadow: '0 8px 16px rgba(46,125,50,0.1)' } }}>
                    <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>📏</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Age</Typography>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#2E7D32' }}>{formData.age}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>years</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card sx={{ p: 2.5, borderRadius: 2, border: '2px solid #E8F5E9', background: '#f8fdf6', textAlign: 'center', transition: 'all 0.3s', '&:hover': { border: '2px solid #2E7D32', boxShadow: '0 8px 16px rgba(46,125,50,0.1)' } }}>
                    <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>⚖️</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Weight</Typography>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#2E7D32' }}>{formData.weight}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>kg</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card sx={{ p: 2.5, borderRadius: 2, border: '2px solid #E8F5E9', background: '#f8fdf6', textAlign: 'center', transition: 'all 0.3s', '&:hover': { border: '2px solid #2E7D32', boxShadow: '0 8px 16px rgba(46,125,50,0.1)' } }}>
                    <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>📐</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Height</Typography>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#2E7D32' }}>{formData.height}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>cm</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card sx={{ p: 2.5, borderRadius: 2, border: '2px solid #FFF3E0', background: 'linear-gradient(135deg, #FFF3E0 0%, #FFEBEE 100%)', textAlign: 'center', transition: 'all 0.3s', '&:hover': { border: '2px solid #FF9800', boxShadow: '0 8px 16px rgba(255,152,0,0.1)' } }}>
                    <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>�️</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF9800', textTransform: 'uppercase' }}>Goal</Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#E65100', lineHeight: 1.2 }}>{formatLabel(formData.goal)}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card sx={{ p: 2.5, borderRadius: 2, border: '2px solid #E3F2FD', background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)', textAlign: 'center', transition: 'all 0.3s', '&:hover': { border: '2px solid #2196F3', boxShadow: '0 8px 16px rgba(33,150,243,0.1)' } }}>
                    <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>⚡</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#2196F3', textTransform: 'uppercase' }}>Activity</Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#1565C0', lineHeight: 1.2 }}>{formatLabel(formData.activityLevel)}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card sx={{ p: 2.5, borderRadius: 2, border: '2px solid #E8F5E9', background: '#f8fdf6', textAlign: 'center', transition: 'all 0.3s', '&:hover': { border: '2px solid #2E7D32', boxShadow: '0 8px 16px rgba(46,125,50,0.1)' } }}>
                    <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>🥗</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Diet Type</Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#2E7D32', lineHeight: 1.2 }}>{formatLabel(formData.dietPreference)}</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            {planType === 'weekly' && mealPlanData && (
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, mb: 2, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ fontSize: '1.5rem' }}>📆</Box> Weekly Meal Plan
                </Typography>
                {Object.entries(mealPlanData).map(([day, dayMeals]) => (
                  <Accordion
                    key={day}
                    expanded={expandedDay === day}
                    onChange={() => setExpandedDay(expandedDay === day ? false : day)}
                    sx={{ mb: 1.2, borderRadius: '12px !important', overflow: 'hidden', border: '1px solid #E8F5E9' }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 800, color: '#2E7D32' }}>{day}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      {Object.entries(dayMeals).map(([mealType, mealItems]) => (
                        <Box key={`${day}-${mealType}`} sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 700, color: '#1B5E20', mb: 0.7 }}>{mealType}</Typography>
                          {mealItems.map((meal, idx) => (
                            <Card key={`${day}-${mealType}-${idx}`} sx={{ p: 1.4, mb: 0.8, borderRadius: 2, bgcolor: '#f8fdf6', border: '1px solid #d9eadc' }}>
                              <Typography sx={{ fontWeight: 700, color: '#1B5E20' }}>{meal.name}</Typography>
                              <Box sx={{ display: 'flex', gap: 0.8, mt: 0.6, flexWrap: 'wrap' }}>
                                <Chip size="small" label={`${meal.calories} kcal`} sx={{ bgcolor: '#FFF3E0', color: '#E65100' }} />
                                <Chip size="small" label={meal.cuisine} sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }} />
                                <Chip
                                  size="small"
                                  label={meal.cuisine_match ? 'Cuisine Match' : 'Cuisine Fallback'}
                                  sx={{
                                    bgcolor: meal.cuisine_match ? '#E3F2FD' : '#F5F5F5',
                                    color: meal.cuisine_match ? '#1565C0' : '#616161'
                                  }}
                                />
                              </Box>
                            </Card>
                          ))}
                          <Divider />
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Button 
                fullWidth 
                onClick={() => setStep(1)} 
                variant="outlined" 
                sx={{ 
                  py: 1.8, 
                  fontSize: '1.05rem', 
                  fontWeight: 800, 
                  color: '#2E7D32', 
                  borderColor: '#2E7D32', 
                  borderWidth: 2.5,
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  '&:hover': {
                    bgcolor: 'rgba(46, 125, 50, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)'
                  }
                }}
              >
                ← Edit Plan
              </Button>
              <Button 
                fullWidth 
                onClick={() => setShowSaveDialog(true)} 
                variant="contained" 
                sx={{ 
                  py: 1.8, 
                  fontSize: '1.05rem', 
                  fontWeight: 800, 
                  bgcolor: '#FF9800',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  '&:hover': { 
                    bgcolor: '#E65100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(255, 152, 0, 0.3)'
                  }
                }}
              >
                💾 Save Plan
              </Button>
              <Button 
                fullWidth 
                onClick={() => navigate('/meal-planner')} 
                variant="contained" 
                sx={{ 
                  py: 1.8, 
                  fontSize: '1.05rem', 
                  fontWeight: 800, 
                  bgcolor: '#2E7D32',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  '&:hover': { 
                    bgcolor: '#1b5e20',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(46, 125, 50, 0.3)'
                  }
                }}
              >
                🍽️ View Your Meals → 
              </Button>
            </Box>

            {/* Save Dialog */}
            <Dialog 
              open={showSaveDialog} 
              onClose={() => setShowSaveDialog(false)}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f5faf7 0%, #e8f5e9 100%)'
                }
              }}
            >
              <DialogTitle sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#1B5E20' }}>
                💾 Save Your Meal Plan
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: '0.95rem', color: '#666', mb: 2, fontWeight: 500 }}>
                    Give your meal plan a name so you can easily find it later
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g., High Protein Weight Loss Plan"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          📝
                        </InputAdornment>
                      ),
                      style: { padding: '14px 12px', fontWeight: 600 }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 'auto',
                        bgcolor: '#fff',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s',
                        borderRadius: '12px',
                        '& fieldset': { borderColor: '#E8F5E9', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#2E7D32', borderWidth: '2px' },
                        '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: '2px', boxShadow: '0 0 0 4px rgba(46, 125, 50, 0.12)' }
                      },
                      '& .MuiInputBase-input': { fontWeight: 600 }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSavePlan()}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button 
                  onClick={() => setShowSaveDialog(false)}
                  sx={{ color: '#2E7D32', fontWeight: 700 }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSavePlan}
                  variant="contained"
                  sx={{
                    bgcolor: '#FF9800',
                    fontWeight: 800,
                    px: 3,
                    '&:hover': {
                      bgcolor: '#E65100'
                    }
                  }}
                >
                  Save Plan ✓
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default CreatePlan
