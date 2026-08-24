# CardioSense Backend

FastAPI backend for CardioSense Heart Disease Prediction application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables in `.env`:
```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=cardiosense_db
JWT_SECRET_KEY=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Ensure MongoDB is running on localhost:27017

5. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/health` - Health check

## Database

- MongoDB database: `cardiosense_db`
- Collection: `users`
