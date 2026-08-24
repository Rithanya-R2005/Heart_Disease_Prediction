from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class AuthResponse(BaseModel):
    message: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
