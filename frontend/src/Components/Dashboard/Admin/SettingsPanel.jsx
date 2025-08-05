import React, { useState } from 'react';
import { FaCog, FaSave, FaDatabase, FaShieldAlt, FaBell, FaEnvelope, FaPalette } from 'react-icons/fa';

const SettingsPanel = ({ settings = {}, onUpdateSettings }) => {
  const [currentSettings, setCurrentSettings] = useState({
    systemName: 'FEMS',
    emailNotifications: true,
    pushNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    maxFileSize: 10,
    sessionTimeout: 30,
    theme: 'light',
    language: 'en',
    ...settings
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (key, value) => {
    setCurrentSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    if (onUpdateSettings) {
      onUpdateSettings(currentSettings);
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h4><FaCog /> General Settings</h4>
      
      <div className="setting-item">
        <label>System Name</label>
        <input
          type="text"
          value={currentSettings.systemName}
          onChange={(e) => handleSettingChange('systemName', e.target.value)}
        />
      </div>

      <div className="setting-item">
        <label>Session Timeout (minutes)</label>
        <input
          type="number"
          value={currentSettings.sessionTimeout}
          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
          min="5"
          max="120"
        />
      </div>

      <div className="setting-item">
        <label>Max File Upload Size (MB)</label>
        <input
          type="number"
          value={currentSettings.maxFileSize}
          onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
          min="1"
          max="100"
        />
      </div>

      <div className="setting-item">
        <label>Language</label>
        <select
          value={currentSettings.language}
          onChange={(e) => handleSettingChange('language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h4><FaBell /> Notification Settings</h4>
      
      <div className="setting-item">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={currentSettings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
          />
          <span>Email Notifications</span>
        </label>
      </div>

      <div className="setting-item">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={currentSettings.pushNotifications}
            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
          />
          <span>Push Notifications</span>
        </label>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-section">
      <h4><FaDatabase /> System Settings</h4>
      
      <div className="setting-item">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={currentSettings.autoBackup}
            onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
          />
          <span>Automatic Backup</span>
        </label>
      </div>

      <div className="setting-item">
        <label>Backup Frequency</label>
        <select
          value={currentSettings.backupFrequency}
          onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="setting-item">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={currentSettings.maintenanceMode}
            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
          />
          <span>Maintenance Mode</span>
        </label>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h4><FaPalette /> Appearance Settings</h4>
      
      <div className="setting-item">
        <label>Theme</label>
        <select
          value={currentSettings.theme}
          onChange={(e) => handleSettingChange('theme', e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3><FaCog /> System Settings</h3>
        <button className="btn-primary" onClick={handleSave}>
          <FaSave /> Save Changes
        </button>
      </div>

      <div className="settings-tabs">
        <button 
          className={activeTab === 'general' ? 'active' : ''} 
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={activeTab === 'notifications' ? 'active' : ''} 
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={activeTab === 'system' ? 'active' : ''} 
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
        <button 
          className={activeTab === 'appearance' ? 'active' : ''} 
          onClick={() => setActiveTab('appearance')}
        >
          Appearance
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'system' && renderSystemSettings()}
        {activeTab === 'appearance' && renderAppearanceSettings()}
      </div>
    </div>
  );
};

export default SettingsPanel;
