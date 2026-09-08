# CardioSense: AI-Powered Heart Disease Prediction Platform

CardioSense is a full-stack, clinically governed cardiovascular health monitoring and prediction platform. It leverages deep learning (Artificial Neural Networks) trained on biometric and hemodynamic indicators to estimate heart disease risk, detect out-of-cohort clinical extrapolations, generate personalized medical insights, and maintain patient health tracking over time.

---

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Dataset & Data Preprocessing](#2-dataset--data-preprocessing)
3. [Feature Engineering & Scaling Pipeline](#3-feature-engineering--scaling-pipeline)
4. [Model Architecture & Training](#4-model-architecture--training)
5. [Proof of Trained-Data Determinism](#5-proof-of-trained-data-determinism)
6. [Backend Inference Engine & Governance](#6-backend-inference-engine--governance)
   - [Inference Service](#61-inferenceservice)
   - [Hemodynamic Cross-Field Validation](#62-hemodynamic-cross-field-validation)
   - [Age Domain Extrapolation Governance](#63-age-domain-extrapolation-governance)
   - [Strict Categorical Input Validation](#64-strict-categorical-input-validation)
   - [Recommendation Engine](#65-recommendation-engine)
   - [Threadpool Execution & MongoDB Persistence](#66-threadpool-execution--mongodb-persistence)
7. [Frontend Presentation Layer](#7-frontend-presentation-layer)
8. [Technology Stack](#8-technology-stack)
9. [Project Directory Layout](#9-project-directory-layout)
10. [End-to-End Installation & Run Guide](#10-end-to-end-installation--run-guide)
11. [API Specification](#11-api-specification)

---

## 1. System Architecture

```
                      ┌──────────────────────────────────────────────┐
                      │             Raw Dataset                      │
                      │  cardio_train.csv (70,000 Patient Records)   │
                      └──────────────────────┬───────────────────────┘
                                             │ Preprocessing & Cleaning
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │           Cleaned & Engineered               │
                      │    (68,036 Rows, 14 Refined Features)        │
                      └──────────────────────┬───────────────────────┘
                                             │ 80/20 Train-Test Split
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │                RobustScaler                  │
                      │  Trained on 54,428 samples -> robust_scaler.pkl
                      └──────────────────────┬───────────────────────┘
                                             │ Scaled Feature Matrix
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │       Deep ANN (TensorFlow / Keras)          │
                      │  Trained with Binary Crossentropy & Sigmoid  │
                      │       -> heart_disease_ann_final.keras       │
                      └──────────────────────┬───────────────────────┘
                                             │ Serialized Artifacts
                                             ▼
┌────────────────────────┐        REST API       ┌───────────────────────────────┐
│     React Frontend     │ ◄───────────────────► │        FastAPI Backend        │
│  - HealthCheck AI Form │   POST /api/predict   │  - PredictionService (Loaded) │
│  - Realtime Derived    │                       │  - RobustScaler Transform     │
│  - Animated Risk Gauge │                       │  - ANN Inference (Sigmoid)    │
│  - Amber Alerts        │                       │  - Clinical Governance Flags  │
│  - Dashboard History   │                       │  - MongoDB Persistence        │
└────────────────────────┘                       └───────────────────────────────┘
```

---

## 2. Dataset & Data Preprocessing

### 2.1 Raw Data Specifications
* **Dataset**: Cardiovascular Disease dataset (`cardio_train.csv`).
* **Initial Size**: 70,000 patient records, 13 raw attributes.
* **Target Attribute**: `Heart_Disease` (0 = Absence, 1 = Presence).

### 2.2 Data Cleaning & Outlier Removal (`notebooks/02_Data_Preprocessing.ipynb`)
1. **Age Conversion**: Converted age from raw recorded days to fractional years:
   $$\text{age} = \frac{\text{age\_days}}{365.25}$$
2. **Biological Anomaly Filtering**:
   * Removed unrealistic systolic blood pressure readings outside $[60, 240]\text{ mmHg}$.
   * Removed unrealistic diastolic blood pressure readings outside $[40, 180]\text{ mmHg}$.
   * Enforced physiological condition: $\text{Systolic\_BP} > \text{Diastolic\_BP}$.
   * Height constrained between $120\text{ cm}$ and $220\text{ cm}$.
   * Weight constrained between $30\text{ kg}$ and $200\text{ kg}$.
3. **Cleaned Dataset Output**: 68,036 remaining samples with balanced class distributions:
   * **Class 0 (Healthy)**: 34,491 records (50.7%)
   * **Class 1 (Heart Disease)**: 33,545 records (49.3%)
   * **Empirical Age Distribution**: $\text{Min} = 29.6$, $\text{Max} = 65.0$, $Q_1 = 48.4$, $Q_2 = 54.0$, $Q_3 = 58.4$ years.

---

## 3. Feature Engineering & Scaling Pipeline

### 3.1 14 Standardized Features
The model operates on 14 standardized features in an exact sequential order:

| # | Feature Name | Type | Description / Encoding |
|---|--------------|------|------------------------|
| 1 | `age` | Float | Age in years |
| 2 | `gender` | Categorical | Female = 1.0, Male = 2.0 |
| 3 | `height` | Float | Height in centimeters |
| 4 | `weight` | Float | Weight in kilograms |
| 5 | `Systolic_BP` | Float | Systolic blood pressure (mmHg) |
| 6 | `Diastolic_BP` | Float | Diastolic blood pressure (mmHg) |
| 7 | `cholesterol` | Ordinal | Normal = 1.0, Above Normal = 2.0, High = 3.0 |
| 8 | `Glucose` | Ordinal | Normal = 1.0, Above Normal = 2.0, High = 3.0 |
| 9 | `smoke` | Binary | No = 0.0, Yes = 1.0 |
| 10 | `Alcohol` | Binary | No = 0.0, Yes = 1.0 |
| 11 | `Physical_Activity` | Binary | No = 0.0, Yes = 1.0 |
| 12 | `BMI` | Derived Float | Body Mass Index: $\frac{\text{weight (kg)}}{(\text{height (m)})^2}$ |
| 13 | `Pulse_Pressure` | Derived Float | Arterial stiffness indicator: $\text{Systolic\_BP} - \text{Diastolic\_BP}$ |
| 14 | `MAP` | Derived Float | Mean Arterial Pressure: $\frac{\text{Systolic\_BP} + (2 \times \text{Diastolic\_BP})}{3}$ |

### 3.2 Robust Feature Scaling
Because blood pressure and BMI distributions naturally exhibit clinical skewness and heavy tails, **`RobustScaler`** was employed:
$$x_{\text{scaled}} = \frac{x - Q_2(x)}{Q_3(x) - Q_1(x)}$$
* Fits only on the training set (54,428 samples) to eliminate data leakage.
* Serialized object: `models/robust_scaler.pkl`.

---

## 4. Model Architecture & Training

### 4.1 Neural Network Topology (`notebooks/06_Model_Training_and_Evaluation.ipynb`)
An Artificial Neural Network (ANN) classifier constructed with TensorFlow/Keras:

```python
model = Sequential([
    Input(shape=(14,)),
    
    # Layer 1
    Dense(128, activation="relu"),
    BatchNormalization(),
    Dropout(0.25),
    
    # Layer 2
    Dense(64, activation="relu"),
    BatchNormalization(),
    Dropout(0.25),
    
    # Layer 3
    Dense(32, activation="relu"),
    
    # Output Layer: Continuous Sigmoid Probability Output
    Dense(1, activation="sigmoid")
])
```

### 4.2 Training Hyperparameters
* **Loss Function**: `binary_crossentropy`
  $$\mathcal{L} = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]$$
* **Optimizer**: Adam ($\text{learning\_rate} = 0.0005$)
* **Callbacks**: `EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)`
* **Saved Model Artifact**: `models/heart_disease_ann_final.keras`

---

## 5. Proof of Trained-Data Determinism

1. **Deterministic Propagation**:
   The output probability $P$ is computed strictly from the neural network equation:
   $$\hat{y} = \sigma\left(W_4 \cdot \text{ReLU}\left(W_3 \cdot \text{ReLU}\left(W_2 \cdot \text{ReLU}\left(W_1 \cdot X_{\text{scaled}} + b_1\right) + b_2\right) + b_3\right) + b_4\right)$$
   Where $W_i, b_i$ are learned weights optimized over 68,000 iterations.
2. **No Fallback or Score Heuristics**:
   The `risk_percentage` is calculated exclusively by multiplying the sigmoid output by 100:
   $$\text{risk\_percentage} = \text{round}(\hat{y} \times 100.0, 1)$$
3. **Biological Alignment**:
   A patient with clinical indicators typical of heart disease (elevated blood pressure, high glucose, high cholesterol, obesity) produces coordinates located in the model's high-activation hyperplanes, outputting higher probabilities accordingly.

---

## 6. Backend Inference Engine & Governance

### 6.1 Inference Service
Located at `project/backend/app/services/prediction_service.py`:
- Loads `heart_disease_ann_final.keras` and `robust_scaler.pkl` once at application startup.
- Derives $BMI$, $Pulse\ Pressure$, and $MAP$.
- Discretizes risk:
  - `< 30.0%`: **Low Risk**
  - `30.0% - 59.9%`: **Moderate Risk**
  - `≥ 60.0%`: **High Risk**

### 6.2 Hemodynamic Cross-Field Validation
Hemodynamic markers ($SBP$, $DBP$, $PP$, $MAP$) are the strongest predictors in the model ($r > 0.40$). To prevent physiologically impossible states, `PredictionRequest` enforces strict cross-field validation in Pydantic:
```python
@model_validator(mode='after')
def validate_blood_pressure(self):
    if self.diastolic_bp >= self.systolic_bp:
        raise ValueError(
            "Diastolic blood pressure must be strictly less than systolic blood pressure."
        )
    return self
```
* **Impact**: Immediately rejects zero pulse pressure ($SBP = DBP$) and inverted blood pressure ($DBP > SBP$) with HTTP 422 before reaching the model.

### 6.3 Age Domain Extrapolation Governance
The training cohort is clinically bounded between **29.6 and 65.0 years**. Input queries outside this range represent statistical extrapolations:
1. **Centralized Constants (`app/core/constants.py`)**:
   ```python
   AGE_MIN_TRAINED: float = 30.0  # Conservative clinical threshold (dataset min: 29.6)
   AGE_MAX_TRAINED: float = 65.0  # Dataset max: 65.0
   ```
2. **Directional Notes**: Non-integer ages preserve decimal precision (e.g., `29.9`, `65.1`) to avoid boundary rounding contradictions:
   - Below 30: `"Patient age (29.9 years) is below the validated clinical training cohort (30–65 years)..."`
   - Above 65: `"Patient age (78 years) exceeds the validated clinical training cohort (30–65 years)..."`
3. **Payload Flagging**: Injects `is_extrapolated: true` and `extrapolation_note` into both the live prediction response and MongoDB records.

### 6.4 Strict Categorical Input Validation
To prevent silent fallback corruption (e.g. invalid inputs silently defaulting to "Female" or "Normal"), Pydantic `@field_validator` methods strictly validate and normalize:
* `gender`: Normalized with `.strip().title()` to `["Male", "Female"]`.
* `cholesterol` & `glucose`: Normalized to `["Normal", "Above Normal", "High"]`.
* `smoke`, `alcohol`, `physical_activity`: Normalized to `["Yes", "No"]`.
* Any unexpected value immediately triggers an informative HTTP 422 error.

### 6.5 Recommendation Engine
Located at `project/backend/app/services/recommendation_engine.py`:
* **Out-of-Distribution Handling**: Whenever `is_extrapolated` is `true`, prepends:
  1. An `Assessment Context` insight: `"Out-of-Cohort Model Extrapolation"`.
  2. A top-priority (`Priority: High`, `id: 1`) recommendation: `"Prioritize Direct Clinical Evaluation"` instructing the patient to consult a physician for in-person diagnostics rather than relying solely on the statistical score.
* Generates individualized lifestyle and medical guidance based on BP categories, BMI bands, and lifestyle habits.

### 6.6 Threadpool Execution & MongoDB Persistence
* **Unblocked Event Loop**: `predict_heart_disease` in `project/backend/app/routes/predict.py` is declared as standard `def` (synchronous), allowing FastAPI to run the CPU-bound ANN inference and synchronous PyMongo calls inside external worker threadpools (`anyio.to_thread`).
* **Persistence**: Every completed assessment is saved to MongoDB collection `healthchecks` with input vitals, calculated metrics, extrapolation flags, and model results.

---

## 7. Frontend Presentation Layer

Located at `project/frontend/src/pages/HealthCheck.jsx` & `Dashboard.jsx`:
1. **Interactive Assessment Form**: Captures vitals with live client-side validation.
2. **Real-Time Biomarker Preview**: Automatically computes and displays $BMI$, $Pulse\ Pressure$, and $MAP$ as numbers are entered.
3. **Circular Risk Score Gauge**: Visually presents percentage risk styled with dynamic color gradients.
4. **Amber Clinical Extrapolation Alert**: Prominently renders a warning banner when `result.is_extrapolated` is `true`.
5. **Personalized Recommendations List**: Renders consecutive numbered action cards (`key={rec.id}`) with priority badges.
6. **Patient Health Dashboard**: Fetches historical assessments, tracks metrics over time, and provides full modal inspection of previous checks.

---

## 8. Technology Stack

| Layer | Technologies |
|---|---|
| **Machine Learning** | TensorFlow 2.x, Keras, Scikit-Learn, Pandas, NumPy, Joblib |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, PyMongo, Python-Jose (JWT), Passlib/Bcrypt |
| **Database** | MongoDB (`cardiosense_db` database, `users` and `healthchecks` collections) |
| **Frontend UI** | React 18, Vite, React Router DOM, Axios, Custom CSS Design System |

---

## 9. Project Directory Layout

```
Heart_Disease_Prediction/
├── README.md                           # Master Unified Documentation
├── data/
│   ├── raw_data/cardio_train.csv       # Original dataset (70,000 records)
│   └── processed_data/cleaned_dataset.csv # Cleaned cohort (68,036 records)
├── models/
│   ├── heart_disease_ann_final.keras   # Trained 4-Layer ANN Model
│   └── robust_scaler.pkl               # Fitted 14-Feature RobustScaler
├── notebooks/                          # Jupyter Research & Training Notebooks
│   ├── 01_Data_Loading.ipynb
│   ├── 02_Data_Preprocessing.ipynb
│   ├── 03_Exploratory_Data_Analysis.ipynb
│   ├── 04_Feature_Engineering.ipynb
│   ├── 05_Model_Building.ipynb
│   └── 06_Model_Training_and_Evaluation.ipynb
└── project/
    ├── backend/
    │   ├── app/
    │   │   ├── main.py                 # FastAPI Application Entry
    │   │   ├── core/constants.py       # Clinical bounds & extrapolation logic
    │   │   ├── database/connection.py  # PyMongo client management
    │   │   ├── models/user.py          # User DB models
    │   │   ├── schemas/auth.py         # Authentication schemas
    │   │   ├── schemas/predict.py      # Validation schemas & BP rules
    │   │   ├── routes/auth.py          # Auth endpoints (signup/login/me)
    │   │   ├── routes/predict.py       # Prediction endpoint (POST /api/predict)
    │   │   ├── routes/healthchecks.py  # Historical health assessment endpoints
    │   │   ├── services/auth_service.py # Auth business logic
    │   │   ├── services/prediction_service.py # Scaler + ANN inference engine
    │   │   └── services/recommendation_engine.py # Personalized clinical recommendations
    │   ├── .env                        # MongoDB & JWT configuration
    │   ├── requirements.txt            # Python dependencies
    │   └── venv/                       # Python virtual environment
    │
    └── frontend/
        ├── src/
        │   ├── components/Navbar.jsx   # Responsive navigation
        │   ├── components/Footer.jsx   # Application footer
        │   ├── pages/Home.jsx          # Landing page
        │   ├── pages/Login.jsx         # User login page
        │   ├── pages/Signup.jsx        # Account registration
        │   ├── pages/HealthCheck.jsx   # AI risk assessment & results view
        │   ├── pages/Dashboard.jsx     # Health history & metrics modal
        │   ├── context/AuthContext.jsx # JWT state management
        │   ├── services/api.js         # Axios API client
        │   └── index.css               # Global CSS design tokens & alerts
        ├── package.json
        └── vite.config.js
```

---

## 10. End-to-End Installation & Run Guide

### Prerequisites
- **Python**: Version 3.11.x
- **Node.js**: Version 18.x or higher
- **MongoDB**: Installed and running locally on `localhost:27017`

### Step 1: Start MongoDB
Ensure your local MongoDB daemon is running:
```powershell
# Verify MongoDB service is active
mongod --dbpath <path-to-data-directory>
```

### Step 2: Backend Setup & Execution
```powershell
cd D:\nishanthini\Heart_Disease_Prediction\project\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Backend runs at `http://localhost:8000`. Interactive Swagger API docs are available at `http://localhost:8000/docs`.*

### Step 3: Frontend Setup & Execution
Open a new terminal window:
```powershell
cd D:\nishanthini\Heart_Disease_Prediction\project\frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
*Access the user interface at `http://localhost:5173`.*

---

## 11. API Specification

### `POST /api/predict`
Evaluates cardiovascular risk, calculates derived hemodynamic markers, checks clinical governance bounds, generates recommendations, and stores the record in MongoDB.

#### Request Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Request Payload
```json
{
  "age": 52,
  "gender": "Male",
  "height": 170,
  "weight": 72,
  "systolic_bp": 130,
  "diastolic_bp": 85,
  "cholesterol": "Normal",
  "glucose": "Normal",
  "smoke": "No",
  "alcohol": "No",
  "physical_activity": "Yes"
}
```

#### Response Payload (`200 OK`)
```json
{
  "id": "66e0...",
  "created_at": "2026-09-08T16:45:00Z",
  "risk_probability": 0.3842,
  "risk_percentage": 38.4,
  "risk_level": "Moderate Risk",
  "is_extrapolated": false,
  "extrapolation_note": null,
  "calculated_features": {
    "bmi": 24.91,
    "pulse_pressure": 45.0,
    "map": 100.0
  },
  "insights": [
    {
      "category": "Blood Pressure",
      "title": "Pre-hypertension Range",
      "description": "Your blood pressure reading (130/85 mmHg) borders above optimal ranges...",
      "impact": "Attention"
    }
  ],
  "recommendations": [
    {
      "id": 1,
      "title": "Implement Regular Blood Pressure Tracking",
      "description": "Monitor your blood pressure 2-3 times per week...",
      "category": "Blood Pressure",
      "priority": "Medium"
    }
  ]
}
```

#### Out-of-Cohort Extrapolation Response Example (`age = 78`)
When `age < 30` or `age > 65`:
```json
{
  "risk_percentage": 64.6,
  "risk_level": "High Risk",
  "is_extrapolated": true,
  "extrapolation_note": "Patient age (78 years) exceeds the validated clinical training cohort (30–65 years). Prediction represents an out-of-distribution extrapolation and should be evaluated with added clinical discretion.",
  "insights": [
    {
      "category": "Assessment Context",
      "title": "Out-of-Cohort Model Extrapolation",
      "impact": "Attention"
    }
  ],
  "recommendations": [
    {
      "id": 1,
      "priority": "High",
      "category": "Clinical Guidance",
      "title": "Prioritize Direct Clinical Evaluation",
      "description": "Because your age falls outside the core model training cohort (30–65 years), prioritize comprehensive diagnostic screening..."
    }
  ]
}
```

---

## 12. License & Medical Disclaimer

This software is designed for educational, research, and preventive wellness monitoring purposes. The risk scores and recommendations generated by the platform are model-based statistical estimates and do not constitute formal medical diagnoses. Patients should consult qualified healthcare practitioners for medical advice and clinical decisions.
