import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { healthAPI } from '../services/api';

// Helper to format ISO date strings into exact IST (Asia/Kolkata) date/time
const formatDate = (isoString, includeTime = true) => {
  if (!isoString) return '--';
  let str = String(isoString).trim();
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    str += 'Z';
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return isoString;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const parts = formatter.formatToParts(date);
  const partMap = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  if (!includeTime) {
    return `${partMap.day} ${partMap.month} ${partMap.year}`;
  }

  return `${partMap.day} ${partMap.month} ${partMap.year} • ${partMap.hour}:${partMap.minute}:${partMap.second} ${partMap.dayPeriod}`;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await healthAPI.getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load healthcheck history:', err);
      setError('Unable to load your health data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Latest HealthCheck is the first item in the history array (sorted newest first by backend)
  const latestCheck = useMemo(() => {
    return history.length > 0 ? history[0] : null;
  }, [history]);

  // Extract key focus area for history table row
  const getFocusArea = (recList) => {
    if (!recList || recList.length === 0) return 'General Wellness';
    const topRec = recList[0];
    return topRec.category || topRec.title || 'General';
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="container dashboard-container fade-in">
        {/* ============================================================
            LOADING STATE
           ============================================================ */}
        {loading && (
          <div className="dashboard-state-box card">
            <div className="spinner"></div>
            <h3>Loading your health dashboard...</h3>
            <p>Gathering your neural network heart health assessments.</p>
          </div>
        )}

        {/* ============================================================
            ERROR STATE
           ============================================================ */}
        {!loading && error && (
          <div className="dashboard-state-box card error-state">
            <h3>Unable to Load Dashboard</h3>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="btn btn-primary">
              Retry Loading Data
            </button>
          </div>
        )}

        {/* ============================================================
            EMPTY DASHBOARD STATE (No HealthChecks yet)
           ============================================================ */}
        {!loading && !error && history.length === 0 && (
          <div className="dashboard-empty-state">
            <div className="welcome-banner card">
              <div className="welcome-text">
                <h1>Welcome, {user?.name || 'User'}</h1>
                <p>You haven't completed a HealthCheck yet.</p>
                <p className="subtext">
                  Start your first assessment to view your estimated heart health risk and personalized recommendations.
                </p>
                <button
                  onClick={() => navigate('/healthcheck')}
                  className="btn btn-primary btn-lg mt-4"
                >
                  Analyze My Heart Health
                </button>
              </div>
            </div>

            <div className="empty-info-grid mt-4">
              <div className="card feature-card">
                <h3>ANN Risk Estimate</h3>
                <p>Evaluate key heart markers using our trained Artificial Neural Network.</p>
              </div>

              <div className="card feature-card">
                <h3>Personalized Recommendations</h3>
                <p>Receive actionable guidance for blood pressure, BMI, and lifestyle choices.</p>
              </div>

              <div className="card feature-card">
                <h3>Health History Tracking</h3>
                <p>Monitor your model-estimated risk over time with ease.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            FULL DASHBOARD CONTENT (When HealthChecks exist)
           ============================================================ */}
        {!loading && !error && history.length > 0 && latestCheck && (
          <div className="dashboard-main-content">
            {/* 1. WELCOME SECTION */}
            <div className="dashboard-header-block">
              <div>
                <h1 className="user-welcome-title">Welcome, {user?.name || 'User'}</h1>
                <p className="header-subtitle">Here's a summary of your recent heart health assessments.</p>
              </div>
              <div className="last-checked-pill">
                <span>Last HealthCheck: {formatDate(latestCheck.created_at)}</span>
              </div>
            </div>

            {/* 2. LATEST HEALTHCHECK — MAIN HERO CARD */}
            <section className="latest-risk-hero-card card shadow-lg">
              <div className="risk-hero-badge-tag">LATEST HEALTHCHECK</div>
              <div className="risk-hero-body">
                <div className="risk-hero-info">
                  <h2 className="risk-hero-title">Model-Based Risk Estimate</h2>
                  <div className="risk-level-tag-container mt-2">
                    <span
                      className={`risk-level-badge risk-badge-${latestCheck.risk_level
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {latestCheck.risk_level.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="risk-score-giant-circle">
                  <div className="giant-number">{latestCheck.risk_percentage}%</div>
                  <div className="giant-label">Estimated Risk</div>
                </div>
              </div>

              <div className="risk-hero-actions">
                <button
                  onClick={() => navigate('/healthcheck')}
                  className="btn btn-primary btn-lg"
                >
                  Analyze My Heart Health
                </button>
              </div>
            </section>

            {/* 3. AREAS TO IMPROVE */}
            {latestCheck.recommendations && latestCheck.recommendations.length > 0 && (
              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Areas to Improve</h2>
                  <p className="section-desc">
                    Personalized priorities identified during your latest assessment.
                  </p>
                </div>

                <div className="areas-improve-grid">
                  {latestCheck.recommendations.slice(0, 6).map((rec, index) => (
                    <div key={index} className="card improve-card">
                      <div className="improve-card-top">
                        <span className="improve-category-pill">{rec.category || 'Focus Area'}</span>
                        <span className={`priority-indicator priority-${(rec.priority || 'medium').toLowerCase()}`}>
                          {rec.priority || 'Medium'} Priority
                        </span>
                      </div>
                      <h4 className="improve-title">{rec.title}</h4>
                      <p className="improve-description">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. LATEST HEALTH METRICS */}
            {latestCheck.input_data && (
              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Latest Health Metrics</h2>
                  <p className="section-desc">Key indicators captured during your latest HealthCheck.</p>
                </div>

                <div className="metrics-grid">
                  <div className="card metric-card">
                    <div className="metric-header">
                      <span className="metric-name">BMI</span>
                    </div>
                    <div className="metric-value-display">
                      {latestCheck.calculated_features?.bmi || '--'} <span className="unit">kg/m²</span>
                    </div>
                    <div className="metric-footer">Height: {latestCheck.input_data.height} cm • Weight: {latestCheck.input_data.weight} kg</div>
                  </div>

                  <div className="card metric-card">
                    <div className="metric-header">
                      <span className="metric-name">Blood Pressure</span>
                    </div>
                    <div className="metric-value-display">
                      {latestCheck.input_data.systolic_bp} / {latestCheck.input_data.diastolic_bp} <span className="unit">mmHg</span>
                    </div>
                    <div className="metric-footer">MAP: {latestCheck.calculated_features?.map || '--'} mmHg</div>
                  </div>

                  <div className="card metric-card">
                    <div className="metric-header">
                      <span className="metric-name">Cholesterol</span>
                    </div>
                    <div className="metric-value-display">
                      {latestCheck.input_data.cholesterol}
                    </div>
                    <div className="metric-footer">Metabolic marker</div>
                  </div>

                  <div className="card metric-card">
                    <div className="metric-header">
                      <span className="metric-name">Glucose</span>
                    </div>
                    <div className="metric-value-display">
                      {latestCheck.input_data.glucose}
                    </div>
                    <div className="metric-footer">Blood sugar indicator</div>
                  </div>

                  <div className="card metric-card">
                    <div className="metric-header">
                      <span className="metric-name">Physical Activity</span>
                    </div>
                    <div className="metric-value-display">
                      {latestCheck.input_data.physical_activity === 'Yes' ? 'Active' : 'Low Activity'}
                    </div>
                    <div className="metric-footer">Routine daily exercise</div>
                  </div>
                </div>
              </section>
            )}

            {/* 5. HEALTHCHECK HISTORY */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2>HealthCheck History</h2>
                <p className="section-desc">
                  Complete record of your past evaluations. Click any item to open full details.
                </p>
              </div>

              <div className="card history-table-card">
                <div className="table-responsive">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Risk %</th>
                        <th>Level</th>
                        <th>Focus Area</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record) => (
                        <tr
                          key={record.id}
                          className="history-row"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <td className="row-date">{formatDate(record.created_at)}</td>
                          <td className="row-risk font-weight-bold">
                            {record.risk_percentage}%
                          </td>
                          <td>
                            <span
                              className={`status-pill status-${record.risk_level
                                .toLowerCase()
                                .replace(/\s+/g, '-')}`}
                            >
                              {record.risk_level}
                            </span>
                          </td>
                          <td className="row-focus">{getFocusArea(record.recommendations)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-link-action"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(record);
                              }}
                            >
                              View Result
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================
            PREVIOUS HEALTHCHECK DETAIL MODAL
           ============================================================ */}
        {selectedRecord && (
          <div className="modal-backdrop fade-in" onClick={() => setSelectedRecord(null)}>
            <div className="modal-content card shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <span className="modal-badge">HealthCheck Detail</span>
                  <h3>{formatDate(selectedRecord.created_at)}</h3>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setSelectedRecord(null)}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <div className="modal-body">
                {/* Risk overview banner */}
                <div className="modal-risk-banner">
                  <div className="modal-risk-score">
                    <span className="score-num">{selectedRecord.risk_percentage}%</span>
                    <span className="score-lbl">Estimated Risk</span>
                  </div>
                  <div className="modal-risk-meta">
                    <span
                      className={`risk-level-badge risk-badge-${selectedRecord.risk_level
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {selectedRecord.risk_level.toUpperCase()}
                    </span>
                    <p className="modal-risk-note">Model-based probability estimate</p>
                  </div>
                </div>

                {/* Input Health Metrics */}
                {selectedRecord.input_data && (
                  <div className="modal-section">
                    <h4>Health Metrics Recorded</h4>
                    <div className="modal-metrics-grid">
                      <div className="modal-metric-item">
                        <span className="lbl">Age:</span> <span className="val">{selectedRecord.input_data.age} years</span>
                      </div>
                      <div className="modal-metric-item">
                        <span className="lbl">Gender:</span> <span className="val">{selectedRecord.input_data.gender}</span>
                      </div>
                      <div className="modal-metric-item">
                        <span className="lbl">Height / Weight:</span> <span className="val">{selectedRecord.input_data.height} cm / {selectedRecord.input_data.weight} kg</span>
                      </div>
                      <div className="modal-metric-item">
                        <span className="lbl">Blood Pressure:</span> <span className="val">{selectedRecord.input_data.systolic_bp} / {selectedRecord.input_data.diastolic_bp} mmHg</span>
                      </div>
                      <div className="modal-metric-item">
                        <span className="lbl">Cholesterol:</span> <span className="val">{selectedRecord.input_data.cholesterol}</span>
                      </div>
                      <div className="modal-metric-item">
                        <span className="lbl">Glucose:</span> <span className="val">{selectedRecord.input_data.glucose}</span>
                      </div>
                      <div className="modal-metric-item">
                        <span className="lbl">Physical Activity:</span> <span className="val">{selectedRecord.input_data.physical_activity}</span>
                      </div>
                      <div className="modal-metric-item">
                        <span className="lbl">Smoking / Alcohol:</span> <span className="val">{selectedRecord.input_data.smoke} / {selectedRecord.input_data.alcohol}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calculated Features */}
                {selectedRecord.calculated_features && (
                  <div className="modal-section">
                    <h4>Calculated Features</h4>
                    <div className="calculated-summary-bar">
                      <div className="metric-pill">
                        <span className="metric-label">BMI</span>
                        <span className="metric-value">{selectedRecord.calculated_features.bmi} kg/m²</span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-label">Pulse Pressure</span>
                        <span className="metric-value">{selectedRecord.calculated_features.pulse_pressure} mmHg</span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-label">MAP</span>
                        <span className="metric-value">{selectedRecord.calculated_features.map} mmHg</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights */}
                {selectedRecord.insights && selectedRecord.insights.length > 0 && (
                  <div className="modal-section">
                    <h4>Personalized Insights</h4>
                    <div className="modal-insights-list">
                      {selectedRecord.insights.map((insight, idx) => (
                        <div key={idx} className="modal-insight-card">
                          <div className="insight-card-header">
                            <span className="insight-category">{insight.category}</span>
                            <span className={`impact-badge impact-${insight.impact?.toLowerCase().replace(/\s+/g, '-')}`}>
                              {insight.impact}
                            </span>
                          </div>
                          <strong>{insight.title}</strong>
                          <p>{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedRecord.recommendations && selectedRecord.recommendations.length > 0 && (
                  <div className="modal-section">
                    <h4>Recommended Actions</h4>
                    <div className="modal-recs-list">
                      {selectedRecord.recommendations.map((rec, idx) => (
                        <div key={idx} className="modal-rec-item">
                          <span className={`priority-tag priority-${(rec.priority || 'medium').toLowerCase()}`}>
                            {rec.priority || 'Medium'} Priority
                          </span>
                          <strong>{rec.title}</strong>
                          <p>{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecord(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedRecord(null);
                    navigate('/healthcheck');
                  }}
                >
                  Analyze My Heart Health Again
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
