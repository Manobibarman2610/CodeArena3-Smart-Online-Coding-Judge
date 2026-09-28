# 🚀 CodeArena — Full-Stack Deployment Guide for Netlify

This guide explains how to host the **CodeArena** frontend on Netlify and connect it to your live backend.

---

## 🏗 System Architecture in Production

```
               ┌───────────────────────────────┐
               │    Netlify (Frontend CDN)    │
               │   HTML, CSS, JS, Assets       │
               └──────────────┬────────────────┘
                              │
                  /api/* Proxy Request
                              │
               ┌──────────────▼────────────────┐
               │  Render / Railway / VPS / EC2 │
               │   Node.js + Express Server    │
               │   Multi-Language Sandbox      │
               └──────────────┬────────────────┘
                              │
               ┌──────────────▼────────────────┐
               │      MySQL Database Server    │
               │  (Aiven / PlanetScale / AWS)  │
               └───────────────────────────────┘
```

---

## Step 1: Deploy Frontend to Netlify

You have two easy methods to deploy on Netlify:

### Method A: Drag & Drop (Fastest — 1 Minute)
1. Go to [https://app.netlify.com](https://app.netlify.com) and log in.
2. Go to the **Sites** tab.
3. Drag and drop the **`Codearena`** folder into the **"Drag & drop your site output folder here"** area.
4. Netlify will publish your site immediately and assign you a free `https://<site-name>.netlify.app` URL.

---

### Method B: Git + Netlify (Continuous Deployment — Recommended)
1. Initialize git and push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Deploy CodeArena to Netlify"
   git branch -M main
   git remote add origin https://github.com/<your-username>/codearena.git
   git push -u origin main
   ```
2. Log in to [Netlify Dashboard](https://app.netlify.com).
3. Click **Add new site** $\rightarrow$ **Import an existing project**.
4. Choose **GitHub** and select your `codearena` repository.
5. In the build settings:
   - **Publish directory:** `.` (or leave blank)
   - **Build command:** (leave blank)
6. Click **Deploy Site**.

---

## Step 2: Deploy the Backend & MySQL Database (Free Cloud Options)

Because the judge backend executes sandboxed code (`gcc`, `g++`, `python3`, `node`, `javac`) and manages a persistent MySQL database, host the backend service on **Render**, **Railway**, or **Fly.io**:

### Recommended: Render.com (Free Tier)
1. Create a free account on [Render.com](https://render.com).
2. **Create MySQL Database:**
   - Click **New +** $\rightarrow$ **PostgreSQL / MySQL** (or use free MySQL on [Aiven.io](https://aiven.io) or [Clever-Cloud](https://www.clever-cloud.com)).
3. **Deploy Backend Web Service:**
   - Click **New +** $\rightarrow$ **Web Service**.
   - Connect your GitHub repository.
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     ```ini
     PORT=5001
     NODE_ENV=production
     DB_HOST=<your-db-host>
     DB_USER=<your-db-user>
     DB_PASSWORD=<your-db-password>
     DB_NAME=codearena
     JWT_SECRET=your_super_secret_jwt_key
     FRONTEND_URL=https://<your-site-name>.netlify.app
     ```
4. Copy your live backend service URL (e.g. `https://codearena-backend.onrender.com`).

---

## Step 3: Link Netlify to Your Live Backend

Once your backend is live:

1. Open `netlify.toml` and update the proxy destination with your backend URL:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://<your-backend-service-url>.onrender.com/api/:splat"
     status = 200
     force = true
   ```
2. Or set `window.CODEARENA_API_URL` directly in your frontend environment.
3. Commit and push to GitHub (or re-drag into Netlify).

---

## Step 4: Run Initial Database Seed on Cloud DB

To populate the cloud MySQL database with the initial demo accounts, 22 problems, and 150 practice tracks:

```bash
cd backend
# Temporarily set your cloud DB credentials in backend/.env
node config/seed.js
node config/seed_practice.js
```

---

## ✅ You're Done!
Your site is now live at `https://<your-site>.netlify.app` with full authentication, progressive hints, AI analysis, real-time multi-language sandboxed code execution, and practice tracks!
