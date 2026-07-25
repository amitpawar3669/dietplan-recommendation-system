# Diet Plan Recommendation System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Project-2E7D32?style=for-the-badge)](https://your-domain.example)

AI/ML-powered personalized nutrition platform that recommends meals, builds meal plans, and supports healthier food choices through a Flask API and a React frontend.

## Overview

Diet Plan Recommendation System is a full-stack application in the AI/ML domain that combines content-based filtering, collaborative filtering, and contextual rules to generate personalized meal recommendations. It is designed for users who want meal suggestions based on diet type, cuisine, health goals, and meal preferences.

The project includes a Flask backend, a React/Vite frontend, and a notebook implementation for experimentation and model exploration.

## Features

- Personalized meal recommendations based on user profile and preferences
- Hybrid recommendation engine using content-based, collaborative, and contextual signals
- Meal search and nutrition-aware filtering
- User profile creation for diet type, cuisine, meal type, and healthiness preferences
- Health check and system information endpoints for observability
- Responsive React frontend with protected routes
- Demo-model fallback so the backend can run even without prebuilt model files
- Deployment-ready frontend/backend separation with environment-based API configuration

## Architecture

The system follows a simple client-server architecture:

- The frontend sends user actions and preferences to the backend API.
- The backend loads model data, applies recommendation logic, and returns ranked meals.
- The frontend renders the results and handles navigation between pages.
- In production, the frontend points to the deployed backend through `VITE_API_BASE_URL`.

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm

### Clone the repository

```powershell
git clone https://github.com/amitpawar3669/dietplan-recommendation-system.git
cd .\DietPlanRecommendations\
```

### Backend setup

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Create a backend environment file if needed:

```env
FLASK_ENV=development
DEBUG=True
PORT=5000
SECRET_KEY=your-secret-key
DATA_PATH=./data
MODEL_PATH=./models
```

Run the backend:

```powershell
python app.py
```

### Frontend setup

```powershell
Set-Location frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run the frontend:

```powershell
npm run dev
```

## Deployment

This project is designed to work with a separate frontend and backend deployment.

### Recommended deployment flow

1. Deploy the backend API to a host such as Render, Railway, or Fly.io.
2. Deploy the frontend as a static site to the same platform or a CDN-backed host.
3. Set the frontend environment variable `VITE_API_BASE_URL` to the deployed backend URL.
4. Point your custom domain to the frontend service using DNS.
5. Ensure SSL/TLS is enabled on both the frontend and backend domains.

### Example production settings

Backend:

```env
FLASK_ENV=production
SECRET_KEY=<strong-production-secret>
```

Frontend:

```env
VITE_API_BASE_URL=https://api.your-domain.example/api
```

### Production notes

- Use `gunicorn wsgi:app` for the backend start command.
- Serve the frontend build from the `dist` directory.
- Keep sensitive environment variables out of Git.
- Update the live-domain badge above to your actual domain after deployment.

## Usage

### Backend API examples

Health check:

```powershell
Invoke-WebRequest http://localhost:5000/api/health
```

Get recommendations:

```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "top_n": 5, "content_weight": 0.5, "collab_weight": 0.5, "context_weight": 0.0}'
```

Create a user profile:

```bash
curl -X POST http://localhost:5000/api/user-profile \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "diet_type": "Keto", "cuisine": "Mediterranean", "meal_type": "Breakfast", "min_healthiness": 50}'
```

Search meals:

```bash
curl "http://localhost:5000/api/meals/search?diet_type=Keto&cuisine=Mediterranean&limit=5"
```

### Frontend usage

Start the frontend, open the local Vite URL, and log in or navigate to the meal planner to generate recommendations using the backend API configured in `VITE_API_BASE_URL`.

## API Reference

- `GET /api/health` - backend health status
- `GET /api/info` - system and model information
- `POST /api/recommendations` - hybrid recommendations
- `POST /api/content-based` - similar meal recommendations
- `POST /api/user-profile` - create a user profile
- `GET /api/meals/search` - search meals by filters

## Repository Structure

```text
backend/   Flask API, model service, and WSGI entrypoint
frontend/  React/Vite app
logs/      Runtime logs
Diet_Plan_Recommendation_System.ipynb  Notebook implementation
healthy_eating_dataset.csv              Dataset
```

## Contributing

Contributions are welcome. If you find a bug, want to improve the UI, or want to extend the recommendation engine, feel free to open an issue or submit a pull request.

Please keep changes focused, include clear commit messages, and update the README if your change affects setup or usage.

## License

This project is currently provided without an explicit license.

If you intend to publish it publicly, consider adding a license such as MIT, Apache 2.0, or GPL-3.0.