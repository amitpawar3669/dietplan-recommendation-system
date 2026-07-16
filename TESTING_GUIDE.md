# 🧪 Testing Guide - New Features

## ✅ 3 Major Features Implemented

---

## 1️⃣ **Authentication System**

### Test Flow:
```
1. Go to http://localhost:5176
   → Should show Login page (not dashboard)

2. Click "Sign Up" tab
   → Should show name field
   → Fill form and create account

3. Click "Login"
   → Should show login form
   → Use: demo@example.com / demo123

4. After login:
   → Dashboard should display
   → Sidebar shows your name/avatar
   → "Login/Sign Up" button is gone
   → Account link appears in sidebar

5. Click Account → Click Logout
   → Should go back to login page
```

### What to Verify:
- ✓ Redirects to login if not authenticated
- ✓ Can sign up with new account
- ✓ Can login with demo credentials
- ✓ Sidebar shows user profile when logged in
- ✓ Logout works and returns to login
- ✓ Session persists on page refresh
- ✓ Form validation shows errors

---

## 2️⃣ **Improved Calorie Calculator**

### Test Flow:
```
1. After login, click "Calorie Calculator" in sidebar

2. Fill the form:
   - Age: 25
   - Weight: 70 (kg)
   - Height: 175 (cm)
   - Gender: Male
   - Activity Level: Moderate

3. Click "Calculate"

4. Should see results:
   ✓ BMR card (calories at rest)
   ✓ Daily Calories card (with activity)
   ✓ Pie chart showing macro distribution
   ✓ Three colored cards with macro breakdown
   ✓ Each card shows grams + calories
   ✓ Percentage shown for each macro
```

### What to Verify:
- ✓ Form validation (try empty fields)
- ✓ BMR calculated correctly
- ✓ Daily calories reasonable for activity level
- ✓ Pie chart displays properly
- ✓ Macro cards show actual values (not just 100%)
- ✓ Responsive design (try mobile view)
- ✓ Colors match design system

### Example Results:
```
Age: 25, Weight: 70kg, Height: 175cm, Male, Moderate activity
Expected approximately:
- BMR: ~1,700 kcal
- Daily Calories: ~2,600 kcal
- Protein: ~195g (30%)
- Carbs: ~292g (45%)
- Fat: ~72g (25%)
```

---

## 3️⃣ **Professional Hero Image**

### Test Flow:
```
1. Go to Dashboard (main page)

2. Look at hero section
   ✓ Should show healthy food image (vegetables)
   ✓ Green + orange gradient overlay
   ✓ Text should be readable
   ✓ "Create Your Plan" button visible
   ✓ Responsive (works on mobile/tablet)
```

### What to Verify:
- ✓ Image loads properly
- ✓ Text is readable over image
- ✓ Image matches healthy food theme
- ✓ Layout is professional
- ✓ Mobile responsive (adjust browser width)
- ✓ Button stands out and is clickable
- ✓ Gradient overlay adjusts opacity properly

---

## 🔍 Testing Checklist

### Authentication:
- [ ] Login page shows on first load
- [ ] Sign up form works
- [ ] Demo login works (demo@example.com / demo123)
- [ ] User profile shows in sidebar
- [ ] Logout button removes session
- [ ] Page refresh keeps user logged in
- [ ] All form fields have validation

### Calorie Calculator:
- [ ] Form has all fields (age, weight, height, gender, activity)
- [ ] Calculate button works
- [ ] BMR displays correctly
- [ ] Daily calories > BMR
- [ ] Pie chart renders
- [ ] Macro cards show in 3 colors
- [ ] No "100% progress" issue
- [ ] Values make sense for inputs
- [ ] Mobile view responsive

### Hero Image:
- [ ] Image displays (not just gradient)
- [ ] Shows healthy food/vegetables
- [ ] Text readable
- [ ] Button works and navigates
- [ ] Responsive on mobile
- [ ] Professional appearance

---

## 🚀 Quick Test Scenarios

### Scenario 1: New User Flow
```
1. Visit http://localhost:5176
2. Click "Sign Up"
3. Fill: name, email, password
4. Click Sign Up button
5. Should see dashboard
```

### Scenario 2: Demo Login
```
1. Visit http://localhost:5176
2. Type: demo@example.com
3. Type: demo123
4. Click Login
5. See dashboard with sidebar
```

### Scenario 3: Calculator Check
```
1. Logged in? Go next step
2. Click "Calorie Calculator"
3. Enter: age 30, weight 80, height 180
4. Select: Female, Very Active
5. See pie chart (not 100%)
6. Check macro values are reasonable
```

### Scenario 4: Hero Image
```
1. Go to Dashboard ("/")
2. Look at top section
3. Should see healthy food image
4. Not just solid gradient
5. Text is visible
```

---

## 📊 Expected Results

### Login Page Response Times:
- Page load: < 1s
- Form submission: < 500ms
- Validation: Instant

### Calculator Response Times:
- Calculation: Instant
- Chart render: < 500ms
- Layout adjustment: Smooth

### Visual Elements:
- Hero image: Loads within 2s
- Sidebar update: Instant
- User profile: Shows immediately after login

---

## ⚠️ Known Demo Limitations

These are client-side only implementations. For production, add:
1. Backend API for authentication
2. Database for user storage
3. Password hashing
4. Token-based auth (JWT)
5. Email verification
6. Rate limiting

---

## 💡 Troubleshooting

### "Cannot find module" errors:
```powershell
cd frontend
npm install
npm run dev
```

### Blank page after login:
- Check browser console (F12)
- Verify localStorage has authUser
- Try hard refresh (Ctrl+Shift+R)

### Hero image not loading:
- Check internet connection
- Try different browser
- Check browser console for CORS errors

### Calculator shows old data:
- Clear browser cache
- Try incognito/private mode
- Refresh page (F5)

---

## ✨ Success Indicators

All features working correctly when:
✅ Login/signup works smoothly
✅ User profile shows after login
✅ Calorie calculator shows real results
✅ No 100% progress bar permanently
✅ Hero image displays properly
✅ Everything responsive on mobile
✅ No console errors

---

**Ready to test! Go to http://localhost:5176 and enjoy! 🎉**
