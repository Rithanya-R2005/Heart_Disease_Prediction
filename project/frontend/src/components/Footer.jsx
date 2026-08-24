import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>CardioSense</h3>
          <p>AI-Powered Heart Health Monitoring</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/healthcheck">HealthCheck AI</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>cardiosense@gmail.com</p>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 CardioSense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
