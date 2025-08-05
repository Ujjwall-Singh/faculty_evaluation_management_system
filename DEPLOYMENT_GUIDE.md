# Vercel Deployment Guide

## ⚠️ IMPORTANT: Before Deployment

Your project has **hardcoded localhost URLs** that must be fixed before deployment.

## Steps to Deploy:

### 1. **Backend Deployment (Deploy First)**

1. **Deploy to Vercel:**
   ```bash
   cd backend
   npx vercel
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - `MONGO_URI` = your MongoDB connection string
   - `ADMIN_EMAIL` = your admin email
   - `ADMIN_PASSWORD` = your admin password  
   - `ADMIN_NAME` = your admin name

3. **Note your backend URL** (e.g., `https://your-backend-name.vercel.app`)

### 2. **Frontend Deployment (Deploy Second)**

1. **Update Environment Variables:**
   - Edit `frontend/.env.production`
   - Replace `https://your-backend-vercel-url.vercel.app` with your actual backend URL

2. **Fix All Hardcoded URLs:**
   You need to replace ALL instances of `http://localhost:5000` in these files:
   
   **CRITICAL FILES TO UPDATE:**
   - `src/Components/Adminlogin.jsx` (line 18)
   - `src/Components/Studentlogin.jsx` (line 20)
   - `src/Components/Facultylogin.jsx` (line 20)
   - `src/Components/Signup.jsx` (line 41)
   - `src/Components/Dashboard/Admin/Admindashboard.jsx` (line 42)
   - `src/Components/Dashboard/Student/Studentdash.jsx` (lines 39, 110, 230)
   - `src/Components/Dashboard/Student/TeacherReviewForm.js` (lines 40, 98)
   - `src/Components/Dashboard/Faulty/FacultyAnalysis.jsx` (line 54)
   - `src/Components/Dashboard/Faulty/Facultydash.jsx` (line 36)
   - `src/Components/Dashboard/Faulty/chart.js` (lines 73, 74, 82, 190)
   - `src/Components/Studentdashform.jsx` (line 15)
   - `src/Components/adminchart.jsx` (line 11)

3. **Replace with environment variable:**
   ```javascript
   // Import the API config
   import API_BASE_URL from '../config/api';
   
   // Replace hardcoded URLs
   // OLD: 'http://localhost:5000/api/login'
   // NEW: `${API_BASE_URL}/api/login`
   ```

4. **Deploy to Vercel:**
   ```bash
   cd frontend
   npx vercel
   ```

### 3. **Database Setup**

Ensure your MongoDB Atlas database:
- Is accessible from Vercel (0.0.0.0/0 IP whitelist)
- Has the correct connection string in environment variables
- Contains required collections (Faculty, Student, Admin, Review)

## 🚨 Manual Fix Required

**You MUST manually update all 20+ hardcoded localhost URLs** before deployment will work. The files listed above need to be updated to use the API_BASE_URL constant instead of hardcoded URLs.

## Alternative Quick Fix:

Instead of manually updating each file, you could:

1. Create a simple find-and-replace operation:
   - Find: `'http://localhost:5000`
   - Replace: `'${API_BASE_URL}`
   
2. Add the import statement to each file:
   ```javascript
   import API_BASE_URL from '../config/api';
   ```

## Testing:

1. Test locally with environment variables first
2. Deploy backend, test API endpoints
3. Deploy frontend, test full application
4. Verify all features work in production

## Current Status: ❌ NOT READY
- [ ] Fix hardcoded URLs
- [ ] Update environment configuration  
- [ ] Test with production API URL
- [ ] Deploy and verify
