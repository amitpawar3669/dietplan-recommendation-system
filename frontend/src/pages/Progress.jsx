import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Fade from '@mui/material/Fade'
import Grow from '@mui/material/Grow'
import Divider from '@mui/material/Divider'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import InsightsIcon from '@mui/icons-material/Insights'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useMealStore } from '../store/mealStore'

// Animation styles
const styles = `
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  .slide-in-down { animation: slideInDown 0.6s ease-out; }
  .slide-in-up { animation: slideInUp 0.6s ease-out; }
  .bounce-in { animation: bounceIn 0.6s ease-out; }
  .fade-in-scale { animation: fadeInScale 0.5s ease-out; }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

function Progress() {
  const navigate = useNavigate()
  const { nutritionTargets, userData, mealPlan } = useMealStore()
  
  const [currentWeight, setCurrentWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [desiredDuration, setDesiredDuration] = useState('')
  const [progressData, setProgressData] = useState(null)
  const [weeklyData, setWeeklyData] = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')
  const [safeMinWarning, setSafeMinWarning] = useState('')
  const [suggestedDuration, setSuggestedDuration] = useState(null)
  const [inputValidation, setInputValidation] = useState({
    currentValid: false,
    targetValid: false,
    durationValid: true
  })

  // Check if meal plan data exists
  const hasMealPlan = nutritionTargets?.dailyCalories && Array.isArray(mealPlan?.meals) && mealPlan.meals.length > 0

  // Real-time validation on input changes
  const handleCurrentWeightChange = (e) => {
    const value = e.target.value
    setCurrentWeight(value)
    const isValid = value && parseFloat(value) > 0
    setInputValidation(prev => ({ ...prev, currentValid: isValid }))
    
    // Auto-suggest duration if both weights provided
    if (isValid && targetWeight) {
      const current = parseFloat(value)
      const target = parseFloat(targetWeight)
      if (current > 0 && target > 0 && current !== target) {
        const totalChange = Math.abs(target - current)
        const suggested = calculateRecommendedDuration(totalChange)
        setSuggestedDuration(suggested)
      }
    }
  }

  const handleTargetWeightChange = (e) => {
    const value = e.target.value
    setTargetWeight(value)
    const isValid = value && parseFloat(value) > 0
    setInputValidation(prev => ({ ...prev, targetValid: isValid }))
    
    // Auto-suggest duration if both weights provided
    if (isValid && currentWeight) {
      const current = parseFloat(currentWeight)
      const target = parseFloat(value)
      if (current > 0 && target > 0 && current !== target) {
        const totalChange = Math.abs(target - current)
        const suggested = calculateRecommendedDuration(totalChange)
        setSuggestedDuration(suggested)
      }
    }
  }

  const handleDurationChange = (e) => {
    const value = e.target.value
    setDesiredDuration(value)
    const isValid = !value || (parseFloat(value) > 0 && parseFloat(value) <= 104)
    setInputValidation(prev => ({ ...prev, durationValid: isValid }))
  }

  // Quick action: Apply suggested duration
  const applySuggestedDuration = () => {
    if (suggestedDuration) {
      setDesiredDuration(String(suggestedDuration))
      setSuggestedDuration(null)
    }
  }

  // Validate input data
  const validateInputs = () => {
    if (!currentWeight || !targetWeight) {
      setError('Please enter current and target weights')
      return false
    }

    const current = parseFloat(currentWeight)
    const target = parseFloat(targetWeight)

    if (current <= 0 || target <= 0) {
      setError('Weight values must be greater than 0')
      return false
    }

    if (current === target) {
      setError('🎉 You have already reached your goal!')
      return false
    }

    return true
  }

  // Calculate recommended duration based on healthy pace (0.5-1 kg/week)
  const calculateRecommendedDuration = (totalChange) => {
    const healthyPaceMin = 0.5 // kg/week
    const healthyPaceMax = 1.0 // kg/week
    const recommended = Math.ceil(totalChange / healthyPaceMax)
    return Math.max(4, recommended) // Minimum 4 weeks
  }

  // Determine goal status based on pace
  const getGoalStatus = (totalChange, weeks) => {
    const weeklyPace = totalChange / weeks
    
    if (weeklyPace <= 0.5) {
      return {
        status: '✅ Healthy',
        label: 'Healthy and sustainable pace',
        intensity: 'low',
        color: '#2E7D32'
      }
    } else if (weeklyPace <= 1.0) {
      return {
        status: '⚡ Moderate',
        label: 'Good steady progress',
        intensity: 'medium',
        color: '#F57C00'
      }
    } else if (weeklyPace <= 1.5) {
      return {
        status: '⚠️ Aggressive',
        label: 'Fast pace - may be challenging',
        intensity: 'high',
        color: '#D32F2F'
      }
    } else {
      return {
        status: '🚨 Unrealistic',
        label: 'Target may be too ambitious - consider extending duration',
        intensity: 'critical',
        color: '#B71C1C'
      }
    }
  }

  const getSafeMinimumCalories = () => {
    const gender = String(userData?.gender || userData?.sex || userData?.biologicalSex || '').toLowerCase()
    return gender.startsWith('f') ? 1200 : 1500
  }

  const toPositiveNumber = (value) => {
    const n = Number(value)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  const safeRound = (value, digits = 0) => {
    if (!Number.isFinite(value)) return 0
    const factor = 10 ** digits
    return Math.round(value * factor) / factor
  }

  const estimateTdee = (currentWeightValue) => {
    const age = Number(userData?.age)
    const height = Number(userData?.height)
    const activity = String(userData?.activityLevel || 'moderate').toLowerCase()
    const gender = String(userData?.gender || userData?.sex || '').toLowerCase()

    if (age > 0 && height > 0 && currentWeightValue > 0) {
      const sexConstant = gender.startsWith('f') ? -161 : 5
      const bmr = (10 * currentWeightValue) + (6.25 * height) - (5 * age) + sexConstant
      const activityFactor = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very_active: 1.725,
      }[activity] || 1.55
      return Math.round(bmr * activityFactor)
    }

    const nutritionFallback = Number(nutritionTargets?.dailyCalories)
    if (nutritionFallback > 0) {
      return Math.round(nutritionFallback + 300)
    }
    return 2200
  }

  const calculateProgress = (weeksOverride = null) => {
    setError('')
    setSafeMinWarning('')
    if (!validateInputs()) return

    setCalculating(true)

    setTimeout(() => {
      try {
        const current = toPositiveNumber(currentWeight)
        const target = toPositiveNumber(targetWeight)
        if (current == null || target == null) {
          setError('Please enter valid weight values')
          setCalculating(false)
          return
        }

        // Calculate total weight change needed
        const totalChange = Math.abs(target - current)
        const isWeightLoss = target < current
        const recommendedDuration = calculateRecommendedDuration(totalChange)
        
        // Use provided duration or auto-calculate, and always sanitize to finite positive value.
        const parsedOverride = weeksOverride != null ? toPositiveNumber(weeksOverride) : null
        const parsedInputDuration = desiredDuration ? toPositiveNumber(desiredDuration) : null
        let finalDuration = parsedOverride ?? parsedInputDuration ?? recommendedDuration
        
        // Validate duration
        if (!Number.isFinite(finalDuration) || finalDuration < 1) {
          setError('Duration must be at least 1 week')
          setCalculating(false)
          return
        }

        // Core calorie math for timeline-based fat loss planning.
        const totalKgToLose = Math.max(current - target, 0)
        const totalCaloriesToBurn = totalKgToLose * 7700
        const safeMinimumCalories = getSafeMinimumCalories()
        const estimatedTDEE = estimateTdee(current)

        let weeklyCalorieDeficit = totalCaloriesToBurn / finalDuration
        let dailyCalorieDeficit = weeklyCalorieDeficit / 7
        let recommendedCalories = estimatedTDEE - dailyCalorieDeficit

        // Check if recommended calories falls below safe minimum
        if (recommendedCalories < safeMinimumCalories && totalKgToLose > 0) {
          const minRequiredWeeks = Math.ceil(totalCaloriesToBurn / (estimatedTDEE - safeMinimumCalories))
          setSafeMinWarning(`⚠️ Warning: ${finalDuration} weeks would require ${Math.round(recommendedCalories)} kcal/day (below ${safeMinimumCalories} minimum). Recommend at least ${minRequiredWeeks} weeks for safe intake.`)
          // Adjust to safe minimum and recalculate deficits
          recommendedCalories = safeMinimumCalories
          dailyCalorieDeficit = estimatedTDEE - safeMinimumCalories
          weeklyCalorieDeficit = dailyCalorieDeficit * 7
        }

        // Projected weekly loss based on selected duration.
        const weeklyRequirement = finalDuration > 0 ? (totalChange / finalDuration) : 0

        // Get status based on pace
        const statusInfo = getGoalStatus(totalChange, finalDuration)
        
        const isRecommended = finalDuration >= recommendedDuration

        // Generate projection data
        const projectionData = []
        const weeklyChange = isWeightLoss ? -weeklyRequirement : weeklyRequirement
        const totalWeeks = Math.max(1, Math.round(finalDuration))
        
        for (let week = 0; week <= totalWeeks; week++) {
          const projectedWeight = current + (weeklyChange * week)
          projectionData.push({
            week: week,
            weight: safeRound(projectedWeight, 1),
            label: `W${week}`
          })
        }

        setProgressData({
          currentWeight: current,
          targetWeight: target,
          totalChange: safeRound(totalChange, 1),
          isWeightLoss,
          desiredDuration: totalWeeks,
          recommendedDuration,
          isRecommended,
          weeklyRequirement: safeRound(weeklyRequirement, 2),
          projectedLossPerWeek: safeRound(weeklyRequirement, 2),
          totalCaloriesToBurn: safeRound(totalCaloriesToBurn),
          weeklyCalorieDeficit: safeRound(weeklyCalorieDeficit),
          dailyCalorieDeficit: safeRound(dailyCalorieDeficit),
          recommendedCalories: safeRound(recommendedCalories),
          tdee: estimatedTDEE,
          safeMinimumCalories,
          statusInfo,
          projectionData,
          remainingWeight: safeRound((target - current), 1),
        })

        // Generate real, accurate tracking data
        const actualRecommendedCalories = safeRound(recommendedCalories)
        
        if (hasMealPlan && nutritionTargets) {
          // Real calorie intake data (same each day - consistent plan)
          const weeklyCalories = Array(7).fill(null).map((_, i) => ({
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            consumed: actualRecommendedCalories,
            target: actualRecommendedCalories,
            deficit: dailyCalorieDeficit > 0 ? safeRound(dailyCalorieDeficit) : 0
          }))

          // Real macro data (actual targets from plan, not fake percentages)
          const actualProtein = safeRound(Number(nutritionTargets.protein) || 0, 1)
          const actualCarbs = safeRound(Number(nutritionTargets.carbs) || 0, 1)
          const actualFat = safeRound(Number(nutritionTargets.fat) || 0, 1)

          const weeklyMacros = [
            { 
              name: 'Protein', 
              value: actualProtein,
              target: actualProtein,
              percentage: actualProtein > 0 ? safeRound((actualProtein / (actualProtein + actualCarbs + actualFat)) * 100) : 0,
              color: '#F57C00',
              unit: 'g'
            },
            { 
              name: 'Carbs', 
              value: actualCarbs,
              target: actualCarbs,
              percentage: actualCarbs > 0 ? safeRound((actualCarbs / (actualProtein + actualCarbs + actualFat)) * 100) : 0,
              color: '#1976D2',
              unit: 'g'
            },
            { 
              name: 'Fat', 
              value: actualFat,
              target: actualFat,
              percentage: actualFat > 0 ? safeRound((actualFat / (actualProtein + actualCarbs + actualFat)) * 100) : 0,
              color: '#C2185B',
              unit: 'g'
            }
          ]

          setWeeklyData({
            calories: weeklyCalories,
            macros: weeklyMacros,
            summary: {
              totalDailyCalories: actualRecommendedCalories,
              tdee: estimatedTDEE,
              dailyDeficit: safeRound(dailyCalorieDeficit),
              weeklyDeficit: safeRound(weeklyCalorieDeficit),
              estimatedWeeklyLoss: safeRound((weeklyCalorieDeficit / 7700), 2)
            }
          })
        } else {
          setWeeklyData(null)
        }

        setCalculating(false)
      } catch (err) {
        setError('An error occurred during calculation')
        setCalculating(false)
      }
    }, 800)
  }

  const handleNavigateToMealPlan = () => navigate('/meal-planner')
  const handleNavigateToCreatePlan = () => navigate('/create-plan')

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 9, md: 10 }, pb: { xs: 2, sm: 3, md: 3.5 }, px: { xs: 2.5, sm: 3.5, md: 4 } }}>
      {/* Header */}
      <Fade in timeout={500}>
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid #d7f0db',
          boxShadow: '0 18px 40px rgba(46, 125, 50, 0.12)',
          background: 'radial-gradient(circle at 20% 20%, rgba(129, 199, 132, 0.28), transparent 48%), radial-gradient(circle at 80% 30%, rgba(255, 193, 7, 0.18), transparent 45%), linear-gradient(135deg, #f4fbf5 0%, #ecf7ef 45%, #ffffff 100%)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.2, color: '#1b5e20', fontSize: { xs: '1.7rem', md: '2.5rem' }, className: 'slide-in-down' }}>
                Your Progress Dashboard
              </Typography>
              <Typography sx={{ color: '#47614a', fontSize: '1rem', fontWeight: 500, mb: 2 }}>
                Track changes, monitor nutrition, and keep your momentum with a clean weekly view.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip icon={<TrendingUpIcon />} label="Weekly Trend" sx={{ bgcolor: '#E8F5E9', color: '#1B5E20', fontWeight: 700 }} />
                <Chip icon={<InsightsIcon />} label="Smart Insights" sx={{ bgcolor: '#E3F2FD', color: '#0D47A1', fontWeight: 700 }} />
                <Chip icon={<EmojiEventsIcon />} label="Goal Focus" sx={{ bgcolor: '#FFF8E1', color: '#E65100', fontWeight: 700 }} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#2E7D32', boxShadow: '0 8px 20px rgba(46,125,50,0.25)' }}>
                  <LocalFireDepartmentIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '0.78rem', color: '#647768', fontWeight: 700, textTransform: 'uppercase' }}>
                    Progress Mode
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#1B5E20' }}>
                    Smooth and Consistent
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      </Fade>

      <Divider sx={{ mb: 3, borderColor: '#d7e7da' }} />



      {/* Error Alert */}
      {error && (
        <Alert 
          severity={error.includes('already reached') ? 'success' : 'error'} 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {safeMinWarning && (
        <Fade in timeout={500}>
          <Alert
            severity="success"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8F4 100%)',
              border: '2px solid #2E7D32',
              fontWeight: 600
            }}
            onClose={() => setSafeMinWarning('')}
          >
            {safeMinWarning}
          </Alert>
        </Fade>
      )}

      <Grow in timeout={600}>
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={4} sx={{ animation: 'slideInUp 0.6s ease-out 0s' }}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
            border: '2px solid #E8F5E9',
            transition: 'all 0.3s ease',
            height: '100%',
            '&:hover': {
              boxShadow: '0 16px 40px rgba(46, 125, 50, 0.15)',
              transform: 'translateY(-4px)',
              borderColor: '#2E7D32'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, mb: 3, color: '#1b5e20', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ fontSize: '1.4rem' }}>⚖️</Box> Set Your Goal
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <TextField
                    label="Current Weight (kg)"
                    type="number"
                    value={currentWeight}
                    onChange={handleCurrentWeightChange}
                    disabled={calculating}
                    fullWidth
                    placeholder="70"
                    helperText={inputValidation.currentValid ? "✓ Valid" : "Enter your current weight"}
                    error={currentWeight && !inputValidation.currentValid}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': { borderColor: '#2E7D32' },
                        '&.Mui-focused': { 
                          boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)',
                          borderColor: '#2E7D32'
                        }
                      }
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    label="Target Weight (kg)"
                    type="number"
                    value={targetWeight}
                    onChange={handleTargetWeightChange}
                    disabled={calculating}
                    fullWidth
                    placeholder="65"
                    helperText={inputValidation.targetValid ? "✓ Valid" : "Enter your target weight"}
                    error={targetWeight && !inputValidation.targetValid}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': { borderColor: '#2E7D32' },
                        '&.Mui-focused': { 
                          boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)',
                          borderColor: '#2E7D32'
                        }
                      }
                    }}
                  />
                </Box>

                {suggestedDuration && !desiredDuration && (
                  <Grow in timeout={400}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#E8F5E9', 
                      borderRadius: 2, 
                      border: '2px solid #2E7D32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)'
                      }
                    }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B5E20', mb: 0.5 }}>
                          💡 Suggested Duration
                        </Typography>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#2E7D32' }}>
                          {suggestedDuration} weeks
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={applySuggestedDuration}
                        sx={{
                          background: '#2E7D32',
                          fontWeight: 700,
                          textTransform: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: '#1b5e20',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </Box>
                  </Grow>
                )}

                <Box>
                  <TextField
                    label="Target Duration (weeks)"
                    type="number"
                    value={desiredDuration}
                    onChange={handleDurationChange}
                    disabled={calculating}
                    fullWidth
                    placeholder="Leave blank for auto"
                    helperText={inputValidation.durationValid ? "Optional - leaves blank for healthy pace" : "Must be between 1-104 weeks"}
                    error={!inputValidation.durationValid}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': { borderColor: '#2E7D32' },
                        '&.Mui-focused': { 
                          boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.1)',
                          borderColor: '#2E7D32'
                        }
                      }
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={calculateProgress}
                  disabled={calculating || !inputValidation.currentValid || !inputValidation.targetValid || !inputValidation.durationValid}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%)',
                    py: 1.8,
                    mt: 1,
                    fontWeight: 800,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    color: 'white',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    '&:hover:not(:disabled)': {
                      boxShadow: '0 12px 32px rgba(46, 125, 50, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': { opacity: 0.6 }
                  }}
                >
                  {calculating ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '📈 Calculate'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Goal Display Section */}
        {progressData && (
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {/* A. Goal Summary - Current to Target */}
              <Grid item xs={12} sx={{ animation: 'bounceIn 0.6s ease-out 0.1s backwards' }}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8F4 100%)',
                  borderRadius: 2,
                  border: '2px solid #2E7D32',
                  boxShadow: '0 8px 20px rgba(46, 125, 50, 0.15)',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
                      🎯 Your Goal
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 500, mb: 0.5 }}>
                          Current
                        </Typography>
                        <Typography sx={{ fontWeight: 900, fontSize: '2.2rem', color: '#1B5E20' }}>
                          {progressData.currentWeight}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#999', fontWeight: 600 }}>kg</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.8rem', color: '#2E7D32', fontWeight: 700 }}>→</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#999', fontWeight: 600, mt: 1 }}>
                          {progressData.isWeightLoss ? 'Lose' : 'Gain'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 500, mb: 0.5 }}>
                          Target
                        </Typography>
                        <Typography sx={{ fontWeight: 900, fontSize: '2.2rem', color: '#1B5E20' }}>
                          {progressData.targetWeight}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#999', fontWeight: 600 }}>kg</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center', pt: 2, borderTop: '1px solid rgba(46, 125, 50, 0.2)' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#666', fontWeight: 500 }}>
                        Total Change: <strong sx={{ fontSize: '1.1rem', color: '#2E7D32' }}>{progressData.totalChange}kg</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* B. Plan Details */}
              <Grid item xs={12} sm={6} sx={{ animation: 'fadeInScale 0.7s ease-out 0.2s backwards' }}>
                <Card sx={{ borderRadius: 2, border: '1px solid #E8F5E9', height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
                      📋 Plan Details
                    </Typography>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 500, mb: 0.8 }}>
                        Duration
                      </Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: '2.5rem', color: '#1976D2' }}>
                        {progressData.desiredDuration}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>weeks</Typography>
                    </Box>
                    <Box sx={{ borderTop: '1px solid #E8F5E9', pt: 2 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 500, mb: 0.8 }}>
                        Per Week
                      </Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: '2.5rem', color: '#F57C00' }}>
                        {progressData.weeklyRequirement}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>kg/week</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* C. Status & Recommendation */}
              <Grid item xs={12} sm={6} sx={{ animation: 'fadeInScale 0.7s ease-out 0.3s backwards' }}>
                <Card sx={{ borderRadius: 2, border: `2px solid ${progressData.statusInfo.color}`, height: '100%', background: `${progressData.statusInfo.color}08`, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 16px ${progressData.statusInfo.color}30` } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
                      ✓ Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: progressData.statusInfo.color,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.5 }
                        }
                      }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: progressData.statusInfo.color }}>
                        {progressData.statusInfo.status}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', color: '#666', mb: 2, lineHeight: 1.6 }}>
                      {progressData.statusInfo.label}
                    </Typography>
                    {!progressData.isRecommended && (
                      <Alert severity="info" sx={{ mb: 2, borderRadius: 1, fontSize: '0.8rem' }}>
                        <Typography sx={{ fontSize: '0.75rem' }}>
                          💡 Try <strong>{progressData.recommendedDuration}+ weeks</strong> for optimal health
                        </Typography>
                      </Alert>
                    )}
                    {!progressData.isRecommended && (
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          const adjustedDuration = Math.max(1, Number(progressData.recommendedDuration) || 1)
                          setDesiredDuration(String(adjustedDuration))
                          calculateProgress(adjustedDuration)
                        }}
                        disabled={calculating}
                        sx={{
                          py: 1,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          borderColor: progressData.statusInfo.color,
                          color: progressData.statusInfo.color,
                          transition: 'all 0.3s ease',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: `${progressData.statusInfo.color}15`,
                            borderColor: progressData.statusInfo.color,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        🔄 Adjust
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sx={{ animation: 'fadeInScale 0.7s ease-out 0.35s backwards' }}>
                <Card sx={{ borderRadius: 2, border: '1px solid #E8F5E9', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' } }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '0.95rem' }, color: '#1B5E20', mb: 2 }}>
                      📊 Calorie Analysis & Breakdown
                    </Typography>
                    
                    {/* Main Stats Grid - Responsive */}
                    <Grid container spacing={ { xs: 1, sm: 1.5 } } sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ p: { xs: 1, sm: 1.4 }, borderRadius: 1.5, bgcolor: '#fff3e0', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(230, 81, 0, 0.15)' } }}>
                          <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, color: '#e65100', textTransform: 'uppercase', mb: 0.5 }}>
                            Your TDEE
                          </Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.6rem' }, color: '#E65100' }}>
                            {progressData.tdee}
                          </Typography>
                          <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, color: '#999', fontWeight: 600 }}>kcal/day (maintenance)</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ p: { xs: 1, sm: 1.4 }, borderRadius: 1.5, bgcolor: '#e8f5e9', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)' } }}>
                          <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, color: '#2E7D32', textTransform: 'uppercase', mb: 0.5 }}>
                            Daily Goal
                          </Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.6rem' }, color: '#2E7D32' }}>
                            {progressData.recommendedCalories}
                          </Typography>
                          <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, color: '#999', fontWeight: 600 }}>kcal/day (recommended)</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ p: { xs: 1, sm: 1.4 }, borderRadius: 1.5, bgcolor: '#ffebee', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)' } }}>
                          <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, color: '#d32f2f', textTransform: 'uppercase', mb: 0.5 }}>
                            Daily Deficit
                          </Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.6rem' }, color: '#D32F2F' }}>
                            -{progressData.dailyCalorieDeficit}
                          </Typography>
                          <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, color: '#999', fontWeight: 600 }}>kcal/day deficit</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Detailed Breakdown - Responsive Grid */}
                    <Box sx={{ p: { xs: 1.2, sm: 1.5 }, bgcolor: '#fafafa', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                      <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, fontWeight: 700, color: '#1B5E20', mb: 1 }}>
                        📈 Weekly Projection
                      </Typography>
                      <Grid container spacing={ { xs: 0.8, sm: 1 } }>
                        <Grid item xs={6} sm={6} md={3}>
                          <Box sx={{ cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.02)' } }}>
                            <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: '#666', fontWeight: 600 }}>Weekly Deficit</Typography>
                            <Typography sx={{ fontWeight: 800, color: '#1976D2', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                              {progressData.weeklyCalorieDeficit.toLocaleString()} kcal
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3}>
                          <Box sx={{ cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.02)' } }}>
                            <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: '#666', fontWeight: 600 }}>Weeks to Goal</Typography>
                            <Typography sx={{ fontWeight: 800, color: '#F57C00', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                              {progressData.desiredDuration} weeks
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3} sx={{ pt: { xs: 0.8, sm: 1 }, borderTop: { xs: 'none', md: '1px solid #E8F5E9' } }}>
                          <Box sx={{ cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.02)' } }}>
                            <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: '#666', fontWeight: 600 }}>Total Burn</Typography>
                            <Typography sx={{ fontWeight: 800, color: '#2E7D32', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                              {progressData.totalCaloriesToBurn.toLocaleString()} kcal
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3} sx={{ pt: { xs: 0.8, sm: 1 }, borderTop: { xs: 'none', md: '1px solid #E8F5E9' } }}>
                          <Box sx={{ cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.02)' } }}>
                            <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: '#666', fontWeight: 600 }}>Safe Minimum</Typography>
                            <Typography sx={{ fontWeight: 800, color: '#1565C0', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                              {progressData.safeMinimumCalories} kcal
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Empty State */}
        {!progressData && (
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, border: '2px dashed #E8F5E9', p: 6, textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <Typography sx={{ color: '#999', fontSize: '1.2rem', fontWeight: 500 }}>
                  📝 Enter your weights and duration
                </Typography>
                <Typography sx={{ color: '#BBB', fontSize: '0.9rem', mt: 1 }}>
                  System will calculate your personalized plan
                </Typography>
              </Box>
            </Card>
          </Grid>
        )}

        {/* Nutrition Integration Section */}
        {hasMealPlan && weeklyData && (
          <>
            {/* Calorie Tracking */}
            <Grid item xs={12} md={6} sx={{ animation: 'fadeInScale 0.7s ease-out 0.5s backwards' }}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                border: '1px solid #E8F5E9',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 800, mb: 2.5, fontSize: '1.1rem', color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontSize: '1.3rem' }}>🔥</Box> Weekly Calorie Intake
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData.calories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                      <XAxis dataKey="day" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}
                      />
                      <Bar dataKey="target" fill="#E8F5E9" name="Target" />
                      <Bar dataKey="consumed" fill="#2E7D32" name="Consumed" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Macro Tracking */}
            <Grid item xs={12} md={6} sx={{ animation: 'fadeInScale 0.7s ease-out 0.6s backwards' }}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                border: '1px solid #E8F5E9',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 800, mb: 2.5, fontSize: '1.1rem', color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontSize: '1.3rem' }}>💪</Box> Daily Macros
                  </Typography>
                  <Grid container spacing={1.5}>
                    {weeklyData.macros.map((macro, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Box sx={{ p: 1.5, bgcolor: '#f9fdf7', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#666' }}>
                              {macro.name}
                            </Typography>
                            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: macro.color }}>
                              {macro.value}g / {macro.target}g
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((macro.value / macro.target) * 100, 100)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#E8F5E9',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: macro.color,
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Navigation to Meal Plan */}
            <Grid item xs={12} sx={{ animation: 'slideInUp 0.6s ease-out 0.7s backwards' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleNavigateToMealPlan}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderColor: '#2E7D32',
                  color: '#2E7D32',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#E8F5E9',
                    borderColor: '#1b5e20',
                    boxShadow: '0 8px 20px rgba(46, 125, 50, 0.2)'
                  }
                }}
              >
                👀 View Your Meal Plan →
              </Button>
            </Grid>
          </>
        )}

        {/* Action Buttons */}
        {progressData && (
          <Grid item xs={12} sx={{ animation: 'slideInUp 0.6s ease-out 0.75s backwards' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleNavigateToCreatePlan}
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    '&:hover': {
                      boxShadow: '0 12px 24px rgba(46, 125, 50, 0.3)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  📋 Create Plan
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleNavigateToMealPlan}
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    '&:hover': {
                      boxShadow: '0 12px 24px rgba(25, 118, 210, 0.3)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  🍽️ View Meal Plan
                </Button>
              </Grid>

              <Grid item xs={12} sm={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    '&:hover': {
                      boxShadow: '0 12px 24px rgba(245, 124, 0, 0.3)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  ⟳ Refresh Data
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Quick Reference - Goal Summary */}
        {progressData && (
          <Grid item xs={12} sx={{ animation: 'fadeInScale 0.7s ease-out 0.8s backwards' }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #F8FDF6 0%, #F1F8F4 100%)',
              borderRadius: 3,
              border: '2px solid #E8F5E9',
              boxShadow: '0 8px 24px rgba(46, 125, 50, 0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 800, mb: 2, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1, color: '#1B5E20' }}>
                  <Box sx={{ fontSize: '1.2rem' }}>📋</Box> Your Goal Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                        From → To
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1B5E20' }}>
                        {progressData.currentWeight}kg → {progressData.targetWeight}kg
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                        Pace Per Week
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1976D2' }}>
                        {progressData.weeklyRequirement}kg/week
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                        Duration
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#F57C00' }}>
                        {progressData.desiredDuration} weeks
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1.5, border: `2px solid ${progressData.statusInfo.color}` }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                        Status
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: progressData.statusInfo.color }}>
                        {progressData.statusInfo.status}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      </Grow>
    </Container>
  )
}

export default Progress
