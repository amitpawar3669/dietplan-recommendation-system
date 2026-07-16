# 🍎 FitMeals - Diet Plan Recommendation System - Complete Detailed Explanation

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Recommendation Algorithm](#recommendation-algorithm)
4. [Key Formulas](#key-formulas)
5. [System Architecture](#system-architecture)
6. [Data Flow](#data-flow)
7. [How Recommendations Are Generated](#how-recommendations-are-generated)
8. [Feature Engineering](#feature-engineering)

---

## 🎯 System Overview

**FitMeals** is a **Hybrid Diet Plan Recommendation System** that combines three intelligent filtering approaches:

- **Content-Based Filtering**: Recommends meals similar to meals you've liked before
- **Collaborative Filtering**: Recommends meals that users with similar tastes enjoy
- **Contextual Filtering**: Personalizes based on your preferences (diet type, cuisine, meal type, health goals)

The system analyzes **1,750+ meals** with **29 engineered features** to provide personalized meal recommendations for users trying to achieve their weight loss or fitness goals.

---

## 🛠️ Technology Stack

### **Frontend (User Interface)**
```
React 18.2.0              - Web framework for UI
Material-UI 5.14.0        - Component library for beautiful design
Vite 5.4.21              - Fast development server and bundler
Recharts 2.10.0          - Library for interactive charts/graphs
Zustand 4.4.0            - Lightweight state management
React Router 6.x         - Page navigation
Axios/fetch API          - HTTP requests to backend
```

### **Backend (Server & API)**
```
Python 3.8+              - Programming language
Flask 2.3.0              - Web framework for REST API
NumPy                    - Mathematical operations
Pandas                   - Data manipulation and analysis
Scikit-learn             - Machine learning algorithms
SciPy                    - Scientific computing
```

### **Machine Learning & Data**
```
Dataset                  - 1,750 cleaned meals with nutritional data
Similarity Metrics       - Cosine similarity (content-based)
Correlation Analysis     - User preferences (collaborative filtering)
Feature Scaling          - StandardScaler from scikit-learn
```

---

## 🤖 Recommendation Algorithm

### **1. Content-Based Filtering**

**What it does**: Finds meals similar to meals you've rated highly

**How it works**:
```
Step 1: Create a feature vector for each meal
        [Calories, Protein, Fat, Carbs, Healthiness Score, etc.]

Step 2: Calculate similarity between all meals
        Using Cosine Similarity Formula:
        
        Similarity(Meal A, Meal B) = (A · B) / (||A|| × ||B||)
        
        Where:
        - A · B = dot product of feature vectors
        - ||A|| = magnitude of vector A
        - ||B|| = magnitude of vector B
        
        Result: Value between 0 (completely different) to 1 (identical)

Step 3: Find top N most similar meals to user's preferred meals
        Score = Average similarity to all highly-rated meals

Step 4: Rank and return meals
```

**Example**:
```
User likes: "Grilled Chicken Salad" (High protein, low calorie)
System finds similar meals:
  - "Turkey Salad with Avocado"   (Similarity: 0.92)
  - "Tuna Salad"                  (Similarity: 0.88)
  - "Quinoa Buddha Bowl"          (Similarity: 0.85)
```

---

### **2. Collaborative Filtering**

**What it does**: Recommends meals that users with similar preferences like

**How it works**:
```
Step 1: Build a User-Item Rating Matrix
        [50 simulated users × 1,750 meals]
        
        Example:
        User 1:  [5, 3, 4, 2, 5, ...]  (ratings for each meal)
        User 2:  [5, 3, 4, 2, 5, ...]  (similar preferences)
        User 3:  [2, 5, 1, 4, 2, ...]  (different preferences)

Step 2: Calculate User Similarity (or Meal Similarity)
        Find users/meals with correlated ratings
        Using Pearson Correlation:
        
        r = Σ[(xi - mean_x)(yi - mean_y)] / √[Σ(xi - mean_x)² × Σ(yi - mean_y)²]
        
        Where:
        - xi, yi = ratings by user i for meals x and y
        - mean_x, mean_y = average ratings

Step 3: Find Similar Users
        Find users with rating patterns similar to target user

Step 4: Recommend Meals
        Recommend meals highly-rated by similar users
        but NOT yet rated by target user
```

**Example**:
```
Your ratings:
  - Grilled Chicken: 5 stars ⭐⭐⭐⭐⭐
  - Fish & Chips: 2 stars ⭐⭐

Similar User ratings:
  - Grilled Chicken: 5 stars ⭐⭐⭐⭐⭐
  - Fish & Chips: 2 stars ⭐⭐
  - Baked Salmon: 5 stars ⭐⭐⭐⭐⭐  (You haven't rated)

System recommends: "Baked Salmon" because similar users like it!
```

---

### **3. Contextual Filtering**

**What it does**: Personalizes recommendations based on user preferences and constraints

**Factors Considered**:
```
1. Diet Type
   ├─ Vegetarian     (No meat, chicken, fish, seafood)
   ├─ Vegan          (No meat, dairy, eggs, animal products)
   ├─ Non-Vegetarian (Any meal allowed)
   └─ Keto, Paleo, Balanced (Custom macros)

2. Meal Type Distribution
   ├─ Breakfast      (Morning meal - 300-500 cal typical)
   ├─ Lunch          (Midday meal - 500-700 cal typical)
   ├─ Dinner         (Evening meal - 500-700 cal typical)
   └─ Snacks         (Light meals - 100-200 cal typical)

3. Cuisine Preference
   ├─ American, Italian, Asian, Mediterranean, etc.
   └─ Weighted higher in recommendations

4. Healthiness Score (0-100)
   ├─ Minimum threshold set by user
   ├─ Higher = more nutritious, less processed
   └─ Based on: Protein, Fiber, Sugar, Fat ratios

5. Cooking Time
   ├─ Quick (< 15 minutes)
   ├─ Medium (15-30 minutes)
   └─ Long (> 30 minutes)
```

**Filtering Logic**:
```
Hard Filter (MUST meet):
  ├─ Diet type constraints (strict)
  ├─ Meal type distribution
  └─ Minimum healthiness score

Soft Ranking (Influences score):
  ├─ Cuisine preference
  ├─ Cooking time preference
  └─ Nutritional targets
```

---

### **4. Hybrid Scoring System**

**Combines all three approaches** with weighted scores:

```
FINAL SCORE = (Content × W_content) + 
              (Collaborative × W_collab) + 
              (Context × W_context) + 
              (Popularity × 0.2)

Where:
- W_content = 0.5 (Content-based weight)
- W_collab = 0.5 (Collaborative weight)
- W_context = 0.0-1.0 (Contextual weight, flexible)
- Popularity = How many users rated this meal
```

**Example Calculation**:
```
Meal: "Grilled Chicken Salad"

Content Score: 0.92    (Similar to meals you rated 5 stars)
× Content Weight: 0.5
= Content Contribution: 0.46

Collaborative Score: 0.78 (Users like you gave it 4.5 stars)
× Collaborative Weight: 0.5
= Collaborative Contribution: 0.39

Context Score: 0.95    (Matches your preferences: low-cal, high-protein)
× Context Weight: 0.2
= Context Contribution: 0.19

Popularity: 0.88       (Rated by many users)
× Fixed Weight: 0.2
= Popularity Contribution: 0.176

FINAL SCORE = 0.46 + 0.39 + 0.19 + 0.176 = 1.216
(normalized to 0-1 scale) = 0.92 ⭐⭐⭐⭐⭐
```

---

## 📐 Key Formulas

### **1. Calorie & Nutrition Formulas**

#### **A. Basal Metabolic Rate (BMR) - Harris-Benedict Equation**

Used to calculate calories burned at rest:

**For Males:**
```
BMR = 88.362 + (13.397 × Weight_kg) + (4.799 × Height_cm) - (5.677 × Age_years)
```

**For Females:**
```
BMR = 447.593 + (9.247 × Weight_kg) + (3.098 × Height_cm) - (4.330 × Age_years)
```

**Example (80kg male, 175cm, 30 years):**
```
BMR = 88.362 + (13.397 × 80) + (4.799 × 175) - (5.677 × 30)
BMR = 88.362 + 1,071.76 + 839.825 - 170.31
BMR = 1,829.6 calories/day at rest
```

---

#### **B. Total Daily Energy Expenditure (TDEE)**

Calories burned including activity:

```
TDEE = BMR × Activity Factor

Activity Factors:
├─ Sedentary (little/no exercise):      1.2
├─ Lightly active (1-3 days/week):      1.375
├─ Moderately active (3-5 days/week):   1.55
├─ Very active (6-7 days/week):         1.725
└─ Extremely active (athlete level):    1.9
```

**Example (80kg male, BMR = 1,830):**
```
Moderately active (goes to gym 4x/week):
TDEE = 1,830 × 1.55 = 2,836 calories/day
```

---

#### **C. Weight Loss/Gain Calculation**

```
Total Calories to Burn/Gain = Weight_Change_kg × 7,700 calories/kg

Example: Lose 10kg
Total Calories = 10 × 7,700 = 77,000 calories

Daily Deficit = Total Calories ÷ Number of Days
              = 77,000 ÷ 70 days
              = 1,100 calories/day deficit
```

---

#### **D. Daily Calorie Goal**

```
Daily Goal = TDEE - Daily_Deficit

Example:
TDEE = 2,836 calories (from above)
Deficit = 500 calories/day (healthy weight loss)
Daily Goal = 2,836 - 500 = 2,336 calories/day

To lose 10kg in 20 weeks:
Weekly Target = 10kg ÷ 20 weeks = 0.5kg/week
Required Deficit = 0.5kg × 7,700 = 3,850 calories/week = 550/day
Adjusted Daily Goal = 2,836 - 550 = 2,286 calories/day
```

---

#### **E. Macronutrient Distribution**

Default balanced approach:

```
Protein:     28% of daily calories ÷ 4 cal/gram = grams of protein
Carbs:       47% of daily calories ÷ 4 cal/gram = grams of carbs
Fat:         25% of daily calories ÷ 9 cal/gram = grams of fat

Example (2,300 calorie goal):
Protein = (2,300 × 0.28) ÷ 4 = 644 ÷ 4 = 161g protein
Carbs = (2,300 × 0.47) ÷ 4 = 1,081 ÷ 4 = 270g carbs
Fat = (2,300 × 0.25) ÷ 9 = 575 ÷ 9 = 64g fat

Verification: (161×4) + (270×4) + (64×9) = 644 + 1,080 + 576 = 2,300 ✓
```

---

### **2. Recommendation Scoring Formulas**

#### **A. Cosine Similarity (Content-Based)**

```
Cosine Similarity = (A · B) / (||A|| × ||B||)

Where:
- A · B = Σ(ai × bi) for all features i
- ||A|| = √(Σ(ai²))
- ||B|| = √(Σ(bi²))

Returns: 0 to 1
- 0 = completely different
- 1 = identical
- 0.5 = moderately similar
```

**Example with simplified features:**
```
Meal A: [100 cal, 20g protein, 10g fat, 5g fiber]
Meal B: [110 cal, 21g protein, 11g fat, 5g fiber]

A · B = (100×110) + (20×21) + (10×11) + (5×5)
      = 11,000 + 420 + 110 + 25 = 11,555

||A|| = √(100² + 20² + 10² + 5²) = √(10,000 + 400 + 100 + 25) = √10,525 ≈ 102.6
||B|| = √(110² + 21² + 11² + 5²) = √(12,100 + 441 + 121 + 25) = √12,687 ≈ 112.6

Similarity = 11,555 / (102.6 × 112.6) = 11,555 / 11,563 ≈ 0.999

These meals are 99.9% similar! ✓
```

---

#### **B. Pearson Correlation (Collaborative)**

```
r = Σ[(xi - mean_x)(yi - mean_y)] / √[Σ(xi - mean_x)² × Σ(yi - mean_y)²]

Where:
- xi, yi = ratings by users i
- mean_x, mean_y = average ratings

Returns: -1 to 1
- 1 = perfect positive correlation (similar tastes)
- 0 = no correlation
- -1 = perfect negative correlation (opposite tastes)
```

**Example:**
```
User A ratings: [5, 3, 4, 2, 5] (mean = 3.8)
User B ratings: [5, 3, 4, 2, 5] (mean = 3.8)

Numerator: (5-3.8)(5-3.8) + (3-3.8)(3-3.8) + (4-3.8)(4-3.8) + (2-3.8)(2-3.8) + (5-3.8)(5-3.8)
         = (1.2)(1.2) + (-0.8)(-0.8) + (0.2)(0.2) + (-1.8)(-1.8) + (1.2)(1.2)
         = 1.44 + 0.64 + 0.04 + 3.24 + 1.44 = 6.8

Denominator: √[(1.2² + 0.8² + 0.2² + 1.8² + 1.2²) × same]
           = √[6.8 × 6.8] = 6.8

r = 6.8 / 6.8 = 1.0

Perfect correlation! These users have identical tastes. ✓
```

---

#### **C. Healthiness Score**

```
Healthiness = (Protein_ratio × 0.3) + 
              (Fiber_ratio × 0.3) + 
              (1 - Sugar_ratio × 0.2) + 
              (1 - Sodium_ratio × 0.2)

Scale: 0-100
- 0-30: Unhealthy (high sugar, low protein)
- 30-60: Moderate (balanced)
- 60-100: Healthy (high protein/fiber, low sugar)
```

**Example (Grilled Chicken Salad):**
```
Total Calories: 350
Protein: 45g = 180 calories (51% = 0.51 ratio) → Score: 0.51 × 0.3 = 0.153
Fiber: 8g = 32 calories equivalent (9% = 0.09 ratio) → Score: 0.09 × 0.3 = 0.027
Sugar: 6g = 24 calories (7% = 0.07 ratio) → Score: (1 - 0.07) × 0.2 = 0.186
Sodium: 400mg (low) = (1 - 0.05) × 0.2 = 0.19

Healthiness = 0.153 + 0.027 + 0.186 + 0.19 = 0.556 × 100 = 55.6/100

Rating: Moderately Healthy ✓ (good protein, reasonable sugar)
```

---

## 🏗️ System Architecture

### **3-Tier Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                    (React Frontend)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components:                                         │  │
│  │  - Login.jsx (Auth)                                  │  │
│  │  - Dashboard.jsx (Overview)                          │  │
│  │  - CreatePlan.jsx (Meal plans)                       │  │
│  │  - Progress.jsx (Track goals)                        │  │
│  │  - CalorieCalculator.jsx (BMR/TDEE)                 │  │
│  │  - MealPlanner.jsx (View recommendations)            │  │
│  │  - SavedMeals.jsx (Favorites)                        │  │
│  │  - Account.jsx (Profile management)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│                    (Flask Backend)                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoints:                                      │  │
│  │  POST /api/recommendations   (Hybrid scoring)       │  │
│  │  POST /api/content-based     (Similarity search)    │  │
│  │  GET  /api/meals/search      (Meal lookup)          │  │
│  │  POST /api/user-profile      (Save preferences)     │  │
│  │  GET  /api/health            (Status check)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│                    (models.py, utils.py)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Machine Learning Models:                           │  │
│  │  - Content Similarity Matrix (1,750 × 1,750)        │  │
│  │  - User-Item Rating Matrix (50 × 1,750)             │  │
│  │  - Meal Correlation Matrix                          │  │
│  │  - Feature Vectorization                            │  │
│  │  - Hybrid Scoring Engine                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│                  (Meals Dataset)                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1,750 Meals with 29 Features:                       │  │
│  │  ├─ Nutritional Data (Calories, Protein, Fat, etc.) │  │
│  │  ├─ Meal Type (Breakfast, Lunch, Dinner, Snack)    │  │
│  │  ├─ Diet Type (Vegan, Vegetarian, etc.)             │  │
│  │  ├─ Cuisine (American, Italian, Asian, etc.)        │  │
│  │  ├─ Cooking Time, Health Score                      │  │
│  │  └─ Simulated User Ratings (50 users)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **When User Requests Meal Recommendations:**

```
1. USER INPUT (Frontend)
   ├─ Clicks "Create Plan" or "Get Recommendations"
   ├─ Fills preferences:
   │  ├─ Current Weight: 80kg
   │  ├─ Target Weight: 70kg
   │  ├─ Duration: 20 weeks
   │  ├─ Diet Type: Vegetarian
   │  ├─ Meals per day: 3
   │  └─ Preferred Cuisine: Italian
   └─ Clicks "Generate Meal Plan"

2. API REQUEST (Frontend → Backend)
   ├─ POST /api/recommendations
   └─ JSON Payload:
      {
        "user_id": 1,
        "context_preferences": {
          "diet_type": "Vegetarian",
          "cuisine": "Italian",
          "meals_per_day": 3,
          "min_healthiness": 50
        },
        "content_weight": 0.5,
        "collab_weight": 0.5,
        "context_weight": 0.2,
        "top_n": 15
      }

3. BACKEND PROCESSING (Flask)
   ├─ Step 1: Validate Input
   │  └─ Check user_id, preferences validity
   │
   ├─ Step 2: Hard Filter (Diet Constraints)
   │  └─ Filter to only vegetarian meals (~700 meals)
   │
   ├─ Step 3: Calculate Content-Based Score
   │  ├─ Load content similarity matrix
   │  ├─ Find meals similar to user's past favorites
   │  └─ Score: 0-1 scale
   │
   ├─ Step 4: Calculate Collaborative Score
   │  ├─ Find similar users (collaborative filtering)
   │  ├─ Get meals rated high by similar users
   │  └─ Score: 0-1 scale
   │
   ├─ Step 5: Calculate Context Score
   │  ├─ Bonus for Italian cuisine preference
   │  ├─ Bonus for high healthiness score
   │  ├─ Bonus for matching meal types
   │  └─ Score: 0-1 scale
   │
   ├─ Step 6: Hybrid Scoring
   │  ├─ Final = (Content×0.5) + (Collaborative×0.5) + (Context×0.2)
   │  ├─ Add popularity bonus (×0.2)
   │  └─ Sort by final score (descending)
   │
   ├─ Step 7: Distribute Meals
   │  ├─ Breakfast: Top 5 meals (5-7am suitable)
   │  ├─ Lunch: Next 5 meals (12-1pm suitable)
   │  ├─ Dinner: Next 5 meals (6-8pm suitable)
   │  └─ Remove duplicates
   │
   └─ Step 8: Format Response
      └─ JSON with recommendations, scores, nutrition

4. API RESPONSE (Backend → Frontend)
   └─ JSON:
      {
        "success": true,
        "recommendations": [
          {
            "meal_id": 1234,
            "meal_name": "Vegetable Risotto",
            "meal_type": "Lunch",
            "cuisine": "Italian",
            "calories": 420,
            "protein": 12,
            "carbs": 68,
            "fat": 8,
            "score": 0.91,
            "healthiness": 72
          },
          ... (14 more meals)
        ],
        "calorie_goal": 2100,
        "protein_goal": 160,
        "duration": "20 weeks",
        "expected_loss": "10kg"
      }

5. UI RENDERING (Frontend)
   ├─ Display meals grouped by type (Breakfast/Lunch/Dinner)
   ├─ Show nutritional info per meal
   ├─ Display daily totals (calories, macros)
   ├─ Allow user to save/swap meals
   └─ Option to generate new plan or adjust preferences
```

---

## 🎯 How Recommendations Are Generated (Step-by-Step)

### **Example: Vegetarian User, Italian Cuisine, Weight Loss Goal**

```
USER PROFILE:
├─ Current: 80kg
├─ Target: 70kg
├─ Duration: 20 weeks
├─ Diet: Vegetarian ✓
├─ Meals/day: 3 (Breakfast, Lunch, Dinner)
└─ Cuisine: Italian preference

========================================
STEP 1: CALCULATE CALORIE TARGETS
========================================

BMR = 88.362 + (13.397×80) + (4.799×175) - (5.677×30)
    = 1,829.6 calories/day (at rest)

TDEE = 1,829.6 × 1.55 (moderately active)
     = 2,836 calories/day (total daily)

Weight Loss Goal:
- Total to lose: 80 - 70 = 10kg
- Total calories: 10 × 7,700 = 77,000 calories
- Over 20 weeks: 77,000 ÷ 140 days = 550 cal/day deficit
- Daily goal: 2,836 - 550 = 2,286 calories

Macros:
- Protein: (2,286 × 0.28) ÷ 4 = 160g
- Carbs: (2,286 × 0.47) ÷ 4 = 268g
- Fat: (2,286 × 0.25) ÷ 9 = 64g

========================================
STEP 2: HARD FILTER (DIET CONSTRAINTS)
========================================

Dataset: 1,750 meals

Filter 1 - Vegetarian meals only:
├─ Check 'diet_type' column
├─ Keep: "Vegetarian", "Vegan", "Vegetable Dishes"
├─ Remove: "Non-vegetarian", "Meat", "Chicken", "Fish"
└─ Remaining: ~700 vegetarian meals (40% of dataset)

Filter 2 - Healthiness minimum:
├─ Calculate health score: (Protein%×0.3) + (Fiber%×0.3) + ...
├─ Keep: meals with score ≥ 50
└─ Remaining: ~500 meals

Filtered set: 500 healthy vegetarian meals

========================================
STEP 3: CONTENT-BASED FILTERING
========================================

User's Past High-Rated Meals (assumed):
├─ "Grilled Vegetable Salad" (5 stars) ⭐⭐⭐⭐⭐
├─ "Chickpea Curry" (5 stars) ⭐⭐⭐⭐⭐
├─ "Mushroom Risotto" (4 stars) ⭐⭐⭐⭐
└─ "Lentil Soup" (4 stars) ⭐⭐⭐⭐

For each meal in filtered set, calculate similarity:

Similarity("Vegetable Risotto" vs "Grilled Vegetable Salad"):
├─ Features: [Calories, Protein, Fiber, Sugar, CookTime, Healthiness...]
├─ "Vegetable Risotto": [420, 12, 5, 3, 25min, 75 health]
├─ "Grilled Salad":     [250, 15, 8, 2, 5min, 85 health]
├─ Cosine Similarity = 0.89 (quite similar - both vegetable-based)
└─ Content Score: 0.89

Similarity("Vegetable Risotto" vs "Chickpea Curry"):
├─ "Chickpea Curry": [380, 14, 6, 4, 20min, 80 health]
├─ Cosine Similarity = 0.92 (very similar - high protein, reasonable calories)
└─ Content Score: 0.92

Average Content Score for "Vegetable Risotto":
= (0.89 + 0.92 + 0.87 + 0.88) ÷ 4 = 0.89 ✓

[Calculate for all 500 filtered meals...]

========================================
STEP 4: COLLABORATIVE FILTERING
========================================

Similar Users (correlation > 0.7):
├─ User A: Likes vegetarian, prefers light meals
├─ User B: Likes Italian cuisine, similar health goals
└─ User C: Similar weight loss trajectory

Meals highly-rated by similar users that you haven't rated:
├─ "Pasta Primavera" - User A gave 5 stars
├─ "Eggplant Parmesan" - User B gave 4.5 stars
├─ "Minestrone Soup" - User C gave 4.5 stars
└─ "Vegetable Lasagna" - All similar users rated 4+ stars

Collaborative Score = Average rating from similar users
"Vegetable Risotto" (similar users avg rating): 4.3 ÷ 5 = 0.86 ✓

[Calculate for all meals...]

========================================
STEP 5: CONTEXT-BASED FILTERING
========================================

Context Preferences:
├─ Diet: Vegetarian → Hard filter already applied (bonus: +0 from here)
├─ Cuisine: Italian → Bonus +0.15 if meal is Italian
├─ Meal Type: Distribution for Breakfast/Lunch/Dinner
├─ Healthiness: Min 50 → Already filtered, bonus for score > 70: +0.10
└─ Cooking Time: Any (no preference)

"Vegetable Risotto" (Italian cuisine, healthiness 75):
├─ Italian cuisine? YES → +0.15
├─ High healthiness (75 > 70)? YES → +0.10
├─ Suitable for lunch? YES → +0.05
└─ Context Score = 0.30

"Pasta Primavera" (Italian cuisine, healthiness 65):
├─ Italian cuisine? YES → +0.15
├─ High healthiness? NO (65 < 70) → +0.05
├─ Suitable for lunch? YES → +0.05
└─ Context Score = 0.25

[Calculate for all meals...]

========================================
STEP 6: HYBRID SCORING (FINAL RANKING)
========================================

Weights Configuration:
├─ Content Weight: 0.5
├─ Collaborative Weight: 0.5
├─ Context Weight: 0.2
└─ Popularity Weight: 0.2 (fixed)

Meal 1: "Vegetable Risotto"
├─ Content Score: 0.89 × 0.5 = 0.445
├─ Collaborative Score: 0.86 × 0.5 = 0.43
├─ Context Score: 0.30 × 0.2 = 0.06
├─ Popularity (many ratings): 0.88 × 0.2 = 0.176
└─ FINAL SCORE = 0.445 + 0.43 + 0.06 + 0.176 = 1.111 → normalized: 0.89 ⭐⭐⭐⭐⭐

Meal 2: "Pasta Primavera"
├─ Content Score: 0.85 × 0.5 = 0.425
├─ Collaborative Score: 0.88 × 0.5 = 0.44
├─ Context Score: 0.25 × 0.2 = 0.05
├─ Popularity (moderate): 0.75 × 0.2 = 0.15
└─ FINAL SCORE = 0.425 + 0.44 + 0.05 + 0.15 = 1.065 → normalized: 0.86 ⭐⭐⭐⭐

Meal 3: "Chickpea Curry" (not Italian)
├─ Content Score: 0.92 × 0.5 = 0.46
├─ Collaborative Score: 0.81 × 0.5 = 0.405
├─ Context Score: 0.10 × 0.2 = 0.02 (no Italian bonus)
├─ Popularity: 0.80 × 0.2 = 0.16
└─ FINAL SCORE = 0.46 + 0.405 + 0.02 + 0.16 = 1.045 → normalized: 0.84 ⭐⭐⭐⭐

RANKING (Top 3):
1. "Vegetable Risotto" (0.89)
2. "Pasta Primavera" (0.86)
3. "Chickpea Curry" (0.84)
...and so on

========================================
STEP 7: MEAL DISTRIBUTION
========================================

Goal: 3 meals per day (Breakfast, Lunch, Dinner)

Step 1 - Get top 15 highest-scoring meals
Step 2 - Filter into meal type categories:

Breakfast (Morning suitable, <500 cal):
├─ "Vegetable Pancakes" (Score 0.82, 380 cal)
├─ "Oatmeal with Berries" (Score 0.79, 320 cal)
├─ "Veggie Egg Scramble" (Score 0.76, 350 cal)
└─ [Pick 1 for breakfast]

Lunch (Midday suitable, 500-700 cal):
├─ "Vegetable Risotto" (Score 0.89, 420 cal) ✓ BEST
├─ "Pasta Primavera" (Score 0.86, 550 cal) ✓ GOOD
├─ "Lentil Buddha Bowl" (Score 0.81, 480 cal) ✓ GOOD
└─ [Pick 1 for lunch]

Dinner (Evening suitable, 500-700 cal):
├─ "Vegetable Lasagna" (Score 0.84, 620 cal) ✓
├─ "Mushroom Risotto" (Score 0.83, 480 cal) ✓
└─ [Pick 1 for dinner]

========================================
STEP 8: CALCULATE DAILY NUTRITION
========================================

Selected Meals:
├─ Breakfast: Oatmeal with Berries (320 cal, 8g protein)
├─ Lunch: Vegetable Risotto (420 cal, 12g protein)
└─ Dinner: Vegetable Lasagna (620 cal, 18g protein)

Daily Totals:
├─ Total Calories: 320 + 420 + 620 = 1,360 cal
├─ Total Protein: 8 + 12 + 18 = 38g
├─ Total Carbs: 48 + 68 + 52 = 168g
├─ Total Fat: 6 + 8 + 15 = 29g

vs. Goals:
├─ Calories: 1,360 / 2,286 = 59% (need more)
├─ Protein: 38g / 160g = 24% (significantly under)
├─ Carbs: 168g / 268g = 63% (reasonable)
└─ Fat: 29g / 64g = 45% (reasonable)

[System recommends adding 800+ calories and more protein sources]

========================================
FINAL RECOMMENDATION SENT TO USER
========================================

{
  "success": true,
  "meal_plan": {
    "breakfast": {
      "meal_name": "Oatmeal with Berries",
      "calories": 320,
      "protein": 8g,
      "carbs": 48g,
      "fat": 6g,
      "score": 0.79,
      "cooking_time": "5 min"
    },
    "lunch": {
      "meal_name": "Vegetable Risotto",
      "calories": 420,
      "protein": 12g,
      "carbs": 68g,
      "fat": 8g,
      "score": 0.89,
      "cooking_time": "25 min"
    },
    "dinner": {
      "meal_name": "Vegetable Lasagna",
      "calories": 620,
      "protein": 18g,
      "carbs": 52g,
      "fat": 15g,
      "score": 0.84,
      "cooking_time": "40 min"
    }
  },
  "daily_totals": {
    "calories": 1360,
    "protein": 38g,
    "carbs": 168g,
    "fat": 29g
  },
  "goals": {
    "calories": 2286,
    "protein": 160g,
    "carbs": 268g,
    "fat": 64g
  },
  "duration": "20 weeks",
  "expected_weight_loss": "10kg",
  "recommendation": "Add protein-rich snacks between meals"
}
```

---

## 🧠 Feature Engineering

### **Dataset Features (29 Total)**

#### **Original Features (20)**
```
1. meal_id              - Unique meal identifier
2. meal_name            - Name of the meal
3. calories             - Total energy (kcal)
4. protein_g            - Protein content (grams)
5. carbs_g              - Carbohydrate content (grams)
6. fat_g                - Fat content (grams)
7. fiber_g              - Dietary fiber (grams)
8. sugar_g              - Sugar content (grams)
9. sodium_mg            - Sodium content (milligrams)
10. cooking_time_min    - Preparation time (minutes)
11. servings            - Number of servings
12. meal_type           - Breakfast/Lunch/Dinner/Snack
13. cuisine             - Cuisine type (American/Italian/Asian/etc.)
14. diet_type           - Vegetarian/Vegan/Non-vegetarian/Keto/Paleo
15. cooking_method      - Grilled/Baked/Fried/Boiled/Raw
16. difficulty          - Easy/Medium/Hard
17. cost_usd            - Estimated cost in USD
18. rating              - User rating (1-5 stars)
19. popularity          - Number of user ratings
20. health_status       - Healthy/Moderate/Unhealthy
```

#### **Engineered Features (9)**
```
21. Protein_Ratio
    = protein_g / (protein_g + carbs_g + fat_g)
    Use: Content similarity, macro distribution
    Example: 20g / (20 + 50 + 10) = 0.25 (25% protein by weight)

22. Carb_Ratio
    = carbs_g / (protein_g + carbs_g + fat_g)
    Use: Content similarity, macro distribution
    Example: 50g / (20 + 50 + 10) = 0.625 (62.5% carbs by weight)

23. Fat_Ratio
    = fat_g / (protein_g + carbs_g + fat_g)
    Use: Content similarity, macro distribution
    Example: 10g / (20 + 50 + 10) = 0.125 (12.5% fat by weight)

24. Sodium_per_Serving
    = sodium_mg / servings
    Use: Healthiness scoring, health-conscious filtering
    Example: 800mg / 1 serving = 800mg per serving

25. Sugar_per_100cal
    = (sugar_g / calories) × 100
    Use: Healthiness scoring, detect high-sugar meals
    Example: (8g / 400 cal) × 100 = 2% sugar ratio
    (Low = healthier)

26. Calorie_Density
    = calories / weight_g (estimated weight)
    Use: Portion size recommendations, satiety assessment
    Example: 350 cal / 250g = 1.4 cal/gram

27. Healthiness_Score (0-100)
    = (Protein_Ratio × 30) + 
      (Fiber_g/Carbs_g × 30) + 
      (1 - Sugar_Ratio × 20) + 
      (1 - Sodium_Ratio × 20)
    Use: Hard filtering, context bonus scoring
    Range: 0 (unhealthy) to 100 (very healthy)
    Example calculation:
      - Protein contribution: 0.25 × 30 = 7.5
      - Fiber/Carb: 0.15 × 30 = 4.5
      - Sugar: (1 - 0.02) × 20 = 19.6
      - Sodium: (1 - 0.4) × 20 = 12
      - Total: 7.5 + 4.5 + 19.6 + 12 = 43.6/100 (Moderate)

28. Cooking_Time_Category
    = {
        "Quick": cooking_time < 15 min,
        "Medium": 15 ≤ cooking_time < 30 min,
        "Long": cooking_time ≥ 30 min
      }
    Use: User preference matching, meal type distribution
    Example: 25 min → "Medium" cooking time

29. Meal_Score_Composite
    = (Rating × 0.4) + 
      (Healthiness × 0.3) + 
      ((5 - Difficulty) × 0.2) + 
      (Popularity_normalized × 0.1)
    Use: Overall meal quality ranking
    Scale: 0-5 stars
    Example:
      - Rating: 4.2 × 0.4 = 1.68
      - Health: (72/100) × 0.3 = 0.216
      - Difficulty: (5-2) × 0.2 = 0.6
      - Popularity: 0.8 × 0.1 = 0.08
      - Total: 1.68 + 0.216 + 0.6 + 0.08 = 2.576 → 4.1/5 stars
```

---

## 📊 Data Statistics

### **Dataset Composition (1,750 Meals)**

```
Meal Type Distribution:
├─ Breakfast:  420 meals (24%)
├─ Lunch:      525 meals (30%)
├─ Dinner:     630 meals (36%)
└─ Snacks:     175 meals (10%)

Diet Type Distribution:
├─ Non-vegetarian: 700 meals (40%)
├─ Vegetarian:     700 meals (40%)
├─ Vegan:          280 meals (16%)
└─ Other:          70 meals (4%)

Cuisine Distribution:
├─ American:       350 meals
├─ Italian:        300 meals
├─ Asian:          350 meals
├─ Mediterranean:  300 meals
└─ Other:          350 meals

Healthiness Distribution:
├─ Unhealthy (0-33):   350 meals (20%)
├─ Moderate (33-66):   700 meals (40%)
└─ Healthy (66-100):   700 meals (40%)
```

---

## ✅ Summary

**FitMeals** is a comprehensive, multi-layered recommendation system that:

1. **Understands Nutrition** - Uses scientific formulas (Harris-Benedict for BMR, calorie math for weight loss)
2. **Learns Preferences** - Content-based and collaborative filtering for personalized recommendations
3. **Respects Constraints** - Hard filters for diet type, meal distribution
4. **Ranks Intelligently** - Hybrid scoring combining three approaches with customizable weights
5. **Adapts to Goals** - Calculates specific calorie and macro targets for weight loss/gain
6. **Scales Efficiently** - Handles 1,750+ meals with 29 engineered features

The system successfully combines data science, nutrition knowledge, and user preference learning to create truly personalized meal recommendations!

---

**Created: 2026-04-20**  
**System Status: ✅ Production Ready**
