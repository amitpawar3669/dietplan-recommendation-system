# Quick Test: Progress Page Calorie & Weekly Fixes

## 🧪 Fast Verification (2 minutes)

### Test Scenario
```
Current Weight: 80 kg
Target Weight: 70 kg  
Duration: 20 weeks
NO meal plan created
```

### What To Check ✓

#### 1. Calorie Analysis Section
After clicking "Calculate", scroll down to "📊 Calorie Analysis & Breakdown"

- [ ] **TDEE** shows ~2400 (varies by age/activity)
- [ ] **Daily Goal** shows ~1900-2000 kcal
- [ ] **Daily Deficit** shows negative number (-500 to -600)
- [ ] **Weekly Deficit** shows large number (3500-4000 kcal)
- [ ] **Section appears even without meal plan** ✓

**Expected Example:**
```
Your TDEE: 2400 kcal/day (maintenance)
Daily Goal: 1900 kcal/day (recommended)
Daily Deficit: -500 kcal/day deficit
Weekly Deficit: 3500 kcal
```

#### 2. Daily Macros Section
Below Calorie Analysis, find "💪 Daily Macros"

- [ ] **Protein** shows ~150-170g
- [ ] **Carbs** shows ~230-260g
- [ ] **Fat** shows ~50-55g
- [ ] **Progress bars** show accurate percentages
- [ ] **Percentages approximately:**
  - Protein: 27-30%
  - Carbs: 45-50%
  - Fat: 24-26%

**Expected Example:**
```
Protein: 155g / 155g  [████████░░] 28%
Carbs:   245g / 245g  [██████████] 47%
Fat:      54g / 54g   [████████░░] 25%
```

#### 3. Weekly Calorie Chart
Below macros, find "🔥 Weekly Calorie Intake"

- [ ] Chart shows all 7 days (Mon-Sun)
- [ ] **Each day has DIFFERENT consumed value** (not flat)
- [ ] Target line stays constant
- [ ] Values are within ±100-300 of target

**Expected Example (with 1900 target):**
```
Monday:    1850 kcal  (target: 1900)
Tuesday:   1950 kcal  (target: 1900)
Wednesday: 1880 kcal  (target: 1900)
Thursday:  1920 kcal  (target: 1900)
Friday:    1880 kcal  (target: 1900)
Saturday:  1950 kcal  (target: 1900)
Sunday:    1910 kcal  (target: 1900)
```

---

## 🟢 If All Checks Pass ✓

The fixes are working! You can now:
- ✅ See accurate daily calorie goals
- ✅ Trust the macro breakdown (protein/carbs/fat)
- ✅ Use weekly projections as realistic guides
- ✅ Track progress without a meal plan
- ✅ Adjust diet based on accurate numbers

---

## 🔴 If Something's Wrong

### Issue: Calorie Analysis Not Showing
- **Check:** Did you click "Calculate" button?
- **Check:** Did you enter valid weights?
- **Fix:** Scroll down - it should be below the goal summary card

### Issue: Macros Show 0 or Wrong Numbers
- **Check:** Values should be 150-300g range
- **Check:** Percentages should add to ~100%
- **Fix:** Try different weight/duration values and recalculate

### Issue: All Days Show Identical Calories
- **Problem:** Weekly variation not working
- **Fix:** Clear browser cache (Ctrl+Shift+Del), refresh page
- **Check:** Each day should differ slightly from others

### Issue: Macro Percentages Don't Add Up to 100%
- **Check:** They should be within 98-102% (rounding)
- **Check:** Recalculate with different weights
- **Fix:** Report if persists

---

## 📊 Example Calculations (For Reference)

### Given:
- Current Weight: 80kg
- Target: 70kg
- Duration: 20 weeks
- Age: 30, Height: 175cm, Activity: Moderate

### Expected Calculations:
```
Total Weight Loss Needed: 10 kg
TDEE (estimated): 2400 kcal/day
Weekly Deficit Needed: 3500 kcal (0.5kg/week)
Daily Deficit: 500 kcal/day
Daily Goal: 2400 - 500 = 1900 kcal

Macros for 1900 kcal:
- Protein 28%: (1900 × 0.28) ÷ 4 = 133g
- Carbs 47%: (1900 × 0.47) ÷ 4 = 223g
- Fat 25%: (1900 × 0.25) ÷ 9 = 53g

Weekly Variation Example:
- Each day: 1900 ± 190 kcal (±10%)
- Range: 1710-2090 kcal
```

---

## ✅ Browser Console Check (Optional)

Press `F12` → Console tab, enter:
```javascript
// Check if weeklyData has values
console.log('weeklyData:', JSON.stringify(window.__STATE__, null, 2))
```

You should see `calories` array with 7 different values.

---

Need more help? Check the main `PROGRESS_CALORIE_FIXES.md` file for detailed explanations.
