# Local Development Setup - Clippy

This guide helps you run Clippy locally without Docker for development and testing.

## Prerequisites

- **Node.js** (v18+) - [Download here](https://nodejs.org/)
- **MongoDB** - Either:
  - Install locally from [mongodb.com](https://www.mongodb.com/try/download/community)
  - OR use MongoDB Atlas (cloud) - connection string already in `.env`
  - OR run Docker just for MongoDB: `docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=iteshxt -e MONGO_INITDB_ROOT_PASSWORD=Itesh@2003 --name clippy-mongo mongo`

## Setup Instructions

### Option 1: Using External MongoDB (Recommended for Quick Start)

Your `.env` files are already configured to use MongoDB Atlas:

**Backend** (`.env`):

```
MONGO_URI=mongodb+srv://iteshxt:Itesh@2003@clippy.ucnsu9g.mongodb.net/?appName=clippy
BACKEND_PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Frontend** (`.env`):

```
VITE_API_URL=http://localhost:3001
VITE_MAX_FILE_SIZE_MB=10
```

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 3: Start Backend Server

From the `backend` directory:

```bash
npm run dev
```

You should see:

```
✓ MongoDB connected successfully
🚀 Backend server running on port 3001
```

Visit <http://localhost:3001/health> to verify it's running.

### Step 4: Start Frontend Server (New Terminal)

From the `frontend` directory:

```bash
npm run dev
```

You should see:

```
VITE v4.3.9  ready in 000 ms

➜  Local:   http://localhost:5173/
```

### Step 5: Access the Application

Open your browser to **<http://localhost:5173/>** (or **<http://localhost:3000/>** depending on your setup)

---

## Testing Workflow

### Test 1: Upload Text

1. Go to **Upload** tab
2. Enter sample text in the textarea
3. Select duration (e.g., "1 hour")
4. Click **"Share"**
5. Copy the generated 4-digit ID

**Expected:** See green success message with ID and copy button

### Test 2: Retrieve Text

1. Go to **Retrieve** tab
2. Paste the 4-digit ID
3. Click **"Fetch"**

**Expected:** See your text displayed in a code block with copy button

### Test 3: Upload Image

1. Go to **Upload** tab
2. Drag & drop an image file (or click to select)
3. Select duration
4. Click **"Share"**
5. Copy the ID

**Expected:** Success message with unique ID

### Test 4: Retrieve Image

1. Go to **Retrieve** tab
2. Paste the ID
3. Click **"Fetch"**

**Expected:** Image displays inline

### Test 5: Upload File

1. Go to **Upload** tab
2. Drag & drop a PDF or document file
3. Select duration
4. Click **"Share"**
5. Copy the ID

**Expected:** Success message

### Test 6: Download File

1. Go to **Retrieve** tab
2. Paste the ID
3. Click **"Fetch"**

**Expected:** Download button appears; clicking downloads the file

### Test 7: Rate Limiting

1. Rapidly upload multiple pastes (>50 in short time)
2. After 50 uploads, the next should fail with **429 error**

**Expected:** Rate limit message appears

### Test 8: Expiry

1. Upload a paste with **"1 hour"** expiry
2. Wait 1 hour (or modify backend cleanup time for testing)
3. Try to fetch it

**Expected:** "Paste not found" or "Paste expired" message

---

## Troubleshooting

### Issue: MongoDB Connection Error

**Error:** `MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**

- Ensure MongoDB is running (check with `mongosh` command)
- OR use the Docker MongoDB: `docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=iteshxt -e MONGO_INITDB_ROOT_PASSWORD=Itesh@2003 mongo`
- OR verify your MongoDB Atlas connection string in `.env`

### Issue: CORS Error in Browser Console

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

- Verify `CORS_ORIGIN=http://localhost:3000` in `backend/.env` (or if frontend is on 5173, update to `http://localhost:5173`)
- Restart backend after changing `.env`

### Issue: Frontend Won't Connect to Backend

**Error:** `Failed to upload. Please try again.`

**Solution:**

- Verify `VITE_API_URL=http://localhost:3001` in `frontend/.env`
- Ensure backend is running on port 3001
- Check browser network tab (F12 → Network) to see failed requests

### Issue: File Upload Fails

**Error:** `File too large` or `Unsupported content type`

**Solution:**

- Ensure file is ≤10MB
- Check supported file types in backend (`.env` has `MAX_FILE_SIZE_MB=10`)

---

## Environment Variables Explained

### Backend (`backend/.env`)

| Variable | Purpose | Default |
|----------|---------|---------|
| `MONGO_URI` | MongoDB connection string | Cloud Atlas URL |
| `BACKEND_PORT` | Express server port | 3001 |
| `CORS_ORIGIN` | Allowed frontend origin | <http://localhost:3000> |
| `NODE_ENV` | Running environment | development |
| `MAX_FILE_SIZE_MB` | Max upload size | 10 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 3600000 (1 hour) |
| `RATE_LIMIT_MAX_REQUESTS` | Max uploads per window | 50 |
| `PASTE_DEFAULT_EXPIRY_MINUTES` | Default paste duration | 60 |
| `PASTE_MAX_EXPIRY_MINUTES` | Max paste duration | 1440 (24 hours) |

### Frontend (`frontend/.env`)

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | <http://localhost:3001> |
| `VITE_MAX_FILE_SIZE_MB` | Max file size display | 10 |

---

## Common Tasks

### Clear All Pastes from Database

1. Connect to MongoDB:

   ```bash
   mongosh --username iteshxt --password Itesh@2003 --authenticationDatabase admin --host clippy.ucnsu9g.mongodb.net
   ```

2. Switch to database:

   ```bash
   use clippy
   ```

3. Clear pastes:

   ```bash
   db.pastes.deleteMany({})
   ```

### View Backend Logs

Backend logs appear in the terminal where you ran `npm run dev`. Look for:

- ✓ MongoDB connected
- 📤 Paste uploaded
- 📥 Paste retrieved
- 🗑️ Paste deleted

### Check API Endpoints

Use `curl` or **Postman**:

```bash
# Health check
curl http://localhost:3001/health

# Create paste (text)
curl -X POST http://localhost:3001/api/paste \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello World","contentType":"text","duration":"60"}'

# Fetch paste
curl http://localhost:3001/api/paste/1234
```

---

## Next Steps

- ✅ Verify backend connects to MongoDB
- ✅ Test all upload/retrieve scenarios
- ✅ Test rate limiting
- ✅ Once verified locally, proceed to Docker containerization

---

## Need Help?

Check:

1. Console errors (browser F12 → Console tab)
2. Backend terminal output
3. MongoDB connection string in `.env`
4. Firewall/antivirus blocking ports 3001, 5173
