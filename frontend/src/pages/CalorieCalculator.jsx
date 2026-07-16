import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts'

// Add keyframe animations
const styles = `
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

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.85);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes shimmer {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideLeft {
    from {
      opacity: 0;
      transform: translateX(40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideRight {
    from {
      opacity: 0;
      transform: translateX(-40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }

  .slide-in-down {
    animation: slideInDown 0.5s ease-out;
  }

  .bounce-in {
    animation: bounceIn 0.5s ease-out;
  }

  .fade-in-scale {
    animation: fadeInScale 0.5s ease-out;
  }

  .slide-left {
    animation: slideLeft 0.5s ease-out;
  }

  .slide-right {
    animation: slideRight 0.5s ease-out;
  }

  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .range-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.12);
    outline: none;
  }

  .range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid white;
    background: var(--slider-color, #2E7D32);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }

  .range-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid white;
    background: var(--slider-color, #2E7D32);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

function CalorieCalculator() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    age: 25,
    weight: 70,
    height: 175,
    gender: 'male',
    activityLevel: 'moderate',
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSliderChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  const calculateCalories = () => {
    setLoading(true)

    // Simulate calculation with delay for animation effect
    setTimeout(() => {
      // Harris-Benedict Formula
      let bmr
      const age = parseInt(formData.age)
      const weight = parseFloat(formData.weight)
      const height = parseInt(formData.height)

      if (formData.gender === 'male') {
        bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      } else {
        bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
      }

      // Activity multiplier
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very_active: 1.725,
        extremely_active: 1.9,
      }

      const dailyCalories = Math.round(bmr * activityMultipliers[formData.activityLevel])

      // Calculate macros (balanced diet)
      const protein = Math.round((dailyCalories * 0.3) / 4)
      const carbs = Math.round((dailyCalories * 0.45) / 4)
      const fat = Math.round((dailyCalories * 0.25) / 9)

      setResults({
        bmr: Math.round(bmr),
        dailyCalories,
        protein,
        carbs,
        fat,
      })
      setLoading(false)
    }, 1500)
  }

  const COLORS = ['#F57C00', '#2E7D32', '#1976D2']

  const macroData = results
    ? [
        { name: 'Protein', value: results.protein, cals: Math.round(results.protein * 4) },
        { name: 'Carbs', value: results.carbs, cals: Math.round(results.carbs * 4) },
        { name: 'Fat', value: results.fat, cals: Math.round(results.fat * 9) },
      ]
    : []

  const macroBreakdown = results
    ? [
        {
          name: 'Protein',
          grams: results.protein,
          calories: Math.round(results.protein * 4),
          percentage: 30,
          color: '#F57C00',
        },
        {
          name: 'Carbs',
          grams: results.carbs,
          calories: Math.round(results.carbs * 4),
          percentage: 45,
          color: '#2E7D32',
        },
        {
          name: 'Fat',
          grams: results.fat,
          calories: Math.round(results.fat * 9),
          percentage: 25,
          color: '#1976D2',
        },
      ]
    : []

  // Step content
  const steps = [
    {
      title: '👤 Personal Info',
      emoji: '📋',
      description: 'Tell us about yourself',
      color: '#2E7D32'
    },
    {
      title: '📏 Physical Measurements',
      emoji: '📐',
      description: 'Enter your body metrics',
      color: '#F57C00'
    },
    {
      title: '⚡ Activity Level',
      emoji: '🏃',
      description: 'Choose your lifestyle',
      color: '#1976D2'
    },
    {
      title: '🎯 Calculate Results',
      emoji: '✨',
      description: 'Get your personalized plan',
      color: '#C2185B'
    }
  ]

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)', py: 2, px: 0 }}>
      <Container maxWidth={results ? 'lg' : 'sm'} sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Hero Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, color: '#1b5e20', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
            💪 Calorie Calculator
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontSize: '0.95rem', fontWeight: 500, mb: 1 }}>
            Discover your personalized calorie needs
          </Typography>
          <Box sx={{ display: 'inline-block', px: 2, py: 0.8, bgcolor: 'rgba(46, 125, 50, 0.1)', borderLeft: '3px solid #2E7D32', borderRadius: 1 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#2E7D32', fontWeight: 700 }}>
              📊 Harris-Benedict Formula
            </Typography>
          </Box>
        </Box>

        {/* Step Progress Indicator */}
        {!results && (
          <Box sx={{ mb: 3.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: { xs: 0.5, md: 1 } }}>
              {steps.map((s, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    opacity: index <= step ? 1 : 0.4,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 40, md: 50 },
                      height: { xs: 40, md: 50 },
                      borderRadius: '50%',
                      bgcolor: index <= step ? s.color : '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 900,
                      fontSize: { xs: '1.3rem', md: '1.6rem' },
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: index === step ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: index <= step ? `0 8px 20px ${s.color}40` : 'none',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      }
                    }}
                    onClick={() => setStep(index)}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.65rem', md: '0.75rem' },
                      fontWeight: 700,
                      mt: 1,
                      textAlign: 'center',
                      color: index === step ? '#1b5e20' : '#999'
                    }}
                  >
                    {s.title}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Progress Bar */}
            <LinearProgress
              variant="determinate"
              value={(step + 1) * 25}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#E8F5E9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, #2E7D32, #F57C00, #1976D2, #C2185B)`,
                  transition: 'all 0.5s ease'
                }
              }}
            />
          </Box>
        )}

        {/* Input Form Card - Step by Step */}
        {!results && (
          <Card sx={{ 
            mb: 3, 
            borderRadius: 2, 
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
            border: '1px solid #E8F5E9',
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fdf7 100%)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column' }}>
              
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <Box className="slide-left">
                  <Typography sx={{ fontWeight: 900, mb: 4, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ fontSize: { xs: '2.4rem', md: '3.2rem' } }}>👤</Box> Personal Information
                  </Typography>
                    <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1B5E20' }}>Gender</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#2E7D32', bgcolor: '#E8F5E9', px: 2, py: 0.6, borderRadius: 1 }}>
                        {formData.gender === 'male' ? '👨 Male' : '👩 Female'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      {[
                        { value: 'male', label: '👨 Male' },
                        { value: 'female', label: '👩 Female' }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          onClick={() => handleSelectChange({ target: { name: 'gender', value: option.value } })}
                          sx={{
                            flex: 1,
                            py: 1.8,
                            borderRadius: 1.5,
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            border: '2px solid',
                            transition: 'all 0.3s ease',
                            bgcolor: formData.gender === option.value ? '#2E7D32' : 'transparent',
                            borderColor: formData.gender === option.value ? '#2E7D32' : '#E8F5E9',
                            color: formData.gender === option.value ? 'white' : '#666',
                            '&:hover': {
                              bgcolor: formData.gender === option.value ? '#1b5e20' : '#E8F5E9',
                              boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1B5E20', mb: 1.2 }}>Age</Typography>
                    <Box sx={{ px: 1.2, py: 1.5, bgcolor: '#f1f8f4', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#666' }}>Age Years</Typography>
                        <Box sx={{ 
                          px: 1.5, 
                          py: 0.6, 
                          bgcolor: '#2E7D32', 
                          color: 'white', 
                          borderRadius: 1, 
                          fontWeight: 900, 
                          fontSize: '1.05rem',
                          textAlign: 'center',
                          minWidth: '75px'
                        }}>
                          {formData.age}
                        </Box>
                      </Box>
                      <Box
                        component="input"
                        type="range"
                        className="range-slider"
                        value={formData.age}
                        min={15}
                        max={100}
                        step={1}
                        onChange={(e) => handleSliderChange('age', parseInt(e.target.value, 10))}
                        sx={{ '--slider-color': '#2E7D32' }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.2, fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>
                        <span>15</span>
                        <span>100</span>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Step 1: Physical Measurements */}
              {step === 1 && (
                <Box className="slide-left">
                  <Typography sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' } }}>📏</Box> Physical Measurements
                  </Typography>

                  {/* Weight */}
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B5E20', mb: 1.2 }}>Weight (kg)</Typography>
                    <Box sx={{ px: 1.2, py: 1.5, bgcolor: '#f1f8f4', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#666' }}>Weight</Typography>
                        <Box sx={{ 
                          px: 1.5, 
                          py: 0.6, 
                          bgcolor: '#F57C00', 
                          color: 'white', 
                          borderRadius: 1, 
                          fontWeight: 900, 
                          fontSize: '1.05rem',
                          textAlign: 'center',
                          minWidth: '65px'
                        }}>
                          {formData.weight} kg
                        </Box>
                      </Box>
                      <Box
                        component="input"
                        type="range"
                        className="range-slider"
                        value={formData.weight}
                        min={30}
                        max={250}
                        step={0.5}
                        onChange={(e) => handleSliderChange('weight', parseFloat(e.target.value))}
                        sx={{ '--slider-color': '#F57C00' }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.2, fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>
                        <span>30</span>
                        <span>250</span>
                      </Box>
                    </Box>
                  </Box>

                  {/* Height */}
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B5E20', mb: 1.2 }}>Height (cm)</Typography>
                    <Box sx={{ px: 1.2, py: 1.5, bgcolor: '#f1f8f4', borderRadius: 1.5, border: '1px solid #E8F5E9' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#666' }}>Height</Typography>
                        <Box sx={{ 
                          px: 1.5, 
                          py: 0.6, 
                          bgcolor: '#F57C00', 
                          color: 'white', 
                          borderRadius: 1, 
                          fontWeight: 900, 
                          fontSize: '1.05rem',
                          textAlign: 'center',
                          minWidth: '65px'
                        }}>
                          {formData.height} cm
                        </Box>
                      </Box>
                      <Box
                        component="input"
                        type="range"
                        className="range-slider"
                        value={formData.height}
                        min={130}
                        max={300}
                        step={1}
                        onChange={(e) => handleSliderChange('height', parseInt(e.target.value, 10))}
                        sx={{ '--slider-color': '#F57C00' }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.2, fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>
                        <span>130</span>
                        <span>300</span>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Step 2: Activity Level */}
              {step === 2 && (
                <Box className="slide-left">
                  <Typography sx={{ fontWeight: 900, mb: 2.5, fontSize: { xs: '1.6rem', md: '2rem' }, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ fontSize: { xs: '1.8rem', md: '2rem' } }}>⚡</Box> Activity Level
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', color: '#666', mb: 3, fontWeight: 500 }}>
                    Choose the option that best describes your lifestyle
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { value: 'sedentary', label: '🪑 Sedentary', desc: 'Little or no exercise' },
                      { value: 'light', label: '🚶 Light', desc: '1-3 days/week exercise' },
                      { value: 'moderate', label: '🏃 Moderate', desc: '3-5 days/week exercise' },
                      { value: 'very_active', label: '⚡ Very Active', desc: '5-6 days/week exercise' },
                      { value: 'extremely_active', label: '🔥 Extremely Active', desc: 'Daily exercise' }
                    ].map((option) => (
                      <Grid item xs={12} sm={6} key={option.value}>
                        <Card
                          onClick={() => handleSelectChange({ target: { name: 'activityLevel', value: option.value } })}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: formData.activityLevel === option.value ? '2px solid #1976D2' : '1px solid #E8F5E9',
                            bgcolor: formData.activityLevel === option.value ? '#E3F2FD' : '#fff',
                            transform: formData.activityLevel === option.value ? 'scale(1.03)' : 'scale(1)',
                            boxShadow: formData.activityLevel === option.value ? '0 8px 20px rgba(25, 118, 210, 0.2)' : '0 1px 4px rgba(0,0,0,0.03)',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              transform: formData.activityLevel === option.value ? 'scale(1.03)' : 'scale(1.01)'
                            }
                          }}
                        >
                          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', mb: 0.5 }}>{option.label}</Typography>
                          <Typography sx={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>{option.desc}</Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Step 3: Review & Calculate */}
              {step === 3 && (
                <Box className="slide-left">
                  <Typography sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '1.6rem', md: '2rem' }, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ fontSize: { xs: '1.8rem', md: '2rem' } }}>✨</Box> Review Your Data
                  </Typography>
                  <Grid container spacing={1.5}>
                    {[
                      { icon: '👤', label: 'Gender', value: formData.gender === 'male' ? '👨 Male' : '👩 Female' },
                      { icon: '🎂', label: 'Age', value: `${formData.age} years` },
                      { icon: '⚖️', label: 'Weight', value: `${formData.weight} kg` },
                      { icon: '📏', label: 'Height', value: `${formData.height} cm` },
                      { icon: '⚡', label: 'Activity', value: formData.activityLevel.replace('_', ' ').toUpperCase() }
                    ].map((item, idx) => (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Box sx={{ p: 1.5, bgcolor: '#f1f8f4', borderRadius: 1.5, border: '1px solid #E8F5E9', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)', transform: 'translateY(-2px)' } }}>
                          <Typography sx={{ fontSize: '1.3rem', mb: 0.3 }}>{item.icon}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, mb: 0.3 }}>{item.label}</Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#2E7D32' }}>{item.value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                <Button
                  onClick={prevStep}
                  disabled={step === 0}
                  sx={{
                    flex: step === 3 ? 1 : 1,
                    py: 1.2,
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    borderRadius: 1.5,
                    border: '2px solid #2E7D32',
                    color: '#2E7D32',
                    bgcolor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover:not(:disabled)': {
                      bgcolor: '#E8F5E9',
                      boxShadow: '0 8px 20px rgba(46, 125, 50, 0.2)',
                    },
                    '&:disabled': { opacity: 0.3 }
                  }}
                >
                  ← Back
                </Button>

                {step < 3 && (
                  <Button
                    onClick={nextStep}
                    sx={{
                      flex: 1,
                      py: 1.2,
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: 1.5,
                      bgcolor: '#2E7D32',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#1b5e20',
                        boxShadow: '0 8px 20px rgba(46, 125, 50, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Next →
                  </Button>
                )}

                {step === 3 && (
                  <Button
                    onClick={calculateCalories}
                    disabled={loading}
                    sx={{
                      flex: 1,
                      py: 1.2,
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: 1.5,
                      bgcolor: '#C2185B',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover:not(:disabled)': {
                        bgcolor: '#A01647',
                        boxShadow: '0 8px 20px rgba(194, 24, 91, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': { opacity: 0.6 }
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={18} sx={{ color: 'white' }} />
                        <span>Calculating...</span>
                      </Box>
                    ) : (
                      '🎯 Calculate My Calories'
                    )}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            animation: 'fadeInScale 0.5s ease-out'
          }}>
            <Box sx={{ 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}>
              <CircularProgress 
                size={80}
                sx={{ 
                  color: '#2E7D32',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} 
              />
              <Box sx={{ 
                position: 'absolute',
                fontSize: '2.5rem',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                ⚙️
              </Box>
            </Box>
            <Typography sx={{ 
              fontWeight: 700, 
              fontSize: '1.2rem', 
              color: '#2E7D32',
              mb: 1
            }}>
              Analyzing Your Data...
            </Typography>
            <Typography sx={{ 
              fontWeight: 500, 
              fontSize: '0.9rem', 
              color: '#666'
            }}>
              Using Harris-Benedict Formula to calculate your personalized needs
            </Typography>
          </Box>
        )}

        {/* Results Section */}
        {results && !loading && (
          <Box className="slide-in-up">
            {/* Main Results Cards */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3} sx={{ animation: 'bounceIn 0.6s ease-out 0s' }}>
                <Card sx={{ 
                  textAlign: 'center',
                  borderRadius: 1.5,
                  border: '1px solid #2E7D32',
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8F4 100%)',
                  boxShadow: '0 8px 20px rgba(46, 125, 50, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  '&:hover': { 
                    transform: 'translateY(-8px) scale(1.03)', 
                    boxShadow: '0 20px 40px rgba(46, 125, 50, 0.3)',
                    border: '1px solid #1b5e20'
                  },
                  height: '100%',
                  cursor: 'pointer'
                }}>
                  <CardContent sx={{ py: 2, px: 1.2 }}>
                    <Typography sx={{ fontSize: '2.2rem', mb: 0.6, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}>🔥</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#2E7D32', mb: 0.6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      BMR
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: '#1B5E20', mb: 0.3, fontSize: '1.6rem' }}>
                      {results.bmr}
                    </Typography>
                    <Typography sx={{ color: '#558b2f', fontWeight: 600, fontSize: '0.75rem' }}>kcal</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ animation: 'bounceIn 0.6s ease-out 0.1s backwards' }}>
                <Card sx={{ 
                  textAlign: 'center',
                  borderRadius: 1.5,
                  border: '1px solid #F57C00',
                  background: 'linear-gradient(135deg, #FFF3E0 0%, #FFEBEE 100%)',
                  boxShadow: '0 8px 20px rgba(245, 124, 0, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  '&:hover': { 
                    transform: 'translateY(-8px) scale(1.03)', 
                    boxShadow: '0 20px 40px rgba(245, 124, 0, 0.3)',
                    border: '1px solid #E65100'
                  },
                  height: '100%',
                  cursor: 'pointer'
                }}>
                  <CardContent sx={{ py: 2, px: 1.2 }}>
                    <Typography sx={{ fontSize: '2.2rem', mb: 0.6, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}>⚡</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#F57C00', mb: 0.6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      Daily
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: '#E65100', mb: 0.3, fontSize: '1.6rem' }}>
                      {results.dailyCalories}
                    </Typography>
                    <Typography sx={{ color: '#BF360C', fontWeight: 600, fontSize: '0.75rem' }}>kcal</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ animation: 'bounceIn 0.6s ease-out 0.2s backwards' }}>
                <Card sx={{ 
                  textAlign: 'center',
                  borderRadius: 1.5,
                  border: '1px solid #F57C00',
                  background: 'linear-gradient(135deg, #FFF3E0 0%, #FFEBEE 100%)',
                  boxShadow: '0 8px 20px rgba(245, 124, 0, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  '&:hover': { 
                    transform: 'translateY(-8px) scale(1.03)', 
                    boxShadow: '0 20px 40px rgba(245, 124, 0, 0.3)',
                    border: '1px solid #E65100'
                  },
                  height: '100%',
                  cursor: 'pointer'
                }}>
                  <CardContent sx={{ py: 2, px: 1.2 }}>
                    <Typography sx={{ fontSize: '2.2rem', mb: 0.6, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite 0.3s' }}>🥩</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#F57C00', mb: 0.6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      Protein
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: '#E65100', mb: 0.3, fontSize: '1.6rem' }}>
                      {results.protein}g
                    </Typography>
                    <Typography sx={{ color: '#BF360C', fontWeight: 600, fontSize: '0.75rem' }}>30%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ animation: 'bounceIn 0.6s ease-out 0.3s backwards' }}>
                <Card sx={{ 
                  textAlign: 'center',
                  borderRadius: 1.5,
                  border: '1px solid #1976D2',
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
                  boxShadow: '0 8px 20px rgba(25, 118, 210, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  '&:hover': { 
                    transform: 'translateY(-8px) scale(1.03)', 
                    boxShadow: '0 20px 40px rgba(25, 118, 210, 0.3)',
                    border: '1px solid #0d47a1'
                  },
                  height: '100%',
                  cursor: 'pointer'
                }}>
                  <CardContent sx={{ py: 2, px: 1.2 }}>
                    <Typography sx={{ fontSize: '2.2rem', mb: 0.6, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite 0.6s' }}>🌾</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1976D2', mb: 0.6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      Carbs
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: '#0d47a1', mb: 0.3, fontSize: '1.6rem' }}>
                      {results.carbs}g
                    </Typography>
                    <Typography sx={{ color: '#1565c0', fontWeight: 600, fontSize: '0.75rem' }}>45%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Pie Chart & Fat Card */}
            <Grid container spacing={3} sx={{ mb: 3, alignItems: 'stretch' }}>
              <Grid item xs={12} md={6} sx={{ animation: 'fadeInScale 0.7s ease-out 0.4s backwards', display: 'flex' }}>
                <Card sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  border: '1px solid #E8F5E9',
                  height: '100%',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <CardContent sx={{ pt: 3, pb: 2, px: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 800, mb: 2.5, fontSize: '1.1rem', color: '#1B5E20' }}>
                      📊 Nutrition Breakdown
                    </Typography>
                    <Box sx={{ width: '100%', height: 320, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                          <Pie
                            data={macroData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="cals"
                          >
                            {macroData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value) => `${value} kcal`} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} sx={{ animation: 'fadeInScale 0.7s ease-out 0.5s backwards', display: 'flex' }}>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%)',
                        color: '#c2185b',
                        borderRadius: 1.5,
                        border: '1px solid #F48FB1',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 32px rgba(194, 24, 91, 0.2)',
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.3, textTransform: 'uppercase' }}>
                              🧈 Fat Intake
                            </Typography>
                            <Typography sx={{ opacity: 0.9, fontWeight: 600, fontSize: '0.8rem' }}>
                              25% of daily
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, animation: 'pulse 2s ease-in-out infinite' }}>
                              {results.fat}g
                            </Typography>
                            <Typography sx={{ opacity: 0.9, fontWeight: 600, fontSize: '0.8rem', mt: 0.2 }}>
                              {Math.round(results.fat * 9)} kcal
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: '#f1f8f4', borderRadius: 1.5, border: '1px solid #E8F5E9', height: '100%', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 20px rgba(46, 125, 50, 0.1)', transform: 'translateY(-2px)' } }}>
                      <Typography sx={{ fontWeight: 700, color: '#2E7D32', mb: 1.2, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ fontSize: '1.1rem' }}>💪</Box> Your Daily Nutrition Goals
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #E8F5E9', transition: 'all 0.3s ease', textAlign: 'center', '&:hover': { boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)', transform: 'translateY(-2px)' } }}>
                            <Typography sx={{ fontWeight: 700, color: '#666', fontSize: '0.75rem', mb: 0.3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Total Calories</Typography>
                            <Typography sx={{ fontWeight: 900, color: '#2E7D32', fontSize: '1.4rem' }}>{results.dailyCalories}</Typography>
                            <Typography sx={{ fontWeight: 600, color: '#999', fontSize: '0.7rem', mt: 0.2 }}>kcal/day</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #FFF3E0', transition: 'all 0.3s ease', textAlign: 'center', '&:hover': { boxShadow: '0 4px 12px rgba(245, 124, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                            <Typography sx={{ fontWeight: 700, color: '#F57C00', fontSize: '0.75rem', mb: 0.3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Protein</Typography>
                            <Typography sx={{ fontWeight: 900, color: '#F57C00', fontSize: '1.4rem' }}>{results.protein}g</Typography>
                            <Typography sx={{ fontWeight: 600, color: '#999', fontSize: '0.7rem', mt: 0.2 }}>30% • Muscle Build</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #E3F2FD', transition: 'all 0.3s ease', textAlign: 'center', '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)', transform: 'translateY(-2px)' } }}>
                            <Typography sx={{ fontWeight: 700, color: '#1976D2', fontSize: '0.75rem', mb: 0.3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Carbohydrates</Typography>
                            <Typography sx={{ fontWeight: 900, color: '#1976D2', fontSize: '1.4rem' }}>{results.carbs}g</Typography>
                            <Typography sx={{ fontWeight: 600, color: '#999', fontSize: '0.7rem', mt: 0.2 }}>45% • Energy</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #FCE4EC', transition: 'all 0.3s ease', textAlign: 'center', '&:hover': { boxShadow: '0 4px 12px rgba(194, 24, 91, 0.1)', transform: 'translateY(-2px)' } }}>
                            <Typography sx={{ fontWeight: 700, color: '#C2185B', fontSize: '0.75rem', mb: 0.3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Dietary Fat</Typography>
                            <Typography sx={{ fontWeight: 900, color: '#C2185B', fontSize: '1.4rem' }}>{results.fat}g</Typography>
                            <Typography sx={{ fontWeight: 600, color: '#999', fontSize: '0.7rem', mt: 0.2 }}>25% • Health</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Reset Button */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                onClick={() => { setResults(null); setStep(0); }}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  borderRadius: 2,
                  border: '2px solid #2E7D32',
                  color: '#2E7D32',
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#E8F5E9',
                    boxShadow: '0 8px 20px rgba(46, 125, 50, 0.2)',
                  }
                }}
              >
                🔄 Calculate Again
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default CalorieCalculator
