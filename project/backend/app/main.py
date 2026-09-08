from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.predict import router as predict_router
from app.routes.healthchecks import router as healthchecks_router
from app.services.prediction_service import prediction_service
from app.database.connection import MongoDB

app = FastAPI(title="CardioSense API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(healthchecks_router)

@app.on_event("startup")
async def startup_db_client():
    MongoDB.connect()
    try:
        prediction_service.initialize()
    except Exception as e:
        print(f"[Startup Warning] Could not initialize prediction service: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    MongoDB.close()


@app.get("/")
async def root():
    return {"message": "CardioSense API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}
