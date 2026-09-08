from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.utils.jwt import get_current_user
from app.database.connection import get_db

router = APIRouter(prefix="/api/healthchecks", tags=["HealthChecks"])

def format_healthcheck_doc(doc: dict) -> dict:
    if not doc:
        return None
    created_at_val = doc.get("created_at")
    if isinstance(created_at_val, datetime):
        if created_at_val.tzinfo is None:
            created_at_val = created_at_val.replace(tzinfo=timezone.utc)
        created_at_str = created_at_val.isoformat()
    elif isinstance(created_at_val, str):
        if created_at_val and "T" in created_at_val and not created_at_val.endswith("Z") and not ("+" in created_at_val or "-" in created_at_val[10:]):
            created_at_str = created_at_val + "Z"
        else:
            created_at_str = created_at_val
    else:
        created_at_str = str(created_at_val) if created_at_val else ""

    return {
        "id": str(doc["_id"]),
        "user_id": doc.get("user_id"),
        "created_at": created_at_str,
        "risk_probability": doc.get("risk_probability", 0.0),
        "risk_percentage": doc.get("risk_percentage", 0.0),
        "risk_level": doc.get("risk_level", "Unknown"),
        "is_extrapolated": doc.get("is_extrapolated", False),
        "extrapolation_note": doc.get("extrapolation_note", None),
        "input_data": doc.get("input_data", {}),
        "calculated_features": doc.get("calculated_features", {}),
        "insights": doc.get("insights", []),
        "recommendations": doc.get("recommendations", [])
    }

@router.get("", status_code=status.HTTP_200_OK)
async def get_user_healthchecks(current_user: dict = Depends(get_current_user)):
    """
    Get complete HealthCheck history for the authenticated user (sorted newest first).
    """
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session"
        )
    
    db = get_db()
    cursor = db.healthchecks.find({"user_id": user_id}).sort("created_at", -1)
    results = [format_healthcheck_doc(doc) for doc in cursor]
    return results

@router.get("/latest", status_code=status.HTTP_200_OK)
async def get_latest_healthcheck(current_user: dict = Depends(get_current_user)):
    """
    Get the latest HealthCheck for the authenticated user.
    """
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session"
        )

    db = get_db()
    doc = db.healthchecks.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No HealthCheck record found"
        )
    return format_healthcheck_doc(doc)

@router.get("/{id}", status_code=status.HTTP_200_OK)
async def get_healthcheck_by_id(id: str, current_user: dict = Depends(get_current_user)):
    """
    Get a specific HealthCheck record by ID (restricted to authenticated owner).
    """
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session"
        )

    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid HealthCheck ID format"
        )

    db = get_db()
    doc = db.healthchecks.find_one({"_id": ObjectId(id), "user_id": user_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HealthCheck record not found"
        )
    return format_healthcheck_doc(doc)
