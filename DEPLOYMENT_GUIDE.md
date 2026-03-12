# Deployment Guide

This project is divided into **Frontend (Vite)** and **Backend (Node/Express)**.

## 1. Database (MongoDB Atlas)
1. Create a free account at [mongodb.com](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster.
3. Under "Network Access", allow access from `0.0.0.0/0` (anywhere).
4. Under "Database Access", create a user with a password.
5. Get your Connection String (it looks like `mongodb+srv://...`).

---

## 2. Backend Deployment (Render.com)
1. Create an account on [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set **Root Directory** to `backend`.
5. **Build Command**: `npm install`
6. **Start Command**: `node server.js`
7. In the **Environment Settings**, add these variables:
   - `MONGO_URI`: (Your MongoDB Atlas string)
   - `PORT`: `3001`
   - `FRONTEND_URL`: (The URL of your frontend once deployed, e.g., `https://my-dashboard.vercel.app`)

---

## 3. Frontend Deployment (Vercel or Netlify)
1. Go to [Vercel](https://vercel.com).
2. Click **New Project** and connect your GitHub.
3. Select your repository.
4. Set **Framework Preset** to Vite.
5. **Root Directory**: (Leave blank or `.`)
6. In **Environment Variables**, add:
   - `VITE_API_URL`: (The URL from Render + `/api`, e.g., `https://my-backend.onrender.com/api`)
   - `VITE_SOCKET_URL`: (The URL from Render, e.g., `https://my-backend.onrender.com`)
7. Click **Deploy**.

---

## 4. Final Connection
Once both are deployed, go back to Render and update the `FRONTEND_URL` variable with your actual Vercel URL. This ensures CORS works correctly.
