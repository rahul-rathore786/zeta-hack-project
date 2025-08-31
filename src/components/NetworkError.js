import React from "react";
import "../styles/NetworkError.css";


const NetworkError = ({ networkError, onSwitchNetwork, onAddNetwork }) => {
  return (
    <div className="network-error-container">
      <div className="network-error-card">
        <div className="network-error-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="network-error-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <h2>Network Error</h2>
        </div>

        <div className="network-error-content">
          <p>
            This application requires the <strong>Zeta Testnet</strong> to function properly.
          </p>
          <div className="network-details">
            <div className="network-detail-item">
              <span>Current Network:</span>
              <span className="network-value">
                {networkError.currentNetwork || "Unknown"}
              </span>
            </div>
            <div className="network-detail-item">
              <span>Required Network:</span>
              <span className="network-value">Zeta Testnet</span>
            </div>
          </div>
        </div>

        <div className="network-error-actions">
          <button onClick={onSwitchNetwork} className="switch-network-btn">
            Switch to Testnet
          </button>
          <button onClick={onAddNetwork} className="add-network-btn">
            Add Testnet to Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkError;
