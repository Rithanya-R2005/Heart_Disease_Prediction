import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { healthAPI } from '../services/api';

const HealthCheck = () => {
  // Form State
  const [formData, setFormData] = useState({
    age: '52',
    gender: 'Male',
    height: '170',
    weight: '72',
    systolic_bp: '130',
    diastolic_bp: '85',
    cholesterol: 'Normal',
    glucose: 'Normal',
    smoke: 'No',
    alcohol: 'No',
    physical_activity: 'Yes',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);

  // Real-time automatic derived feature calculations
  const calculated = useMemo(() => {
    const heightNum = parseFloat(formData.height);
    const weightNum = parseFloat(formData.weight);
    const sysNum = parseFloat(formData.systolic_bp);
    const diaNum = parseFloat(formData.diastolic_bp);

    let bmi = null;
    let bmiCategory = '';
    if (heightNum > 0 && weightNum > 0) {
      const heightM = heightNum / 100;
      bmi = (weightNum / (heightM * heightM)).toFixed(2);
      const bmiVal = parseFloat(bmi);
      if (bmiVal < 18.5) bmiCategory = 'Underweight';
      else if (bmiVal < 25) bmiCategory = 'Normal weight';
      else if (bmiVal < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }

    let pulsePressure = null;
    if (!isNaN(sysNum) && !isNaN(diaNum)) {
      pulsePressure = (sysNum - diaNum).toFixed(0);
    }

    let mapVal = null;
    if (!isNaN(sysNum) && !isNaN(diaNum)) {
      mapVal = ((sysNum + 2 * diaNum) / 3).toFixed(1);
    }

    return {
      bmi: bmi || '--',
      bmiCategory,
      pulsePressure: pulsePressure !== null ? pulsePressure : '--',
      map: mapVal || '--',
    };
  }, [formData.height, formData.weight, formData.systolic_bp, formData.diastolic_bp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear inline error when user modifies field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError(null);
  };

  const validate = () => {
    const newErrors = {};

    const ageNum = parseFloat(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      newErrors.age = 'Please enter a valid age between 1 and 120 years.';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select a gender.';
    }

    const heightNum = parseFloat(formData.height);
    if (!formData.height || isNaN(heightNum) || heightNum < 50 || heightNum > 250) {
      newErrors.height = 'Please enter a valid height between 50 and 250 cm.';
    }

    const weightNum = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      newErrors.weight = 'Please enter a valid weight between 20 and 300 kg.';
    }

    const sysNum = parseFloat(formData.systolic_bp);
    if (!formData.systolic_bp || isNaN(sysNum) || sysNum < 60 || sysNum > 260) {
      newErrors.systolic_bp = 'Please enter a valid Systolic BP between 60 and 260 mmHg.';
    }

    const diaNum = parseFloat(formData.diastolic_bp);
    if (!formData.diastolic_bp || isNaN(diaNum) || diaNum < 40 || diaNum > 180) {
      newErrors.diastolic_bp = 'Please enter a valid Diastolic BP between 40 and 180 mmHg.';
    } else if (!isNaN(sysNum) && diaNum >= sysNum) {
      newErrors.diastolic_bp = 'Diastolic BP must be less than Systolic BP.';
    }

    if (!formData.cholesterol) newErrors.cholesterol = 'Please select cholesterol status.';
    if (!formData.glucose) newErrors.glucose = 'Please select glucose status.';
    if (!formData.smoke) newErrors.smoke = 'Please select smoking status.';
    if (!formData.alcohol) newErrors.alcohol = 'Please select alcohol status.';
    if (!formData.physical_activity) newErrors.physical_activity = 'Please select physical activity status.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const payload = {
      age: parseFloat(formData.age),
      gender: formData.gender,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      systolic_bp: parseFloat(formData.systolic_bp),
      diastolic_bp: parseFloat(formData.diastolic_bp),
      cholesterol: formData.cholesterol,
      glucose: formData.glucose,
      smoke: formData.smoke,
      alcohol: formData.alcohol,
      physical_activity: formData.physical_activity,
    };

    try {
      const data = await healthAPI.predictHeartDisease(payload);
      setResult(data);
      // Scroll to top of results smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Prediction API Error:', err);
      const msg =
        err.response?.data?.detail ||
        'Unable to complete the health analysis. Please check your connection and try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setApiError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="healthcheck-page">
      <Navbar />

      <main className="container healthcheck-container fade-in">
        {/* Header Section */}
        <div className="healthcheck-header">
          <div className="healthcheck-icon-badge">AI</div>
          <h1>HealthCheck AI Assessment</h1>
        </div>

        {apiError && (
          <div className="alert-banner alert-danger">
            <span className="alert-icon">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* -------------------------------------------------------------
            STATE 1: RESULT VIEW (Displayed when backend prediction completes)
           ------------------------------------------------------------- */}
        {result ? (
          <div className="healthcheck-result-section fade-in">
            {/* Main Risk Overview Banner */}
            <div className={`result-overview-card risk-${result.risk_level.toLowerCase().replace(' ', '-')}`}>
              <div className="result-overview-header">
                <h2>Health Assessment Result</h2>
                <span className="model-tag">ANN Model Output</span>
              </div>

              <div className="risk-score-display">
                <div className="risk-percentage-circle">
                  <span className="risk-number">{result.risk_percentage}%</span>
                  <span className="risk-label">Estimated Risk</span>
                </div>
                <div className="risk-level-badge">
                  <span className="risk-badge-text">{result.risk_level.toUpperCase()}</span>
                </div>
              </div>

              <p className="risk-overview-note">
                Based on your submitted health indicators, our trained neural network model estimates a{' '}
                <strong>{result.risk_percentage}%</strong> probability of heart disease risk factors.
              </p>
            </div>

            {/* Calculated Metrics Summary */}
            <div className="calculated-summary-bar">
              <div className="metric-pill">
                <span className="metric-label">Calculated BMI</span>
                <span className="metric-value">{result.calculated_features.bmi} kg/m²</span>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Pulse Pressure</span>
                <span className="metric-value">{result.calculated_features.pulse_pressure} mmHg</span>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Mean Arterial Pressure (MAP)</span>
                <span className="metric-value">{result.calculated_features.map} mmHg</span>
              </div>
            </div>

            {/* Personalized Health Insights Section */}
            <section className="result-block">
              <h3 className="section-title">Personalized Health Insights</h3>
              <div className="insights-grid">
                {result.insights.map((insight, idx) => (
                  <div key={idx} className={`insight-card impact-${insight.impact.toLowerCase().replace(' ', '-')}`}>
                    <div className="insight-card-header">
                      <span className="insight-category">{insight.category}</span>
                      <span className={`impact-badge impact-${insight.impact.toLowerCase().replace(' ', '-')}`}>
                        {insight.impact}
                      </span>
                    </div>
                    <h4 className="insight-title">{insight.title}</h4>
                    <p className="insight-description">{insight.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended Actions Section */}
            <section className="result-block">
              <h3 className="section-title">Personalized Recommendations</h3>
              <div className="recommendations-list">
                {result.recommendations.map((rec) => (
                  <div key={rec.id} className="recommendation-item">
                    <div className="rec-number">{rec.id}</div>
                    <div className="rec-content">
                      <div className="rec-header">
                        <h4>{rec.title}</h4>
                        <span className={`priority-tag priority-${rec.priority.toLowerCase()}`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                      <p>{rec.description}</p>
                      <span className="rec-category-tag">{rec.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Important Medical Disclaimer */}
            <div className="medical-disclaimer-card">
              <div className="disclaimer-header">
                <span className="disclaimer-icon">ℹ️</span>
                <strong>Important Note</strong>
              </div>
              <p>
                This result is a model-based risk estimate generated by an Artificial Neural Network and is not a medical diagnosis. Consult a qualified healthcare professional for medical advice, diagnosis, or treatment decisions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="result-actions">
              <button type="button" onClick={handleReset} className="btn btn-primary btn-lg">
                Perform Another Assessment
              </button>
            </div>
          </div>
        ) : (
          /* -------------------------------------------------------------
             STATE 2: ASSESSMENT FORM VIEW
             ------------------------------------------------------------- */
          <form onSubmit={handleSubmit} className="healthcheck-form card shadow-lg">
            {/* Section 1: Personal Information */}
            <div className="form-section">
              <div className="section-header-block">
                <span className="section-step">1</span>
                <div>
                  <h2 className="section-heading">Personal Information</h2>
                  <p className="section-subtext">Demographic details for model calibration</p>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="age">Age (Years) <span className="required">*</span></label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 52"
                    min="1"
                    max="120"
                    className={`form-input ${errors.age ? 'input-error' : ''}`}
                  />
                  {errors.age && <span className="field-error">{errors.age}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender <span className="required">*</span></label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`form-input ${errors.gender ? 'input-error' : ''}`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && <span className="field-error">{errors.gender}</span>}
                </div>
              </div>
            </div>

            {/* Section 2: Body Measurements */}
            <div className="form-section">
              <div className="section-header-block">
                <span className="section-step">2</span>
                <div>
                  <h2 className="section-heading">Body Measurements</h2>
                  <p className="section-subtext">Height and weight to calculate BMI automatically</p>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label htmlFor="height">Height (cm) <span className="required">*</span></label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g. 170"
                    min="50"
                    max="250"
                    className={`form-input ${errors.height ? 'input-error' : ''}`}
                  />
                  {errors.height && <span className="field-error">{errors.height}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Weight (kg) <span className="required">*</span></label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 72"
                    min="20"
                    max="300"
                    className={`form-input ${errors.weight ? 'input-error' : ''}`}
                  />
                  {errors.weight && <span className="field-error">{errors.weight}</span>}
                </div>

                <div className="form-group calculated-group">
                  <label>Calculated BMI (Auto)</label>
                  <div className="read-only-display">
                    <span className="calc-val">{calculated.bmi}</span>
                    {calculated.bmiCategory && (
                      <span className="calc-badge">{calculated.bmiCategory}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Blood Pressure */}
            <div className="form-section">
              <div className="section-header-block">
                <span className="section-step">3</span>
                <div>
                  <h2 className="section-heading">Blood Pressure</h2>
                  <p className="section-subtext">Systolic and diastolic readings</p>
                </div>
              </div>

              <div className="form-grid-4">
                <div className="form-group">
                  <label htmlFor="systolic_bp">Systolic BP (mmHg) <span className="required">*</span></label>
                  <input
                    type="number"
                    id="systolic_bp"
                    name="systolic_bp"
                    value={formData.systolic_bp}
                    onChange={handleChange}
                    placeholder="e.g. 130"
                    className={`form-input ${errors.systolic_bp ? 'input-error' : ''}`}
                  />
                  {errors.systolic_bp && <span className="field-error">{errors.systolic_bp}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="diastolic_bp">Diastolic BP (mmHg) <span className="required">*</span></label>
                  <input
                    type="number"
                    id="diastolic_bp"
                    name="diastolic_bp"
                    value={formData.diastolic_bp}
                    onChange={handleChange}
                    placeholder="e.g. 85"
                    className={`form-input ${errors.diastolic_bp ? 'input-error' : ''}`}
                  />
                  {errors.diastolic_bp && <span className="field-error">{errors.diastolic_bp}</span>}
                </div>

                <div className="form-group calculated-group">
                  <label>Pulse Pressure (Auto)</label>
                  <div className="read-only-display">
                    <span className="calc-val">{calculated.pulsePressure}</span>
                    <span className="calc-unit">mmHg</span>
                  </div>
                </div>

                <div className="form-group calculated-group">
                  <label>MAP (Auto)</label>
                  <div className="read-only-display">
                    <span className="calc-val">{calculated.map}</span>
                    <span className="calc-unit">mmHg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Health Factors */}
            <div className="form-section">
              <div className="section-header-block">
                <span className="section-step">4</span>
                <div>
                  <h2 className="section-heading">Health & Lifestyle Factors</h2>
                  <p className="section-subtext">Metabolic levels and daily lifestyle choices</p>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="cholesterol">Cholesterol Level <span className="required">*</span></label>
                  <select
                    id="cholesterol"
                    name="cholesterol"
                    value={formData.cholesterol}
                    onChange={handleChange}
                    className={`form-input ${errors.cholesterol ? 'input-error' : ''}`}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Above Normal">Above Normal</option>
                    <option value="High">High</option>
                  </select>
                  {errors.cholesterol && <span className="field-error">{errors.cholesterol}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="glucose">Glucose Level <span className="required">*</span></label>
                  <select
                    id="glucose"
                    name="glucose"
                    value={formData.glucose}
                    onChange={handleChange}
                    className={`form-input ${errors.glucose ? 'input-error' : ''}`}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Above Normal">Above Normal</option>
                    <option value="High">High</option>
                  </select>
                  {errors.glucose && <span className="field-error">{errors.glucose}</span>}
                </div>
              </div>

              <div className="form-grid-3 lifestyle-grid">
                <div className="form-group">
                  <label>Smoking Status <span className="required">*</span></label>
                  <div className="segmented-control">
                    <button
                      type="button"
                      className={`segment-btn ${formData.smoke === 'No' ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, smoke: 'No' }))}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${formData.smoke === 'Yes' ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, smoke: 'Yes' }))}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Alcohol Consumption <span className="required">*</span></label>
                  <div className="segmented-control">
                    <button
                      type="button"
                      className={`segment-btn ${formData.alcohol === 'No' ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, alcohol: 'No' }))}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${formData.alcohol === 'Yes' ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, alcohol: 'Yes' }))}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Physical Activity <span className="required">*</span></label>
                  <div className="segmented-control">
                    <button
                      type="button"
                      className={`segment-btn ${formData.physical_activity === 'Yes' ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, physical_activity: 'Yes' }))}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${formData.physical_activity === 'No' ? 'active' : ''}`}
                      onClick={() => setFormData((prev) => ({ ...prev, physical_activity: 'No' }))}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Submit Footer */}
            <div className="form-submit-footer">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-submit-predict"
              >
                {loading ? (
                  <>
                    <span className="spinner-sm"></span>
                    Analyzing your health information...
                  </>
                ) : (
                  'Analyze My Heart Health'
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HealthCheck;
