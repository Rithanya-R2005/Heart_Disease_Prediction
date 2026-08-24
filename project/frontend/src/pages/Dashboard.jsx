import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="container dashboard-container fade-in">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p>Your CardioSense Dashboard</p>
        </div>

        <div className="dashboard-content">
          <div className="card dashboard-card">
            <div className="card-icon-label">Heart</div>
            <h3>Heart Health Monitoring</h3>
            <p>Coming soon — Monitor your cardiovascular health metrics</p>
          </div>

          <div className="card dashboard-card">
            <div className="card-icon-label">AI</div>
            <h3>AI Risk Prediction</h3>
            <p>Coming soon — AI-powered heart disease risk assessment</p>
          </div>

          <div className="card dashboard-card">
            <div className="card-icon-label">Wearable</div>
            <h3>Wearable Integration</h3>
            <p>Coming soon — Connect your wearable health devices</p>
          </div>

          <div className="card dashboard-card">
            <div className="card-icon-label">Analytics</div>
            <h3>Health Analytics</h3>
            <p>Coming soon — Detailed health insights and reports</p>
          </div>
        </div>

        <div className="card info-card">
          <h3>Under Development</h3>
          <p>
            This dashboard is currently being developed. In future updates, you will be able to:
          </p>
          <ul>
            <li>View your heart health metrics</li>
            <li>Get AI-powered risk predictions</li>
            <li>Connect wearable devices</li>
            <li>Track health trends over time</li>
            <li>Receive personalized health recommendations</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
