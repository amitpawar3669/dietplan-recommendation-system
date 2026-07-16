# Progress App - Testing Guide 🧪

## Quick Start Testing

### 1. Navigate to Progress Page
- Open: http://localhost:5175/progress
- You should see the clean, modern Progress Dashboard

### 2. Test Input Validation ✓

#### Test Current Weight Input:
```
Input Field: "Current Weight (kg)"
✓ Valid inputs: 50, 70.5, 120.3
✗ Invalid inputs: -5, 0, "text", empty
Expected: 
  - Valid shows "✓ Valid"
  - Invalid shows error state + "Enter your current weight"
  - Button disabled until valid
```

#### Test Target Weight Input:
```
Input Field: "Target Weight (kg)"  
✓ Valid inputs: 60, 65.5, 80
✗ Invalid inputs: -10, 0, "abc", empty
Expected:
  - Valid shows "✓ Valid"
  - Invalid shows error state
  - Suggestion appears when both weights valid
```

#### Test Duration Input:
```
Input Field: "Target Duration (weeks)"
✓ Valid: 4, 12, 52, 104 (or empty for auto)
✗ Invalid: -5, 105, 200, 0
Expected:
  - Shows valid/invalid status
  - Button disabled only if invalid (not empty)
  - Can be left empty for auto-calculation
```

### 3. Test Smart Suggestions 💡

#### Trigger Suggestion:
```
1. Enter Current Weight: 75
2. Enter Target Weight: 70
3. Watch for: "💡 Suggested Duration" box appears

Expected Behavior:
- Shows calculated optimal weeks
- "Apply" button is clickable
- Clicking Apply fills duration field
- Suggestion disappears when duration entered
```

#### Test Suggestion Calculation:
```
Current: 80kg
Target: 70kg (10kg loss)

Expected Duration Suggestion:
- Minimum: ~10 weeks (1kg/week)
- Recommended: ~20 weeks (0.5kg/week) 
- Maximum: ~30 weeks (0.33kg/week)

Actual: Should suggest safe minimum (around 20 weeks)
```

### 4. Test Calculate Button 🔘

#### Button Activation:
```
Disabled State (Red, can't click):
- Current weight empty
- Target weight empty
- Duration invalid (e.g., 105 weeks)
- Any field has error

Enabled State (Green, clickable):
- All fields valid
- Both weights > 0
- Weights are different
- Duration is 1-104 (or empty)
```

#### After Clicking Calculate:
```
Expected:
1. Button shows spinning loader
2. Results appear with animation
3. Goal Summary card displays
4. Projection data shown
5. No warning chip (unless REALLY needed)
```

### 5. Test Responsive Design 📱

#### Desktop (1920px+):
```
- Input card: Right side, 33% width
- Results: Center, 66% width  
- All inline buttons side-by-side
- Charts visible full width
```

#### Tablet (768px):
```
- Input card: Full width top
- Results: Below, full width
- Buttons in 2 columns
- Charts responsive height
```

#### Mobile (375px):
```
- Input card: Full width
- Results: Stacked below
- Single column everything
- Large touch-friendly buttons
- No horizontal scroll
- Text readable at 375px
```

#### Test Mobile:
```
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test iPhone SE (375px)
4. Test iPad (768px)
5. Verify no overflow, readable text
```

### 6. Test Animations ✨

#### Header Fade In:
```
Reload page
Expected: Header slides down smoothly (slideInDown)
Speed: ~0.6s
```

#### Results Appear:
```
1. Enter valid weights
2. Click Calculate
3. Wait ~0.8s
4. Expected: Cards appear with bounce animation
5. Staggered timing (each card slightly delayed)
```

#### Alert Animations:
```
1. If auto-adjustment occurs (rarely)
2. Alert should fade in smoothly
3. Can be dismissed by clicking X
4. Fade out animation on close
```

### 7. Test Data Calculations 🧮

#### Test Case 1: Simple Weight Loss
```
Current: 100kg
Target: 80kg
Duration: 20 weeks

Expected Results:
- Total Change: 20kg
- Weekly Requirement: 1.0 kg/week
- Status: ⚡ Moderate
- Daily Deficit: ~1100 kcal
- Recommended Calories: Depends on TDEE
```

#### Test Case 2: Auto-Adjustment (Safe Minimum)
```
Current: 100kg
Target: 70kg (30kg loss)
Duration: 8 weeks (TOO AGGRESSIVE)

Expected:
- System auto-extends to safe minimum
- Success message: "Adjusted to safe minimum..."
- Duration changes to ~30+ weeks
- No alarming ⚠️ warning shown
```

#### Test Case 3: Goal Already Reached
```
Current: 70kg
Target: 70kg

Expected:
- Error message: "🎉 You have already reached your goal!"
- Success severity (green alert)
- Calculate button still allows recalculation
```

#### Test Case 4: Invalid Inputs
```
Current: 0 or negative
Target: Empty or negative

Expected:
- Validation error shown
- Helper text indicates problem
- Button disabled
- No calculation happens
```

### 8. Test Interactive Elements 🎯

#### Test Suggested Duration Button:
```
1. Enter weights that create suggestion
2. See "Apply" button appear
3. Click Apply
4. Duration field should auto-fill
5. Suggestion box should disappear
6. Button should become enabled
```

#### Test Action Buttons:
```
After calculation, test:

1. 📈 Calculate - Re-run with new values ✓
2. 📋 Create Plan - Navigate to /create-plan ✓
3. 🍽️ View Meal Plan - Navigate to /meal-planner ✓
4. ⟳ Refresh Data - Page reload ✓

Expected: Navigation happens smoothly
```

#### Test Status Indicator:
```
Different pace results:

Weekly 0.3kg: 🟢 ✅ Healthy (green)
Weekly 0.7kg: 🟠 ⚡ Moderate (orange)
Weekly 1.2kg: 🔴 ⚠️ Aggressive (red)
Weekly 2.0kg: 🟣 🚨 Unrealistic (purple)

Visual: Color-coded card, pulsing dot, matching button
```

### 9. Test Real-Time Feedback ⚡

#### Test Validation Feedback:
```
1. Focus on Current Weight
2. Type "abc" - see error
3. Clear and type "75" - see ✓ Valid
4. Tab to Target Weight
5. Type "xyz" - see error
6. Clear and type "65" - see ✓ Valid + suggestion appears
```

#### Test Helper Text:
```
Each field should show:
- Placeholder text (hint)
- Helper text (guidance)
- Validation icon (✓ or ✗)
- Error message (if invalid)
```

### 10. Test Error Handling 🛡️

#### Empty Form Submit:
```
All fields empty, click Calculate
Expected: Error alert: "Please enter current and target weights"
```

#### Invalid Weight Combo:
```
Current: 150kg
Target: 75kg
Duration: 1 week (way too short)

Expected: 
- Error shown OR
- Auto-adjusted to safe duration
- Clear message about adjustment
- No aggressive warning
```

#### Network Error Simulation:
```
Close browser DevTools Network tab
Throttle to Offline
Click Calculate

Expected: Calculation still works locally
(No API calls for this calculation)
```

---

## Performance Testing ⚙️

### Load Time:
```
Expected: Page load < 2 seconds
Animation frame rate: 60 FPS smooth
```

### Calculation Speed:
```
Expected: Results appear in ~0.8s
No button freeze or lag
Loader animation smooth
```

### Memory Usage:
```
Expected: No memory leaks
Page usable for 10+ calculations
No slowdown after multiple uses
```

---

## Accessibility Testing ♿

### Keyboard Navigation:
```
1. Tab through all inputs
2. Tab to all buttons
3. Enter/Space activates buttons
4. Shift+Tab goes backwards
5. All focus states visible (blue box shadow)
```

### Screen Reader (Windows Narrator):
```
1. Windows key + Enter (enable Narrator)
2. Navigate with arrows
3. All inputs should be read
4. Buttons should be announced
5. Errors should be narrated
6. Disable: Windows key + Enter
```

### Color Contrast:
```
Use: https://webaim.org/resources/contrastchecker/

Check:
- Text on backgrounds: ✓ AAA compliant
- Button text: ✓ AAA compliant
- Icons on colors: ✓ Readable
```

---

## Success Criteria ✅

All tests pass when:

1. ✅ Input validation works in real-time
2. ✅ Suggestion appears and applies correctly
3. ✅ No aggressive warning messages
4. ✅ Responsive on all screen sizes
5. ✅ Animations are smooth (60 FPS)
6. ✅ All buttons work correctly
7. ✅ Calculations are accurate
8. ✅ Error messages are helpful
9. ✅ Keyboard navigation works
10. ✅ Page loads quickly

---

## Troubleshooting 🔧

### Issue: Suggestion Not Appearing
```
Solution:
1. Check both weight fields are valid
2. Check weights are different (not equal)
3. Refresh page and try again
4. Check browser console for errors
```

### Issue: Button Not Responding
```
Solution:
1. Verify all fields are green (✓ Valid)
2. Check Duration is 1-104 (if filled)
3. Try clearing and re-entering values
4. Check browser console for JavaScript errors
```

### Issue: Animation Stuttering
```
Solution:
1. Close other browser tabs
2. Disable browser extensions
3. Clear browser cache
4. Try different browser
5. Check GPU acceleration enabled
```

### Issue: Mobile Layout Broken
```
Solution:
1. Hard refresh (Ctrl+Shift+R on desktop)
2. Clear browser cache
3. Check viewport meta tag exists
4. Try different mobile device
5. Check browser DevTools responsive design
```

---

## Report Bugs 🐛

If you find issues:

1. **Document the problem**: What you did, what happened
2. **Include screenshots**: Visual proof of issue
3. **Provide steps to reproduce**: Exact steps to recreate
4. **Check browser console**: F12 → Console tab for errors
5. **Note device/browser**: OS, browser, screen size
6. **Report to**: Developer or issues tracker

---

**Last Updated**: April 20, 2026  
**Status**: Ready for Testing 🚀
