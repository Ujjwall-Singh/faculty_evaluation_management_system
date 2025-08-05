import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaExclamationTriangle, 
  FaLock, 
  FaUnlock, 
  FaUserSlash, 
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';

const SecurityDashboard = ({ onBlockUser, onUnblockUser }) => {
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    // Sample security data
    const sampleAlerts = [
      {
        id: 1,
        type: 'failed_login',
        severity: 'high',
        message: 'Multiple failed login attempts from IP 192.168.1.200',
        timestamp: '2024-02-08 14:30:00',
        status: 'active'
      },
      {
        id: 2,
        type: 'suspicious_activity',
        severity: 'medium',
        message: 'Unusual review submission pattern detected',
        timestamp: '2024-02-08 13:45:00',
        status: 'investigating'
      },
      {
        id: 3,
        type: 'data_access',
        severity: 'low',
        message: 'Bulk data export request from admin user',
        timestamp: '2024-02-08 12:15:00',
        status: 'resolved'
      }
    ];

    const sampleActivities = [
      {
        id: 1,
        user: 'student123@university.edu',
        activity: 'Rapid review submissions',
        riskLevel: 'medium',
        timestamp: '2024-02-08 15:20:00',
        details: 'Submitted 15 reviews in 5 minutes'
      },
      {
        id: 2,
        user: 'faculty.smith@university.edu',
        activity: 'Off-hours access',
        riskLevel: 'low',
        timestamp: '2024-02-08 02:30:00',
        details: 'Accessed system at 2:30 AM'
      }
    ];

    const sampleBlockedUsers = [
      {
        id: 1,
        email: 'blocked.user@university.edu',
        reason: 'Spam reviews',
        blockedAt: '2024-02-07 10:00:00',
        blockedBy: 'admin@fems.com'
      }
    ];

    setSecurityAlerts(sampleAlerts);
    setSuspiciousActivities(sampleActivities);
    setBlockedUsers(sampleBlockedUsers);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaExclamationTriangle className="status-icon danger" />;
      case 'investigating':
        return <FaClock className="status-icon warning" />;
      case 'resolved':
        return <FaCheckCircle className="status-icon success" />;
      default:
        return <FaTimesCircle className="status-icon secondary" />;
    }
  };

  return (
    <div className="security-dashboard">
      <div className="security-header">
        <h3><FaShieldAlt /> Security Dashboard</h3>
        <div className="security-stats">
          <div className="stat-card">
            <FaExclamationTriangle className="stat-icon danger" />
            <div className="stat-info">
              <span className="stat-number">{securityAlerts.filter(a => a.status === 'active').length}</span>
              <span className="stat-label">Active Alerts</span>
            </div>
          </div>
          <div className="stat-card">
            <FaUserSlash className="stat-icon warning" />
            <div className="stat-info">
              <span className="stat-number">{blockedUsers.length}</span>
              <span className="stat-label">Blocked Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="security-section">
        <h4><FaExclamationTriangle /> Security Alerts</h4>
        <div className="alerts-list">
          {securityAlerts.map(alert => (
            <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
              {getStatusIcon(alert.status)}
              <div className="alert-content">
                <div className="alert-header">
                  <span className={`severity-badge badge-${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="alert-time">{alert.timestamp}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
                <span className={`status-badge badge-${alert.status}`}>
                  {alert.status.toUpperCase()}
                </span>
              </div>
              <div className="alert-actions">
                <button className="btn-icon" title="View Details">
                  <FaEye />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suspicious Activities */}
      <div className="security-section">
        <h4><FaEye /> Suspicious Activities</h4>
        <div className="activities-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Activity</th>
                <th>Risk Level</th>
                <th>Time</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suspiciousActivities.map(activity => (
                <tr key={activity.id}>
                  <td>{activity.user}</td>
                  <td>{activity.activity}</td>
                  <td>
                    <span className={`risk-badge badge-${getRiskColor(activity.riskLevel)}`}>
                      {activity.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td>{activity.timestamp}</td>
                  <td>{activity.details}</td>
                  <td>
                    <button 
                      className="btn-sm btn-danger"
                      onClick={() => onBlockUser(activity.user)}
                    >
                      <FaLock /> Block
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="security-section">
        <h4><FaUserSlash /> Blocked Users</h4>
        <div className="blocked-users-list">
          {blockedUsers.map(user => (
            <div key={user.id} className="blocked-user-item">
              <div className="user-info">
                <span className="user-email">{user.email}</span>
                <span className="block-reason">Reason: {user.reason}</span>
                <span className="block-time">Blocked: {user.blockedAt} by {user.blockedBy}</span>
              </div>
              <div className="user-actions">
                <button 
                  className="btn-sm btn-success"
                  onClick={() => onUnblockUser(user.id)}
                >
                  <FaUnlock /> Unblock
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
