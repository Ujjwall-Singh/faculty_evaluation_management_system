import React, { useState, useEffect } from 'react';
import { FaHistory, FaSearch, FaFilter, FaDownload, FaEye, FaUser, FaClock } from 'react-icons/fa';

const AuditLogs = ({ onExport }) => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  // Sample audit log data
  useEffect(() => {
    const sampleLogs = [
      {
        id: 1,
        timestamp: '2024-02-08 10:30:00',
        user: 'admin@fems.com',
        action: 'LOGIN',
        resource: 'System',
        details: 'Admin login successful',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0.4472.124'
      },
      {
        id: 2,
        timestamp: '2024-02-08 10:32:15',
        user: 'admin@fems.com',
        action: 'CREATE',
        resource: 'Faculty',
        details: 'Created new faculty member: Dr. Smith',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0.4472.124'
      },
      {
        id: 3,
        timestamp: '2024-02-08 11:15:30',
        user: 'faculty@fems.com',
        action: 'UPDATE',
        resource: 'Profile',
        details: 'Updated profile information',
        ipAddress: '192.168.1.105',
        userAgent: 'Firefox/89.0'
      },
      {
        id: 4,
        timestamp: '2024-02-08 14:22:45',
        user: 'student@fems.com',
        action: 'SUBMIT',
        resource: 'Review',
        details: 'Submitted review for MATH101',
        ipAddress: '192.168.1.110',
        userAgent: 'Safari/14.1.1'
      },
      {
        id: 5,
        timestamp: '2024-02-08 15:45:12',
        user: 'admin@fems.com',
        action: 'DELETE',
        resource: 'Review',
        details: 'Deleted inappropriate review',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0.4472.124'
      }
    ];
    setLogs(sampleLogs);
    setFilteredLogs(sampleLogs);
  }, []);

  useEffect(() => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by action
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Filter by user
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user === userFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
      }
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, dateFilter, actionFilter, userFilter]);

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'LOGIN':
        return 'success';
      case 'CREATE':
        return 'primary';
      case 'UPDATE':
        return 'warning';
      case 'DELETE':
        return 'danger';
      case 'SUBMIT':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueUsers = [...new Set(logs.map(log => log.user))];

  return (
    <div className="audit-logs">
      <div className="audit-header">
        <h3><FaHistory /> Audit Logs</h3>
        <button className="btn-secondary" onClick={() => onExport('audit-logs', 'csv')}>
          <FaDownload /> Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th><FaClock /> Timestamp</th>
              <th><FaUser /> User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.user}</td>
                <td>
                  <span className={`badge badge-${getActionBadgeColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td>{log.resource}</td>
                <td>{log.details}</td>
                <td>{log.ipAddress}</td>
                <td>
                  <button 
                    className="btn-icon" 
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="no-data">
            <FaHistory className="empty-icon" />
            <p>No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
