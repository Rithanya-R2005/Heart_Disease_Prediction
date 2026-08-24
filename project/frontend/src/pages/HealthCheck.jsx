import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HealthCheck = () => {
  return (
    <div className="healthcheck-page">
      <Navbar />

      <div className="container healthcheck-container fade-in">
        <div className="card healthcheck-card">
          <div className="healthcheck-header">
            <div className="healthcheck-icon-badge">AI</div>
            <h1>HealthCheck AI</h1>
            <p className="healthcheck-subtitle">AI-Powered Heart Disease Prediction</p>
          </div>

          <div className="healthcheck-content">
            <div className="info-section">
              <h2>Coming Soon</h2>
              <p>
                Our AI-powered heart health prediction system is currently under development.
              </p>
            </div>

            <div className="features-list">
              <h3>Planned Features</h3>
              <ul>
                <li>Real-time heart rate analysis</li>
                <li>ECG data processing</li>
                <li>Deep learning-based risk prediction</li>
                <li>Wearable device integration</li>
                <li>Health trend tracking</li>
                <li>Smart health alerts</li>
                <li>Personalized recommendations</li>
              </ul>
            </div>

            <div className="note-section">
              <h3>Note</h3>
              <p>
                This module will use advanced machine learning models to analyze your health data
                and provide accurate heart disease risk predictions. The system will integrate with
                popular wearable devices and use state-of-the-art deep learning algorithms.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HealthCheck;
