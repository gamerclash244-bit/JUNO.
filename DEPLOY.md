# Juno Store — Deployment Guide
## Stack: Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## STEP 1 — MongoDB Atlas (Database)

1. Go to **https://mongodb.com/atlas** → Create a free account
2. Click **"Build a Database"** → choose **Free (M0)** → pick a region close to India (Mumbai)
3. Create a username and password → **save these** (you'll need them)
4. Under **"Network Access"** → click **"Add IP Address"** → choose **"Allow access from anywhere"** (`0.0.0.0/0`)
5. Under **"Database"** → click **"Connect"** → **"Connect your application"**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/
   ```
7. Add the database name at the end:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/juno-store
   ```
   **Save this — this is your `MONGODB_URI`**

---

## STEP 2 — Deploy Backend to Render

1. Push your code to GitHub. Your repo structure should be:
   ```
   your-repo/
   ├── server/
   │   ├── index.js
   │   ├── package.json
   │   ├── models/
   │   │   └── index.js
   │   ├── middleware/
   │   │   └── auth.js
   │   └── routes/
   │       ├── auth.js
   │       ├── orders.js
   │       └── notify.js
   ├── public/
   │   └── index.html
   └── admin/
       └── index.html
   ```

2. Go to **https://render.com** → Sign up (free)

3. Click **"New +"** → **"Web Service"**

4. Connect your GitHub repo

5. Fill in the settings:
   - **Name:** `juno-api`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

6. Scroll down to **"Environment Variables"** → click **"Add Environment Variable"** for each:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string (e.g. `junoSecret_xK9#mP2!qL8vR5`) |
   | `ADMIN_EMAIL` | your admin email |
   | `ADMIN_PASSWORD` | your admin password |
   | `FRONTEND_URL` | (fill in after Vercel deploy, e.g. `https://juno.vercel.app`) |
   | `PORT` | `5000` |

7. Click **"Create Web Service"** → wait for it to deploy (2–3 minutes)

8. **Copy your Render URL** — it looks like `https://juno-api.onrender.com`
   → This is your backend URL

9. **Create your admin account** — open this URL in your browser once:
   ```
   https://juno-api.onrender.com/api/admin/seed?secret=YOUR_JWT_SECRET
   ```
   You should see: `{"message":"Admin created"}`
   **Do this only once.**

---

## STEP 3 — Update API URL in your frontend files

In **`public/index.html`**, find this line near the top of the `<script>`:
```javascript
const API = 'https://your-juno-api.onrender.com';
```
Change it to your actual Render URL:
```javascript
const API = 'https://juno-api.onrender.com';
```

Do the same in **`admin/index.html`**:
```javascript
const API = 'https://your-juno-api.onrender.com'; // ← update this
```

Commit and push both changes to GitHub.

---

## STEP 4 — Deploy Frontend to Vercel

1. Go to **https://vercel.com** → Sign up with GitHub

2. Click **"Add New Project"** → import your GitHub repo

3. Configure:
   - **Framework Preset:** Other (it's plain HTML)
   - **Root Directory:** `public`
   - Leave build settings blank

4. Click **"Deploy"** → wait ~1 minute

5. Your store is live at something like `https://juno-xxxx.vercel.app`

6. (Optional) Add a custom domain in Vercel settings

---

## STEP 5 — Deploy Admin Panel to Vercel

You can deploy the admin panel as a **separate Vercel project**:

1. In Vercel → **"Add New Project"** → same GitHub repo

2. This time set:
   - **Root Directory:** `admin`

3. Deploy → you get a URL like `https://juno-admin-xxxx.vercel.app`

4. **Keep this URL private** — don't share it publicly

---

## STEP 6 — Update CORS on Render

Now that you have your Vercel URLs, go back to **Render → your service → Environment**:

Update `FRONTEND_URL` to your actual Vercel store URL:
```
https://juno-xxxx.vercel.app
```

Render will auto-redeploy. Your CORS is now locked to your frontend domain.

---

## STEP 7 — Test Everything

1. **Health check:** open `https://juno-api.onrender.com/api/health` → should return `{"status":"ok"}`
2. **Store:** open your Vercel URL → try placing a test order
3. **Admin:** open your admin Vercel URL → log in with your `ADMIN_EMAIL` + `ADMIN_PASSWORD`
4. Check that the test order appears in the admin panel

---

## Project File Structure (Final)

```
your-repo/
├── server/                   ← deployed to Render
│   ├── index.js
│   ├── package.json
│   ├── .env.example          ← template (never commit .env)
│   ├── models/
│   │   └── index.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       ├── orders.js
│       └── notify.js
├── public/                   ← deployed to Vercel (main store)
│   └── index.html
└── admin/                    ← deployed to Vercel (admin panel)
    └── index.html
```

---

## Important Notes

- **Free Render servers sleep** after 15 minutes of inactivity. The first request after sleep takes ~30 seconds. Upgrade to a paid plan ($7/mo) if you want instant responses always.
- **Never commit your `.env` file** to GitHub. Use `.env.example` as a template only.
- **Admin URL is secret** — share it with no one. There's no public link to it from the store.
- **MongoDB free tier** gives you 512MB storage — more than enough for hundreds of orders.
