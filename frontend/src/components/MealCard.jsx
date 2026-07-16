import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import InfoIcon from '@mui/icons-material/Info'
import ReplaceIcon from '@mui/icons-material/SwapHoriz'
import SaveIcon from '@mui/icons-material/BookmarkAdd'
import LinearProgress from '@mui/material/LinearProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

function MealCard({ meal, onReplace, onDetails, onSave }) {
  const [saveNotification, setSaveNotification] = useState(false)

  const handleSaveMeal = () => {
    if (onSave) {
      onSave(meal)
      setSaveNotification(true)
      setTimeout(() => setSaveNotification(false), 2000)
    }
  }
  // Handle different data formats
  const mealName = meal.name || meal.meal || 'Meal'
  const mealType = meal.type || meal.mealType || 'Meal'
  const calories = meal.calories || meal.cal || 0
  const protein = meal.protein || meal.proteins || 0
  const carbs = meal.carbs || meal.carbohydrates || 0
  const fat = meal.fat || meal.fats || 0
  const healthiness = meal.healthiness || 0
  const cuisine = meal.cuisine || 'Various'

  // Meal type colors
  const mealTypeColors = {
    Breakfast: '#FF9800',
    Lunch: '#2196F3',
    Dinner: '#4CAF50',
    Snack: '#9C27B0',
    'Post-Workout': '#FF5722',
  }

  // Meal type icons
  const mealTypeIcons = {
    Breakfast: '🌅',
    Lunch: '☀️',
    Dinner: '🌙',
    Snack: '🍎',
    'Post-Workout': '💪',
  }

  const bgColor = mealTypeColors[mealType] || '#757575'
  const icon = mealTypeIcons[mealType] || '🍽️'

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        mb: 2,
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `3px solid ${bgColor}`,
        '&:hover': {
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          transform: 'translateY(-6px)',
          borderColor: bgColor,
        },
        cursor: 'pointer',
      }}
    >
      {/* Header Bar with Type Badge */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
          color: 'white',
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              opacity: 0.9,
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {icon} {mealType}
          </Typography>
        </Box>
        {cuisine && (
          <Chip
            label={cuisine}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.25)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.85rem',
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* Meal Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            color: '#1B5E20',
            fontSize: '1.25rem',
            lineHeight: 1.3,
          }}
        >
          {mealName}
        </Typography>

        {/* Healthiness Score Bar */}
        {healthiness > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>
                Health Score
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: healthiness >= 7 ? '#4CAF50' : healthiness >= 4 ? '#FF9800' : '#F44336',
                }}
              >
                {Math.min(healthiness, 10).toFixed(1)}/10
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((healthiness / 10) * 100, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor:
                    healthiness >= 7 ? '#4CAF50' : healthiness >= 4 ? '#FF9800' : '#F44336',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {/* Nutrition Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              backgroundColor: '#FFF3E0',
              borderRadius: 1.5,
              border: '1px solid #FFE0B2',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#E65100',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'block',
                mb: 0.5,
              }}
            >
              Calories
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#F57C00',
                fontSize: '1.3rem',
              }}
            >
              {Math.round(calories)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#E65100', fontSize: '0.75rem' }}>
              kcal
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              backgroundColor: '#E3F2FD',
              borderRadius: 1.5,
              border: '1px solid #BBDEFB',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#0D47A1',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'block',
                mb: 0.5,
              }}
            >
              Protein
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#1976D2',
                fontSize: '1.3rem',
              }}
            >
              {Math.round(protein)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0D47A1', fontSize: '0.75rem' }}>
              g
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              backgroundColor: '#F3E5F5',
              borderRadius: 1.5,
              border: '1px solid #E1BEE7',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#6A1B9A',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'block',
                mb: 0.5,
              }}
            >
              Carbs
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#7B1FA2',
                fontSize: '1.3rem',
              }}
            >
              {Math.round(carbs)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6A1B9A', fontSize: '0.75rem' }}>
              g
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              backgroundColor: '#FCE4EC',
              borderRadius: 1.5,
              border: '1px solid #F8BBD0',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#880E4F',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'block',
                mb: 0.5,
              }}
            >
              Fat
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#C2185B',
                fontSize: '1.3rem',
              }}
            >
              {Math.round(fat)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#880E4F', fontSize: '0.75rem' }}>
              g
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Action Buttons */}
      <Box sx={{ p: 2, pt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {onDetails && (
          <Button
            size="small"
            startIcon={<InfoIcon />}
            onClick={() => onDetails(meal)}
            variant="contained"
            sx={{
              backgroundColor: bgColor,
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.2s',
              flex: 1,
              minWidth: '100px',
              '&:hover': {
                backgroundColor: bgColor,
                opacity: 0.85,
              },
            }}
          >
            Details
          </Button>
        )}
        {onSave && (
          <Button
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSaveMeal}
            variant="contained"
            sx={{
              backgroundColor: '#FF9800',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.2s',
              flex: 1,
              minWidth: '100px',
              '&:hover': {
                backgroundColor: '#F57C00',
                opacity: 0.9,
              },
            }}
          >
            Save Meal
          </Button>
        )}
        {onReplace && (
          <Button
            size="small"
            startIcon={<ReplaceIcon />}
            onClick={() => onReplace(meal)}
            variant="outlined"
            sx={{
              borderColor: bgColor,
              color: bgColor,
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.2s',
              flex: 1,
              minWidth: '100px',
              '&:hover': {
                borderColor: bgColor,
                backgroundColor: `${bgColor}15`,
              },
            }}
          />
        )}
      </Box>

      {/* Save Success Notification */}
      <Snackbar
        open={saveNotification}
        autoHideDuration={2000}
        onClose={() => setSaveNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          ✅ Meal saved!
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default MealCard
