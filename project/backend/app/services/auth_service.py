from app.database.connection import get_db
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token
from datetime import datetime
from bson import ObjectId

class AuthService:
    @staticmethod
    def create_user(name: str, email: str, phone: str, password: str):
        db = get_db()
        users_collection = db.users
        
        # Check if user already exists
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            raise ValueError("Email already registered")
        
        # Create new user
        user_doc = {
            "name": name,
            "email": email,
            "phone": phone,
            "password_hash": hash_password(password),
            "created_at": datetime.utcnow()
        }
        
        result = users_collection.insert_one(user_doc)
        user_doc["_id"] = str(result.inserted_id)
        
        return user_doc
    
    @staticmethod
    def authenticate_user(email: str, password: str):
        db = get_db()
        users_collection = db.users
        
        user = users_collection.find_one({"email": email})
        if not user:
            raise ValueError("Invalid credentials")
        
        if not verify_password(password, user["password_hash"]):
            raise ValueError("Invalid credentials")
        
        return user
    
    @staticmethod
    def get_user_by_email(email: str):
        db = get_db()
        users_collection = db.users
        user = users_collection.find_one({"email": email})
        if user:
            user["_id"] = str(user["_id"])
        return user
    
    @staticmethod
    def get_user_by_id(user_id: str):
        db = get_db()
        users_collection = db.users
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except:
            return None
