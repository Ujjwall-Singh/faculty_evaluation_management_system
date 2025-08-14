import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaTimes, FaEye, FaUserCheck } from 'react-icons/fa';
import API_BASE_URL from '../../../config/api';

const FacultyApprovalNotifications = ({ onApprovalAction }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch pending faculty on component mount and when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchPendingFaculty();
    }
  }, [isDropdownOpen]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchPendingFaculty();
  }, []);

  const fetchPendingFaculty = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/faculty/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const pending = data.faculty ? data.faculty.filter(f => f.status === 'pending') : [];
        setPendingFaculty(pending);
      }
    } catch (error) {
      console.error('Error fetching pending faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (facultyId, e) => {
    e.stopPropagation();
    try {
      setActionLoading(facultyId);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/faculty/approve/${facultyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove from pending list
        setPendingFaculty(prev => prev.filter(f => f._id !== facultyId));
        // Notify parent component
        if (onApprovalAction) {
          onApprovalAction('approve', { facultyId });
        }
      } else {
        console.error('Failed to approve faculty');
      }
    } catch (error) {
      console.error('Error approving faculty:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (facultyId, e) => {
    e.stopPropagation();
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      setActionLoading(facultyId);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/faculty/reject/${facultyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        // Remove from pending list
        setPendingFaculty(prev => prev.filter(f => f._id !== facultyId));
        // Notify parent component
        if (onApprovalAction) {
          onApprovalAction('reject', { facultyId, reason });
        }
      } else {
        console.error('Failed to reject faculty');
      }
    } catch (error) {
      console.error('Error rejecting faculty:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="faculty-notification-container" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        className="notification-bell"
        onClick={toggleDropdown}
        title="Faculty Approval Notifications"
      >
        <FaBell />
        {pendingFaculty.length > 0 && (
          <span className="notification-count">
            {pendingFaculty.length > 9 ? '9+' : pendingFaculty.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isDropdownOpen && (
        <div className="faculty-notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <h4>Faculty Approvals</h4>
            {pendingFaculty.length > 0 && (
              <span className="pending-count">{pendingFaculty.length} pending</span>
            )}
          </div>

          {/* Body */}
          <div className="notification-body">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading pending approvals...</p>
              </div>
            ) : pendingFaculty.length === 0 ? (
              <div className="empty-state">
                <FaUserCheck className="empty-icon" />
                <p>No pending faculty approvals</p>
              </div>
            ) : (
              <div className="faculty-list">
                {pendingFaculty.slice(0, 5).map((faculty) => (
                  <div key={faculty._id} className="faculty-item">
                    <div className="faculty-info">
                      <h5>{faculty.name}</h5>
                      <p className="faculty-email">{faculty.email}</p>
                      <p className="faculty-department">{faculty.department}</p>
                      <p className="faculty-time">{formatTime(faculty.createdAt)}</p>
                    </div>
                    <div className="faculty-actions">
                      <button
                        className="approve-btn"
                        onClick={(e) => handleApprove(faculty._id, e)}
                        disabled={actionLoading === faculty._id}
                        title="Approve Faculty"
                      >
                        {actionLoading === faculty._id ? (
                          <div className="action-spinner"></div>
                        ) : (
                          <FaCheck />
                        )}
                      </button>
                      <button
                        className="reject-btn"
                        onClick={(e) => handleReject(faculty._id, e)}
                        disabled={actionLoading === faculty._id}
                        title="Reject Faculty"
                      >
                        {actionLoading === faculty._id ? (
                          <div className="action-spinner"></div>
                        ) : (
                          <FaTimes />
                        )}
                      </button>
                      <button
                        className="view-btn"
                        onClick={() => console.log('View details:', faculty)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {pendingFaculty.length > 5 && (
            <div className="notification-footer">
              <p className="more-items">
                +{pendingFaculty.length - 5} more pending approvals
              </p>
              <button
                className="view-all-btn"
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Navigate to full faculty management page
                  console.log('Navigate to faculty management');
                }}
              >
                View All Approvals
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyApprovalNotifications;
