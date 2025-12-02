# Backend Setup Guide

## Installation

1. Install dependencies (including CORS):
```bash
cd Backend
npm install express mongoose dotenv jsonwebtoken bcrypt cors
```

## Environment Variables

Create a `.env` file in the Backend directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobby?retryWrites=true&w=majority

# JWT Secrets (use long random strings)
JWT_ADMIN_PASSWORD=your-super-secret-admin-key-here
JWT_USER_PASSWORD=your-super-secret-user-key-here

# Server Port
PORT=3000

# Frontend URL (for CORS) - update after deploying frontend
FRONTEND_URL=http://localhost:5173

# Optional: Debug flags
# MONGOOSE_DEBUG=1
# DEBUG_TLS=1
```

### Generate Secure JWT Secrets

Run this in Node to generate secrets:
```javascript
require('crypto').randomBytes(64).toString('hex')
```

## Running the Backend

### Development
```bash
npm start
```

Server will run on http://localhost:3000

### Testing Endpoints

Use Postman or curl:

#### 1. User Signup
```bash
curl -X POST http://localhost:3000/user/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","name":"Test User","email":"test@example.com","password":"password123"}'
```

#### 2. User Signin
```bash
curl -X POST http://localhost:3000/user/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

Save the returned token.

#### 3. Get Profile
```bash
curl http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Get All Jobs
```bash
curl http://localhost:3000/user/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Option 1: Render.com

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Set environment variables in Render dashboard
5. Deploy

### Option 2: Railway.app

1. Install Railway CLI or use web dashboard
2. `railway init`
3. `railway add` (select your project)
4. Set environment variables
5. `railway up`

### Option 3: Vercel (Serverless)

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```
3. `vercel --prod`

### After Deployment

1. Note your backend URL (e.g., `https://your-app.render.com`)
2. Update FRONTEND_URL in environment variables
3. Update MongoDB IP whitelist to allow your deployment platform
4. Test all endpoints

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets (64+ characters)
- [ ] Enable MongoDB authentication
- [ ] Whitelist only necessary IPs in MongoDB
- [ ] Set proper CORS origin (not '*' in production)
- [ ] Add rate limiting (consider express-rate-limit)
- [ ] Validate all inputs
- [ ] Don't commit .env file (add to .gitignore)
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB connection encryption (TLS)

## Troubleshooting

### MongoDB Connection Issues

If you see TLS errors:
1. Check MongoDB connection string format
2. Ensure IP whitelist includes your deployment IP (or use 0.0.0.0/0 temporarily)
3. Verify username/password are URL-encoded
4. Check MongoDB Atlas cluster is active

### CORS Issues

If frontend can't reach backend:
1. Verify CORS middleware is before routes
2. Check FRONTEND_URL matches your frontend domain
3. Ensure credentials: true if using cookies
4. Check browser console for specific CORS error

### Authentication Issues

If tokens aren't working:
1. Verify JWT_USER_PASSWORD and JWT_ADMIN_PASSWORD are set
2. Check token is sent in Authorization header as "Bearer TOKEN"
3. Ensure userAuth/adminAuth middleware uses correct secret
4. Check token hasn't expired (add expiresIn option)

## API Endpoints Summary

### Public (No Auth Required)
- POST `/user/signup` - Register user
- POST `/user/signin` - Login user
- POST `/admin/signup` - Register admin
- POST `/admin/signin` - Login admin

### User Routes (Requires User Auth)
- GET `/user/profile` - Get user profile
- PUT `/user/profile` - Update profile
- GET `/user/jobs` - Get all jobs

### Job Application Routes (Requires User Auth)
- POST `/jobApplication/apply` - Apply to job
- GET `/jobApplication/` - Get user's applications
- DELETE `/jobApplication/:id` - Delete application

### Admin Routes (Requires Admin Auth)
- POST `/admin/jobs` - Create job
- PUT `/admin/jobs` - Update job
- DELETE `/admin/jobs/:jobId` - Delete job
- GET `/admin/jobs` - Get admin's jobs
- GET `/admin/all-jobs` - Get all jobs
- GET `/admin/job/:jobId` - Get single job

## Next Steps

1. Install CORS: `npm install cors`
2. Update .env with your values
3. Test locally with frontend
4. Deploy backend
5. Update frontend API_BASE_URL
6. Deploy frontend
7. Test production environment
