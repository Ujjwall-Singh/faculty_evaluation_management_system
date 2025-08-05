# 🚨 CORS & Double Slash Debug Guide

## Current Issue:
- URL showing: `https://fems-livebackend.vercel.app//api/signup` (extra slash)
- CORS error: "Redirect is not allowed for a preflight request"

## Debug Steps:

### 1. Check Console Logs
In browser console, check for:
- `API_BASE_URL being used:`
- `Full API URL being called:`
- `Environment variable:`

### 2. Possible Causes:

#### A) Cached Build Issue:
- Old production build still cached
- Need to clear Vercel cache

#### B) Environment Variable Issue:
- Vercel might have different env var
- Check Vercel dashboard environment settings

#### C) Axios Base URL Conflict:
- Axios might have a baseURL set elsewhere
- Check for global axios configuration

### 3. Immediate Fixes:

#### Fix 1: Force Clear Cache
```bash
# Clear local build
rm -rf build/
npm run build

# Force deploy with cache clear
vercel --prod --force
```

#### Fix 2: Hardcode temporarily
```javascript
// In api.js - absolute hardcode
const API_BASE_URL = 'https://fems-livebackend.vercel.app';
```

#### Fix 3: Check Vercel Environment
- Go to Vercel Dashboard
- Check Environment Variables
- Make sure REACT_APP_API_URL is set correctly

### 4. Backend CORS Check:

Make sure backend has:
```javascript
const corsOptions = {
  origin: '*', // Temporarily allow all
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### 5. Test Backend Direct:
```
curl https://fems-livebackend.vercel.app/api/signup
```

## Current Status:
- ✅ API_BASE_URL: No trailing slash
- ✅ Template literals: Correct syntax  
- ❌ Production URL: Extra slash appearing
- ❌ CORS: Preflight failing

## Next Actions:
1. Check browser console logs
2. Clear Vercel cache and redeploy
3. Test backend endpoint directly
4. Update CORS to allow all temporarily
