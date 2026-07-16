import { create } from 'zustand'

export const useMealStore = create((set) => ({
  // User data
  userData: {
    age: null,
    weight: null,
    height: null,
    goal: 'weight_loss',
    activityLevel: 'moderate',
    dietPreference: 'balanced',
    numMeals: 3,
    numSnacks: 0,
  },
  setUserData: (data) => set({ userData: data }),

  // Nutrition targets
  nutritionTargets: {
    dailyCalories: null,
    protein: null,
    carbs: null,
    fat: null,
  },
  setNutritionTargets: (targets) => set({ nutritionTargets: targets }),

  // Meal plan with metadata
  mealPlan: {
    type: 'daily', // 'daily' or 'weekly'
    meals: [],
    mealsPerDay: 3,
    snacksPerDay: 0,
  },
  setMealPlan: (plan) => set({ mealPlan: plan }),

  // Saved meal plans
  savedPlans: [],
  setSavedPlans: (plans) => set({ savedPlans: plans }),
  addSavedPlan: (plan) => set((state) => ({
    savedPlans: [...state.savedPlans, plan]
  })),
  removeSavedPlan: (planId) => set((state) => ({
    savedPlans: state.savedPlans.filter(p => p.id !== planId)
  })),

  // Saved individual meals
  savedMeals: [],
  setSavedMeals: (meals) => set({ savedMeals: meals }),
  addSavedMeal: (meal) => set((state) => ({
    savedMeals: [...state.savedMeals, { ...meal, savedId: Date.now() }]
  })),
  removeSavedMeal: (mealId) => set((state) => ({
    savedMeals: state.savedMeals.filter(m => m.savedId !== mealId)
  })),

  // Loading and error states
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),
}))
