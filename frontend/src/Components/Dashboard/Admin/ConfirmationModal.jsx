import React from 'react';
import { FaTimes, FaExclamationTriangle, FaCheck, FaTrash } from 'react-icons/fa';

const ConfirmationModal = ({ title, message, onConfirm, onCancel, type = 'delete' }) => {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <FaTrash />;
      case 'warning':
        return <FaExclamationTriangle />;
      default:
        return <FaExclamationTriangle />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'delete':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      default:
        return 'btn-danger';
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <div className="confirmation-content">
          <div className="confirmation-icon">
            {getIcon()}
          </div>
          
          <div className="confirmation-message">
            <p>{message}</p>
          </div>

          <div className="confirmation-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn ${getButtonClass()}`}
              onClick={onConfirm}
            >
              <FaCheck /> Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 