# Deployment Configuration Guide

## Local vs Hosted Environment Issues

### Problem
Login fails on hosted site because the frontend cannot find the backend API URL.

## Solution

### Backend (.env)
Create a `.env` file in the `backend/` folder with:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_url_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_min_32_characters_long

# Frontend URL for CORS (IMPORTANT FOR HOSTED SITES)
FRONTEND_URL=https://yourdomain.com
```

**Important**: If hosting on Vercel or similar:
- Set `FRONTEND_URL` to your actual frontend domain
- Update `PORT` if your host requires a specific port

### Frontend (.env.production)
Create a `.env.production` file in the `frontend/` folder:

```env
VITE_API_URL=https://your-backend-api-url.com/api
```

If backend is on the same domain but different path:
```env
VITE_API_URL=/api
```

### Frontend (.env.local / .env.development)
For local development (already works via vite proxy):

```env
VITE_API_URL=http://localhost:5000/api
```

## Common Hosting Scenarios

### Scenario 1: Same Domain (Recommended)
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api`
- Frontend .env: `VITE_API_URL=/api`
- Backend .env: `FRONTEND_URL=https://yourdomain.com`

### Scenario 2: Different Subdomains
- Frontend: `https://app.yourdomain.com`
- Backend: `https://api.yourdomain.com`
- Frontend .env: `VITE_API_URL=https://api.yourdomain.com/api`
- Backend .env: `FRONTEND_URL=https://app.yourdomain.com`

### Scenario 3: Vercel Frontend + Backend Server
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.com`
- Frontend .env: `VITE_API_URL=https://your-api.com/api`
- Backend .env: `FRONTEND_URL=https://your-app.vercel.app`

## Debugging Checklist

1. ✅ Check Network Tab in Browser DevTools
   - Look for API calls in Network tab
   - Check if requests are going to correct URL
   - Check response status and error messages

2. ✅ Browser Console Errors
   - Check for CORS errors
   - Check for 404 errors on API endpoints

3. ✅ Backend Logs
   - Check if requests are reaching the backend
   - Look for authentication errors

4. ✅ Environment Variables
   - Confirm `.env` file exists in backend root
   - Confirm build variables are set in Vercel/Netlify/etc.

## Vercel Deployment

If using Vercel for frontend:

1. Go to Project Settings > Environment Variables
2. Add: `VITE_API_URL=https://your-backend-url/api`
3. Redeploy

For backend on Vercel:
1. Add to Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

## Testing Login After Deployment

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for POST request to `/api/auth/login`
5. Check the response for errors
6. If CORS error: Update `FRONTEND_URL` in backend .env
7. If 404: Check `VITE_API_URL` in frontend .env.production
