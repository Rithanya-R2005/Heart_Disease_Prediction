from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.predict import PredictionRequest, PredictionResponse
from app.services.prediction_service import prediction_service
from app.utils.jwt import get_current_user
from app.database.connection import get_db
from app.routes.healthchecks import format_healthcheck_doc

router = APIRouter(prefix="/api", tags=["Prediction"])

@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def predict_heart_disease(
    req: PredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Real End-to-End Heart Disease Prediction API.
    Processes user health inputs, calculates derived features (BMI, Pulse Pressure, MAP),
    applies RobustScaler, evaluates trained ANN model, saves healthcheck record to MongoDB,
    and returns risk assessment, personalized insights, and recommendations.
    """
    try:
        result = prediction_service.predict(req)

        # Save healthcheck record to MongoDB
        user_id = current_user.get("user_id")
        created_at = datetime.now(timezone.utc)

        calculated = result["calculated_features"].model_dump() if hasattr(result["calculated_features"], "model_dump") else dict(result["calculated_features"])
        insights = [i.model_dump() if hasattr(i, "model_dump") else i for i in result["insights"]]
        recommendations = [r.model_dump() if hasattr(r, "model_dump") else r for r in result["recommendations"]]

        healthcheck_doc = {
            "user_id": user_id,
            "created_at": created_at,
            "risk_probability": result["risk_probability"],
            "risk_percentage": result["risk_percentage"],
            "risk_level": result["risk_level"],
            "is_extrapolated": result.get("is_extrapolated", False),
            "extrapolation_note": result.get("extrapolation_note"),
            "input_data": req.model_dump(),
            "calculated_features": calculated,
            "insights": insights,
            "recommendations": recommendations
        }

        db = get_db()
        insert_res = db.healthchecks.insert_one(healthcheck_doc)
        saved_doc = db.healthchecks.find_one({"_id": insert_res.inserted_id})
        formatted = format_healthcheck_doc(saved_doc)

        result["id"] = formatted["id"]
        result["created_at"] = formatted["created_at"]

        return result
    except Exception as e:
        print(f"[Prediction Error]: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete health analysis. Please try again."
        )

