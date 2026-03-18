# Backend (Node.js + Express + MongoDB)

## Folder structure

- `backend/`
  - `package.json` - backend dependencies and scripts
  - `.env.example` - example environment variables
  - `src/`
    - `server.js` - starts the HTTP server
    - `app.js` - Express app and middleware
    - `config/db.js` - MongoDB connection using Mongoose
    - `models/` - Mongoose models (`User`, `Listing`, `ClaimRequest`, `Notification`)
    - `controllers/` - request handlers
    - `routes/` - Express routers
    - `middleware/auth.js` - JWT auth + role protection
    - `middleware/errorHandler.js` - not-found and error-handling middleware

## Getting started

1. Go to the `backend` folder and install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in `backend` based on `.env.example`:

   ```bash
   MONGODB_URI=mongodb://127.0.0.1:27017/feed-forward
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=replace_me_with_a_long_random_string
   FRONTEND_ORIGIN=http://localhost:8081
   ```

3. Start the backend:

   ```bash
   npm run dev
   ```

4. Example endpoints:

   - `GET /api/health` - health check
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me` (Bearer token)
   - `GET /api/listings` (public feed)
   - `GET /api/listings/me` (restaurant)
   - `POST /api/listings` (restaurant)
   - `POST /api/claims/request` (ngo)
   - `POST /api/claims/respond` (restaurant)
   - `POST /api/claims/confirm-pickup` (ngo)
   - `GET /api/notifications/me` (Bearer token)

