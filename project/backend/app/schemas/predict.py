from pydantic import BaseModel, Field, model_validator, field_validator
from typing import List, Optional

class PredictionRequest(BaseModel):
    age: float = Field(..., gt=0, lt=120, description="Age in years")
    gender: str = Field(..., description="'Male' or 'Female'")
    height: float = Field(..., gt=50, lt=250, description="Height in cm")
    weight: float = Field(..., gt=20, lt=300, description="Weight in kg")
    systolic_bp: float = Field(..., gt=60, lt=260, description="Systolic Blood Pressure in mmHg")
    diastolic_bp: float = Field(..., gt=40, lt=180, description="Diastolic Blood Pressure in mmHg")
    cholesterol: str = Field(..., description="'Normal', 'Above Normal', or 'High'")
    glucose: str = Field(..., description="'Normal', 'Above Normal', or 'High'")
    smoke: str = Field(..., description="'Yes' or 'No'")
    alcohol: str = Field(..., description="'Yes' or 'No'")
    physical_activity: str = Field(..., description="'Yes' or 'No'")

    @field_validator('gender')
    @classmethod
    def validate_gender(cls, v: str) -> str:
        clean = v.strip().title()
        if clean not in ["Male", "Female"]:
            raise ValueError("Gender must be 'Male' or 'Female'.")
        return clean

    @field_validator('cholesterol', 'glucose')
    @classmethod
    def validate_levels(cls, v: str) -> str:
        clean = v.strip().title()
        if clean not in ["Normal", "Above Normal", "High"]:
            raise ValueError("Must be 'Normal', 'Above Normal', or 'High'.")
        return clean

    @field_validator('smoke', 'alcohol', 'physical_activity')
    @classmethod
    def validate_binary(cls, v: str) -> str:
        clean = v.strip().title()
        if clean not in ["Yes", "No"]:
            raise ValueError("Must be 'Yes' or 'No'.")
        return clean

    @model_validator(mode='after')
    def validate_blood_pressure(self):
        if self.diastolic_bp >= self.systolic_bp:
            raise ValueError(
                "Diastolic blood pressure must be strictly less than systolic blood pressure."
            )
        return self

class CalculatedFeatures(BaseModel):
    bmi: float
    pulse_pressure: float
    map: float

class HealthInsight(BaseModel):
    category: str
    title: str
    description: str
    impact: str  # e.g., 'Positive', 'Attention', 'High Risk'

class Recommendation(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str  # 'High', 'Medium', 'Low'

class PredictionResponse(BaseModel):
    id: Optional[str] = None
    created_at: Optional[str] = None
    risk_probability: float
    risk_percentage: float
    risk_level: str
    is_extrapolated: bool = False
    extrapolation_note: Optional[str] = None
    calculated_features: CalculatedFeatures
    insights: List[HealthInsight]
    recommendations: List[Recommendation]


