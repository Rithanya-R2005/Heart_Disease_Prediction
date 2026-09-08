import os
import joblib
import numpy as np
import tensorflow as tf
from typing import Dict, Any, Tuple
from app.schemas.predict import PredictionRequest, PredictionResponse, CalculatedFeatures
from app.services.recommendation_engine import RecommendationEngine

class PredictionService:
    _instance = None
    model = None
    scaler = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = PredictionService()
        return cls._instance

    def initialize(self):
        """
        Loads the trained ANN model and RobustScaler into memory once during application startup.
        """
        # Resolve path to models folder in workspace root
        current_dir = os.path.dirname(os.path.abspath(__file__))
        possible_paths = [
            os.path.abspath(os.path.join(current_dir, "../../../../models")),
            os.path.abspath(os.path.join(current_dir, "../../../models")),
            os.path.abspath("models")
        ]

        model_path = None
        scaler_path = None

        for path in possible_paths:
            m_path = os.path.join(path, "heart_disease_ann_final.keras")
            s_path = os.path.join(path, "robust_scaler.pkl")
            if os.path.exists(m_path) and os.path.exists(s_path):
                model_path = m_path
                scaler_path = s_path
                break

        if not model_path or not scaler_path:
            raise FileNotFoundError("Could not find heart_disease_ann_final.keras or robust_scaler.pkl in models directory.")

        print(f"[PredictionService] Loading ANN Model from: {model_path}")
        self.model = tf.keras.models.load_model(model_path)

        print(f"[PredictionService] Loading RobustScaler from: {scaler_path}")
        self.scaler = joblib.load(scaler_path)

        print("[PredictionService] Model and Scaler successfully initialized!")

    def predict(self, req: PredictionRequest) -> Dict[str, Any]:
        if self.model is None or self.scaler is None:
            self.initialize()

        # 1. Map Categorical Features to exact numerical encoding used in model training
        # Gender: Female -> 1, Male -> 2
        gender_val = 2.0 if req.gender.strip().lower() in ["male", "m", "2"] else 1.0

        # Cholesterol: Normal -> 1, Above Normal -> 2, High -> 3
        chol_map = {"normal": 1.0, "above normal": 2.0, "high": 3.0}
        chol_val = chol_map.get(req.cholesterol.strip().lower(), 1.0)

        # Glucose: Normal -> 1, Above Normal -> 2, High -> 3
        gluc_map = {"normal": 1.0, "above normal": 2.0, "high": 3.0}
        gluc_val = gluc_map.get(req.glucose.strip().lower(), 1.0)

        # Binary features: Yes -> 1, No -> 0
        smoke_val = 1.0 if req.smoke.strip().lower() in ["yes", "y", "true", "1"] else 0.0
        alcohol_val = 1.0 if req.alcohol.strip().lower() in ["yes", "y", "true", "1"] else 0.0
        active_val = 1.0 if req.physical_activity.strip().lower() in ["yes", "y", "true", "1"] else 0.0

        # 2. Calculate Derived Features
        height_m = req.height / 100.0
        bmi = round(req.weight / (height_m ** 2), 2)
        pulse_pressure = round(req.systolic_bp - req.diastolic_bp, 2)
        map_val = round((req.systolic_bp + (2.0 * req.diastolic_bp)) / 3.0, 2)

        import pandas as pd

        # 3. Construct 14-feature DataFrame in EXACT order expected by training pipeline:
        # ['age', 'gender', 'height', 'weight', 'Systolic_BP', 'Diastolic_BP', 'cholesterol', 'Glucose', 'smoke', 'Alcohol', 'Physical_Activity', 'BMI', 'Pulse_Pressure', 'MAP']
        feature_cols = [
            'age', 'gender', 'height', 'weight', 'Systolic_BP', 'Diastolic_BP',
            'cholesterol', 'Glucose', 'smoke', 'Alcohol', 'Physical_Activity',
            'BMI', 'Pulse_Pressure', 'MAP'
        ]
        df_input = pd.DataFrame([[
            float(req.age),
            float(gender_val),
            float(req.height),
            float(req.weight),
            float(req.systolic_bp),
            float(req.diastolic_bp),
            float(chol_val),
            float(gluc_val),
            float(smoke_val),
            float(alcohol_val),
            float(active_val),
            float(bmi),
            float(pulse_pressure),
            float(map_val)
        ]], columns=feature_cols)

        # 4. Transform features using RobustScaler (transform only, no fit!)
        scaled_features = self.scaler.transform(df_input)


        # 5. Execute ANN prediction
        prediction = self.model.predict(scaled_features, verbose=0)
        risk_prob = float(prediction[0][0])
        risk_pct = round(risk_prob * 100.0, 1)

        # 6. Determine Risk Level
        if risk_prob < 0.30:
            risk_level = "Low Risk"
        elif risk_prob < 0.60:
            risk_level = "Moderate Risk"
        else:
            risk_level = "High Risk"

        # 7. Generate Personalized Insights & Recommendations
        req_dict = req.model_dump()
        calculated_dict = {
            "bmi": bmi,
            "pulse_pressure": pulse_pressure,
            "map": map_val
        }
        assessment = RecommendationEngine.generate_assessment(
            data=req_dict,
            calculated=calculated_dict,
            risk_probability=risk_prob,
            risk_level=risk_level
        )

        return {
            "risk_probability": risk_prob,
            "risk_percentage": risk_pct,
            "risk_level": risk_level,
            "calculated_features": CalculatedFeatures(**calculated_dict),
            "insights": assessment["insights"],
            "recommendations": assessment["recommendations"]
        }

prediction_service = PredictionService.get_instance()
