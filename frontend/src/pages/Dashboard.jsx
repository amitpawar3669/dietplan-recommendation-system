import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import NextIcon from '@mui/icons-material/NavigateNext'
import { useNavigate } from 'react-router-dom'
import NutritionCard from '../components/NutritionCard'
import MealCard from '../components/MealCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useMealStore } from '../store/mealStore'
import { mealApi } from '../api/mealApi'

// Animation styles
const styles = `
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

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

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .slide-in-down {
    animation: slideInDown 0.8s ease-out;
  }

  .slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }

  .bounce-in {
    animation: bounceIn 0.6s ease-out;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

function Dashboard() {
  const navigate = useNavigate()
  const { nutritionTargets, mealPlan, setNutritionTargets, setError } = useMealStore()
  const [sampleMeals, setSampleMeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSampleData = async () => {
      try {
        // Try to load sample meals from backend
        const meals = await mealApi.searchMeals('popular')
        if (meals && meals.length > 0) {
          setSampleMeals(meals.slice(0, 3))
        } else {
          // Use fallback sample meals
          setSampleMeals([
            {
              name: 'Grilled Chicken Salad',
              type: 'Lunch',
              calories: 350,
              protein: 45,
              carbs: 15,
              fat: 8,
              image: 'https://via.placeholder.com/300x200?text=Grilled+Chicken+Salad',
            },
            {
              name: 'Quinoa Bowl',
              type: 'Breakfast',
              calories: 450,
              protein: 18,
              carbs: 65,
              fat: 12,
              image: 'https://via.placeholder.com/300x200?text=Quinoa+Bowl',
            },
            {
              name: 'Baked Salmon',
              type: 'Dinner',
              calories: 520,
              protein: 52,
              carbs: 20,
              fat: 18,
              image: 'https://via.placeholder.com/300x200?text=Baked+Salmon',
            },
          ])
        }
      } catch (error) {
        // Use fallback meals on error
        setSampleMeals([
          {
            name: 'Grilled Chicken Salad',
            type: 'Lunch',
            calories: 350,
            protein: 45,
            carbs: 15,
            fat: 8,
            image: 'https://via.placeholder.com/300x200?text=Grilled+Chicken+Salad',
          },
          {
            name: 'Quinoa Bowl',
            type: 'Breakfast',
            calories: 450,
            protein: 18,
            carbs: 65,
            fat: 12,
            image: 'https://via.placeholder.com/300x200?text=Quinoa+Bowl',
          },
          {
            name: 'Baked Salmon',
            type: 'Dinner',
            calories: 520,
            protein: 52,
            carbs: 20,
            fat: 18,
            image: 'https://via.placeholder.com/300x200?text=Baked+Salmon',
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadSampleData()
  }, [])

  const howItWorks = [
    {
      number: 1,
      title: 'Share Your Details',
      description: 'Tell us about yourself - your age, weight, height, and fitness level. The more accurate your information, the better your personalized plan.',
      icon: '👤'
    },
    {
      number: 2,
      title: 'Personalized Plan Created',
      description: 'Our system generates a custom nutrition plan based on your goals, dietary preferences, and lifestyle. Get meal suggestions designed just for you.',
      icon: '🎯'
    },
    {
      number: 3,
      title: 'Track & Achieve',
      description: 'Follow your meal plan, track your progress, and adjust as needed. Watch your health goals come to life with consistent nutrition and dedication.',
      icon: '✨'
    },
  ]

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 1.5, md: 2 } }}>
      {/* Hero Section */}
      <Box
        className="slide-in-down"
        sx={{
          background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.72) 0%, rgba(13, 56, 24, 0.72) 100%), url("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1400&h=500&fit=crop&crop=entropy&cs=tinysrgb&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          borderRadius: 3,
          p: { xs: 4, md: 8 },
          mb: 8,
          textAlign: 'center',
          minHeight: '350px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 12px 32px rgba(46, 125, 50, 0.3)',
          '&:hover': {
            boxShadow: '0 16px 40px rgba(46, 125, 50, 0.4)',
            transform: 'translateY(-4px)',
          }
        }}
      >
        <Typography 
          variant="h1" 
          sx={{ 
            fontWeight: 900, 
            mb: 3, 
            fontSize: { xs: '2.2rem', md: '3.5rem' },
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            lineHeight: 1.2
          }}
        >
          🍽️ Welcome to FitMeals
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 4, 
            opacity: 0.95, 
            maxWidth: '700px', 
            fontWeight: 500, 
            lineHeight: 1.8,
            fontSize: '1.15rem'
          }}
        >
          Achieve your health goals with personalized meal plans backed by nutrition science. Get custom recommendations tailored to your unique lifestyle and preferences.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: 'white',
            color: '#2E7D32',
            fontWeight: 800,
            px: 5,
            py: 2,
            fontSize: '1.1rem',
            borderRadius: 2.5,
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            textTransform: 'none',
            '&:hover': { 
              bgcolor: '#f0f0f0',
              boxShadow: '0 8px 24px rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-3px)'
            },
          }}
          onClick={() => navigate('/create-plan')}
          endIcon={<NextIcon sx={{ ml: 1, fontSize: '1.3rem' }} />}
        >
          Start Your Journey
        </Button>
      </Box>

      {/* Nutrition Insights Section */}
      {nutritionTargets && Object.keys(nutritionTargets).length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontSize: '1.6rem', color: '#1b5e20' }}>
            📊 Your Nutrition Targets
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#558B2F', fontWeight: 500, fontSize: '0.95rem' }}>
            {mealPlan?.type === 'weekly' 
              ? '✓ These are your personalized PER-DAY nutrition goals based on your weekly meal plan average. Track and adjust as needed.' 
              : 'These are your personalized daily nutrition goals based on your profile. Track and adjust as needed.'}
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3} sx={{ animation: 'bounceIn 0.6s ease-out 0s' }}>
              <NutritionCard
                label="Daily Calories"
                value={nutritionTargets.dailyCalories}
                unit="kcal"
                color="#2E7D32"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ animation: 'bounceIn 0.6s ease-out 0.1s backwards' }}>
              <NutritionCard
                label="Protein"
                value={nutritionTargets.protein}
                unit="g"
                color="#F57C00"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ animation: 'bounceIn 0.6s ease-out 0.2s backwards' }}>
              <NutritionCard
                label="Carbohydrates"
                value={nutritionTargets.carbs}
                unit="g"
                color="#1976D2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ animation: 'bounceIn 0.6s ease-out 0.3s backwards' }}>
              <NutritionCard
                label="Fat"
                value={nutritionTargets.fat}
                unit="g"
                color="#D32F2F"
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* How It Works Section */}
      <Box sx={{ mb: 10, mt: 4 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' }, color: '#1b5e20' }}>
            ⚡ How It Works
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: '650px', mx: 'auto', color: '#666', fontWeight: 500, fontSize: '1.05rem', lineHeight: 1.7 }}>
            Create your perfect meal plan in just three simple steps. Our science-backed system learns your preferences and builds a plan that works for you.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 0 }}>
          {howItWorks.map((step, idx) => (
            <Grid item xs={12} md={4} key={step.number} sx={{ animation: `slideInUp 0.6s ease-out ${idx * 0.15}s backwards` }}>
              <Box sx={{ position: 'relative', height: '100%' }}>
                {/* Connector line for desktop */}
                {idx < howItWorks.length - 1 && (
                  <Box sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'absolute',
                    top: '60px',
                    left: '50%',
                    width: '100%',
                    height: '3px',
                    background: 'linear-gradient(90deg, #2E7D32 0%, #F57C00 100%)',
                    zIndex: -1,
                    opacity: 0.3
                  }} />
                )}

                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '2px solid #E8F5E9',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: '0 16px 40px rgba(46, 125, 50, 0.25)',
                    transform: 'translateY(-12px)',
                    borderColor: '#2E7D32',
                  }
                }}>
                  {/* Top gradient bar */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: 'linear-gradient(90deg, #2E7D32 0%, #F57C00 100%)',
                  }} />

                  <CardContent sx={{ textAlign: 'center', p: 4, pt: 5 }}>
                    {/* Step Number Circle */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 900,
                        mx: 'auto',
                        mb: 3,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)',
                        '&:hover': { 
                          transform: 'scale(1.15)', 
                          boxShadow: '0 12px 30px rgba(46, 125, 50, 0.4)'
                        }
                      }}
                    >
                      {step.number}
                    </Box>

                    {/* Step Icon */}
                    <Typography sx={{ fontSize: '3rem', mb: 2 }}>
                      {step.icon}
                    </Typography>

                    {/* Step Title */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 800, 
                        mb: 2, 
                        color: '#1b5e20',
                        fontSize: '1.2rem'
                      }}
                    >
                      {step.title}
                    </Typography>

                    {/* Step Description */}
                    <Typography 
                      variant="body2" 
                      color="textSecondary" 
                      sx={{ 
                        lineHeight: 1.8,
                        fontSize: '0.95rem',
                        color: '#555',
                        fontWeight: 500
                      }}
                    >
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Sample Meals Section */}
      <Box sx={{ mb: 8, mt: 6 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' }, color: '#1b5e20' }}>
            🍲 Featured Meals
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: '650px', mx: 'auto', color: '#666', fontWeight: 500, fontSize: '1.05rem', lineHeight: 1.7 }}>
            Browse our collection of chef-inspired, nutrient-rich recipes. Each meal is carefully crafted to deliver maximum flavor with optimal nutrition.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {sampleMeals.map((meal, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx} sx={{ animation: `slideInUp 0.6s ease-out ${idx * 0.15 + 0.3}s backwards` }}>
              <MealCard meal={meal} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action Section */}
      <Card sx={{
        background: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%)',
        color: 'white',
        borderRadius: 3,
        p: { xs: 4, md: 6 },
        textAlign: 'center',
        boxShadow: '0 12px 40px rgba(46, 125, 50, 0.3)',
        mb: 4,
        animation: 'slideInUp 0.8s ease-out 0.6s backwards'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '1.6rem', md: '2rem' } }}>
          Ready to Transform Your Nutrition?
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            maxWidth: '500px', 
            mx: 'auto', 
            mb: 4, 
            opacity: 0.95,
            fontSize: '1.05rem',
            fontWeight: 500
          }}
        >
          Create a personalized meal plan customized to your unique goals and lifestyle today.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: 'white',
            color: '#2E7D32',
            fontWeight: 700,
            px: 5,
            py: 1.8,
            fontSize: '1.1rem',
            borderRadius: 2,
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            '&:hover': { 
              bgcolor: '#f0f0f0',
              boxShadow: '0 12px 28px rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-3px)'
            },
          }}
          onClick={() => navigate('/create-plan')}
          endIcon={<NextIcon sx={{ ml: 1 }} />}
        >
          Get Started Now
        </Button>
      </Card>
    </Container>
  )
}

export default Dashboard
