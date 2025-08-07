import React from 'react';
import { useAuth } from '../context/AuthContext';

const DebugClear = () => {
  const { clearAllData } = useAuth();

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This will log you out.')) {
      clearAllData();
    }
  };

  // Only show in development or when needed
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: 'red',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px'
    }}>
      <button 
        onClick={handleClear}
        style={{
          background: 'darkred',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Clear All Data
      </button>
    </div>
  );
};

export default DebugClear;
