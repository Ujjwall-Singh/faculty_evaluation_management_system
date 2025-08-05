import React, { useState, useEffect } from 'react';
import {
  FaCog,
  FaDatabase,
  FaShieldAlt,
  FaEnvelope,
  FaSave,
  FaDownload,
  FaTrash,
  FaSync
} from 'react-icons/fa';
import API_BASE_URL from '../../../config/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    system: {
      siteName: 'Faculty Evaluation Management System',
      siteUrl: 'https://fems-live.vercel.app',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: false
    },
    email: {
      smtpServer: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'admin@fems.com',
      fromName: 'FEMS Admin'
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 6,
      requireStrongPassword: true,
      enableTwoFactor: false
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      adminNotifications: true,
      facultyNotifications: true,
      studentNotifications: true
    }
  });

  const [activeSection, setActiveSection] = useState('system');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFaculty: 0,
    totalStudents: 0,
    totalReviews: 0,
    systemUptime: '99.9%',
    storageUsed: '2.3 GB'
  });

  useEffect(() => {
    loadSettings();
    loadSystemStats();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from localStorage or API
      const savedSettings = localStorage.getItem('adminSystemSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      setError('Failed to load settings');
    }
  };

  const loadSystemStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.log('Could not load system stats');
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Save to localStorage and API
      localStorage.setItem('adminSystemSettings', JSON.stringify(settings));
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Settings saved successfully!');
    } catch (error) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data export
      const exportData = {
        settings,
        timestamp: new Date().toISOString(),
        stats
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fems-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Data exported successfully!');
    } catch (error) {
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Clear localStorage cache
      const keysToKeep = ['adminToken', 'adminEmail', 'adminUsername'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      setSuccessMessage('Cache cleared successfully!');
    } catch (error) {
      setError('Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (settings.email.smtpServer && settings.email.fromEmail) {
        setSuccessMessage('Test email sent successfully!');
      } else {
        setError('Please configure SMTP settings first');
      }
    } catch (error) {
      setError('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.system.siteName}
            onChange={(e) => updateSetting('system', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
          <input
            type="url"
            value={settings.system.siteUrl}
            onChange={(e) => updateSetting('system', 'siteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
            <p className="text-sm text-gray-600">Enable to restrict access during updates</p>
          </div>
          <input
            type="checkbox"
            checked={settings.system.maintenanceMode}
            onChange={(e) => updateSetting('system', 'maintenanceMode', e.target.checked)}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Allow Registration</h4>
            <p className="text-sm text-gray-600">Allow new users to register</p>
          </div>
          <input
            type="checkbox"
            checked={settings.system.allowRegistration}
            onChange={(e) => updateSetting('system', 'allowRegistration', e.target.checked)}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Email Verification</h4>
            <p className="text-sm text-gray-600">Require email verification for new accounts</p>
          </div>
          <input
            type="checkbox"
            checked={settings.system.requireEmailVerification}
            onChange={(e) => updateSetting('system', 'requireEmailVerification', e.target.checked)}
            className="toggle"
          />
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
        <button
          onClick={testEmailSettings}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FaEnvelope />
          <span>Test Email</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
          <input
            type="text"
            value={settings.email.smtpServer}
            onChange={(e) => updateSetting('email', 'smtpServer', e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
          <input
            type="text"
            value={settings.email.smtpUsername}
            onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
          <input
            type="password"
            value={settings.email.smtpPassword}
            onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Strong Password Policy</h4>
            <p className="text-sm text-gray-600">Require uppercase, lowercase, numbers, and symbols</p>
          </div>
          <input
            type="checkbox"
            checked={settings.security.requireStrongPassword}
            onChange={(e) => updateSetting('security', 'requireStrongPassword', e.target.checked)}
            className="toggle"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Enable 2FA for admin accounts</p>
          </div>
          <input
            type="checkbox"
            checked={settings.security.enableTwoFactor}
            onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
            className="toggle"
          />
        </div>
      </div>
    </div>
  );

  const renderSystemStats = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">System Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">Total Users</h4>
          <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900">Total Faculty</h4>
          <p className="text-2xl font-bold text-green-600">{stats.totalFaculty}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900">Total Students</h4>
          <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900">Total Reviews</h4>
          <p className="text-2xl font-bold text-yellow-600">{stats.totalReviews}</p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-medium text-indigo-900">System Uptime</h4>
          <p className="text-2xl font-bold text-indigo-600">{stats.systemUptime}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-900">Storage Used</h4>
          <p className="text-2xl font-bold text-red-600">{stats.storageUsed}</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">System Maintenance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportData}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <FaDownload />
            <span>Export Data</span>
          </button>
          
          <button
            onClick={clearCache}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            <FaSync />
            <span>Clear Cache</span>
          </button>
          
          <button
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <FaTrash />
            <span>Clean Logs</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-settings p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure system preferences and security settings</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FaSave />
            <span>{loading ? 'Saving...' : 'Save All'}</span>
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('system')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeSection === 'system' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaCog />
                <span>System</span>
              </button>
              
              <button
                onClick={() => setActiveSection('email')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeSection === 'email' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaEnvelope />
                <span>Email</span>
              </button>
              
              <button
                onClick={() => setActiveSection('security')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeSection === 'security' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaShieldAlt />
                <span>Security</span>
              </button>
              
              <button
                onClick={() => setActiveSection('stats')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeSection === 'stats' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaDatabase />
                <span>Statistics</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {activeSection === 'system' && renderSystemSettings()}
            {activeSection === 'email' && renderEmailSettings()}
            {activeSection === 'security' && renderSecuritySettings()}
            {activeSection === 'stats' && renderSystemStats()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
