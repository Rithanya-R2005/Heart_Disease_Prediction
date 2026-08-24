# CardioSense - Heart Disease Prediction Using Wearable Devices

## Project Overview

CardioSense is an AI-powered heart health monitoring platform designed to predict heart disease risk using wearable device data and advanced machine learning algorithms.

**Current Module Completed:** Authentication System with Frontend & Backend Foundation

---

## Technology Stack

### Frontend
- **React.js** - UI Framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and dev server
- **CSS** - Custom styling with modern design principles

### Backend
- **Python FastAPI** - Web framework
- **MongoDB** - NoSQL database
- **PyMongo** - MongoDB driver
- **JWT (python-jose)** - Authentication tokens
- **bcrypt (passlib)** - Password hashing
- **Pydantic** - Data validation
- **python-dotenv** - Environment variable management

---

## Project Structure

```
Heart_Disease_Prediction/
└── project/
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── Navbar.jsx          # Navigation bar (public/authenticated)
    │   │   │   ├── Footer.jsx          # Footer component
    │   │   │   └── ProtectedRoute.jsx  # Route protection wrapper
    │   │   ├── pages/
    │   │   │   ├── Home.jsx            # Landing page
    │   │   │   ├── Login.jsx           # Login page
    │   │   │   ├── Signup.jsx          # Registration page
    │   │   │   ├── Dashboard.jsx       # Protected dashboard (placeholder)
    │   │   │   └── HealthCheck.jsx     # HealthCheck AI page (placeholder)
    │   │   ├── context/
    │   │   │   └── AuthContext.jsx     # Authentication state management
    │   │   ├── services/
    │   │   │   └── api.js              # Axios API service layer
    │   │   ├── App.jsx                 # Main app component with routing
    │   │   ├── main.jsx                # React entry point
    │   │   └── index.css               # Global styles
    │   ├── index.html                  # HTML template
    │   ├── package.json                # Frontend dependencies
    │   └── vite.config.js              # Vite configuration
    │
    └── backend/
        ├── app/
        │   ├── main.py                 # FastAPI application entry point
        │   ├── database/
        │   │   └── connection.py        # MongoDB connection management
        │   ├── models/
        │   │   └── user.py             # User data models
        │   ├── schemas/
        │   │   └── auth.py             # API response schemas
        │   ├── routes/
        │   │   └── auth.py             # Authentication endpoints
        │   ├── services/
        │   │   └── auth_service.py     # Business logic for auth
        │   └── utils/
        │       ├── security.py         # Password hashing utilities
        │       └── jwt.py              # JWT token management
        ├── .env                        # Environment variables
        ├── requirements.txt            # Python dependencies
        └── README.md                   # Backend documentation
```

---

## Features Implemented

### ✅ Completed Features

1. **Frontend Foundation**
   - Modern React application with Vite
   - Component-based architecture
   - Responsive design for all screen sizes
   - Professional healthcare/AI visual style

2. **Landing Page**
   - Hero section with gradient background
   - Feature cards showcasing planned capabilities
   - "How It Works" section
   - Call-to-action sections
   - Professional footer

3. **Navigation**
   - Public navbar: Home, Heart Health AI, Login
   - Authenticated navbar: Home, HealthCheck AI, Dashboard, Logout
   - Responsive mobile menu
   - Smooth hover effects and transitions

4. **Authentication Pages**
   - Login page with email/password
   - Signup page with name, email, phone, password, confirm password
   - Form validation with error messages
   - Loading states
   - Professional UI design

5. **Backend API**
   - FastAPI server with CORS configuration
   - MongoDB connection management
   - User registration endpoint
   - User login endpoint
   - JWT token generation
   - Password hashing with bcrypt
   - Health check endpoint

6. **Authentication System**
   - JWT-based authentication
   - Protected routes (Dashboard, HealthCheck)
   - AuthContext for state management
   - Token storage in localStorage
   - Automatic token injection in API calls
   - Logout functionality

7. **Placeholder Pages**
   - Dashboard with "Coming Soon" feature cards
   - HealthCheck AI page with planned features list
   - Both pages indicate future development

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "user_id_here",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

### Health Endpoint

#### GET /api/health
Check API health status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "message": "API is running"
}
```

---

## Database Configuration

### MongoDB
- **Database Name:** `cardiosense_db`
- **Collection:** `users`
- **Connection URI:** Configured in `.env` file

### User Document Structure
```json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password_hash": "$2b$12$...",
  "created_at": ISODate("2024-01-01T00:00:00Z")
}
```

**Security Note:** Passwords are never stored in plain text. Only bcrypt-hashed passwords are stored.

---

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=cardiosense_db
JWT_SECRET_KEY=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important:** Change `JWT_SECRET_KEY` to a secure random string in production.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (running on localhost:27017)

### Backend Setup

1. Navigate to backend directory:
```bash
cd project/backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables in `.env` file (already created)

5. Start the backend server:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd project/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Running the Application

### Start Backend
```bash
cd project/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend
```bash
cd project/frontend
npm run dev
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs (FastAPI auto-docs)

---

## Testing the Application

### Manual Testing Steps

1. **Test Landing Page**
   - Navigate to http://localhost:5173
   - Verify hero section displays correctly
   - Check feature cards and sections
   - Test navigation links

2. **Test User Registration**
   - Click "Get Started" or navigate to /signup
   - Fill in all required fields
   - Submit the form
   - Verify success message
   - Check MongoDB for new user document
   - Confirm password is hashed (not plain text)

3. **Test User Login**
   - Navigate to /login
   - Enter registered email and password
   - Submit the form
   - Verify redirect to /dashboard
   - Check navbar shows authenticated links
   - Verify token is stored in localStorage

4. **Test Protected Routes**
   - Try accessing /dashboard while logged out
   - Verify redirect to /login
   - Login and try accessing /dashboard
   - Verify successful access

5. **Test Logout**
   - Click Logout button
   - Verify redirect to home
   - Check navbar shows public links
   - Verify token is cleared from localStorage
   - Try accessing /dashboard
   - Verify redirect to /login

6. **Test API Endpoints**
   - Use Postman or curl to test:
     - POST /api/auth/signup
     - POST /api/auth/login
     - GET /api/health

---

## Current Limitations & Future Work

### Not Yet Implemented (Future Modules)
- Heart disease prediction model
- Deep learning model integration (TensorFlow/Keras)
- Wearable device data integration
- ECG data processing
- Health analytics dashboard
- Charts and visualizations
- Risk prediction algorithms
- CSV data upload
- Recommendation system
- Health alerts
- AI model training and deployment

### Placeholder Pages
- **Dashboard:** Currently shows "Coming Soon" feature cards
- **HealthCheck AI:** Currently shows planned features list

These will be implemented in subsequent development phases.

---

## Security Considerations

### Implemented
- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- CORS configuration
- Environment variable usage for secrets

### Recommendations for Production
- Change JWT_SECRET_KEY to a secure random string
- Implement rate limiting
- Add email verification for signup
- Implement password reset functionality
- Add HTTPS/SSL
- Implement input sanitization
- Add logging and monitoring
- Use a production-grade MongoDB instance
- Implement session timeout
- Add CSRF protection

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Ensure MongoDB is running on localhost:27017
- Check MONGODB_URI in .env file
- Verify MongoDB service status

**Module Import Errors:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**Port Already in Use:**
- Change port in vite.config.js or stop conflicting process

**CORS Errors:**
- Ensure backend is running on port 8000
- Check CORS configuration in backend/main.py

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

---

## Development Notes

### Code Style
- Frontend: Modern React with functional components and hooks
- Backend: FastAPI with async support, Pydantic models
- CSS: Custom CSS with CSS variables for theming
- Both: Clean, readable, maintainable code structure

### File Organization
- Separation of concerns (components, pages, services, context)
- Reusable components
- Centralized API calls
- Environment-specific configuration

---

## License

This is an academic project for educational purposes.

---

## Contact

For project-related inquiries, refer to the project documentation or contact the development team.

---

**Last Updated:** January 2024
**Module Status:** Authentication System - COMPLETED ✅
