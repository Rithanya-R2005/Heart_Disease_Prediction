from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserLogin
from app.schemas.auth import TokenResponse, AuthResponse, UserResponse
from app.services.auth_service import AuthService
from app.utils.jwt import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    try:
        user = AuthService.create_user(
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            password=user_data.password
        )
        return {"message": "User registered successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    try:
        user = AuthService.authenticate_user(
            email=user_data.email,
            password=user_data.password
        )
        
        access_token = create_access_token(data={"sub": user["email"], "user_id": str(user["_id"])})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"]
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: str):
    user = AuthService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {
        "id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"]
    }
