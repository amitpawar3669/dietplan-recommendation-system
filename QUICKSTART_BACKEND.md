# Quick Start Guide - Backend Deployment

## ⚡ Get Started in 5 Minutes

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Create Virtual Environment
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment
```bash
cp .env.example .env
# Edit .env if needed
```

### Step 5: Run Server
```bash
python run.py
```

✅ Server running at `http://localhost:5000`

---

## 🧪 Test It Out

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get Recommendations
```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"user_id": 5, "top_n": 3}'
```

### Search Meals
```bash
curl "http://localhost:5000/api/meals/search?diet_type=Keto&limit=5"
```

---

## 🐳 Docker Deployment

### Build
```bash
docker build -t diet-backend .
```

### Run
```bash
docker run -p 5000:5000 diet-backend
```

### Or with Docker Compose
```bash
docker-compose up -d
```

---

## 📚 Documentation

- **API Docs**: See `README.md` for complete endpoint documentation
- **Setup Guide**: See `BACKEND_SETUP.md` for detailed setup instructions
- **Configuration**: See `.env.example` for configuration options

---

## 🔍 Available Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Server health check |
| GET | `/api/info` | System information |
| POST | `/api/recommendations` | Get personalized recommendations |
| POST | `/api/content-based` | Get similar meals |
| POST | `/api/user-profile` | Create user profile |
| GET | `/api/meals/search` | Search meals by filters |

---

## 🛠️ Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

### Environment
```bash
export FLASK_ENV=production
export DEBUG=False
export SECRET_KEY=your-secure-key-here
```

---

## 📋 Logs

Application logs are stored in:
- `logs/app_YYYYMMDD.log` - All logs
- `logs/errors_YYYYMMDD.log` - Errors only

View logs:
```bash
tail -f logs/app_*.log
```

---

## ✅ Verification Checklist

- [x] Code is clean and well-organized
- [x] Error handling implemented
- [x] Logging configured
- [x] API routes tested
- [x] Documentation provided
- [x] Docker support added
- [x] Configuration management setup
- [x] Production-ready

---

## 🚀 You're All Set!

The backend is fully functional and ready for:
- ✅ Development
- ✅ Testing
- ✅ Production Deployment
- ✅ Frontend Integration
- ✅ Scaling

For detailed information, see:
- `README.md` - Complete API documentation
- `BACKEND_SETUP.md` - Detailed setup and configuration

---

**Last Updated**: March 27, 2024
**Status**: ✅ Ready for Use
