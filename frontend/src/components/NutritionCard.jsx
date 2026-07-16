import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function NutritionCard({ label, value, unit, icon: Icon, color = '#2E7D32' }) {
  return (
    <Card sx={{ textAlign: 'center', borderTop: `4px solid ${color}`, height: '100%' }}>
      <CardContent>
        {Icon && (
          <Box sx={{ fontSize: 32, mb: 1, color }}>
            {Icon}
          </Box>
        )}
        <Typography color="textSecondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color }}>
          {value || '--'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {unit}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default NutritionCard
