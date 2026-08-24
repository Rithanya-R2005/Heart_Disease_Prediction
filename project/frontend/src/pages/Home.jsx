import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();

  return (
    <div className="home-page">
      <Navbar />

      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text fade-in">
            <h1 className="hero-title">CardioSense</h1>
            <h2 className="hero-subtitle">AI-Powered Heart Health Monitoring</h2>
            <p className="hero-description">
              Monitor your heart. Understand your health. Detect risk earlier.
            </p>
            <div className="hero-buttons">
              {authenticated ? (
                <Link to="/healthcheck" className="btn btn-primary">
                  Start HealthCheck AI
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Get Started
                </Link>
              )}
              <Link to="/healthcheck" className="btn btn-secondary">
                Explore HealthCheck AI
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why CardioSense?</h2>
          <p className="section-subtitle">
            Advanced AI technology meets cardiovascular health monitoring
          </p>

          <div className="features-grid">
            <div className="card feature-card">
              <div className="feature-icon-wrap">
                <span className="feature-icon-label">Heart</span>
              </div>
              <h3>Heart Health Monitoring</h3>
              <p>Continuous monitoring of cardiovascular health metrics using advanced algorithms</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon-wrap">
                <span className="feature-icon-label">AI</span>
              </div>
              <h3>AI Risk Prediction</h3>
              <p>Machine learning models analyze patterns to predict potential heart disease risks</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon-wrap">
                <span className="feature-icon-label">Data</span>
              </div>
              <h3>Wearable Data Analysis</h3>
              <p>Integration with wearable devices for real-time health data collection</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon-wrap">
                <span className="feature-icon-label">Analytics</span>
              </div>
              <h3>Health Insights</h3>
              <p>Detailed analytics and personalized insights about your heart health</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon-wrap">
                <span className="feature-icon-label">24/7</span>
              </div>
              <h3>Continuous Monitoring</h3>
              <p>24/7 health tracking with intelligent alert systems for critical changes</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon-wrap">
                <span className="feature-icon-label">Alert</span>
              </div>
              <h3>Early Risk Awareness</h3>
              <p>Early detection of potential health issues before they become serious</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up and set up your health profile</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Connect Devices</h3>
              <p>Link your wearable health devices</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>AI Analysis</h3>
              <p>Our AI analyzes your health data</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Get Insights</h3>
              <p>Receive personalized health recommendations</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-content">
          <h2>Ready to Take Control of Your Heart Health?</h2>
          <p>Join thousands of users monitoring their cardiovascular health with AI-powered insights</p>
          <Link to={authenticated ? '/healthcheck' : '/login'} className="btn btn-white">
            Start Your Journey
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
