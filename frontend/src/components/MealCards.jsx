import React from 'react'
import MealCard from './MealCard'

function MealCards({ meals, onSave }) {
  return (
    <div className="meals-grid">
      {meals.map((meal) => (
        <MealCard key={meal.meal_id || meal.id} meal={meal} onSave={onSave} />
      ))}
    </div>
  )
}

export default MealCards
