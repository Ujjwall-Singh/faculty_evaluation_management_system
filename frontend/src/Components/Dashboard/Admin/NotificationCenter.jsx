import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const NotificationCenter = ({ notifications = [], onMarkAsRead, onDeleteNotification }) => {
  const [filter, setFilter] = useState('all'); // all, unread, read

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="notification-icon warning" />;
      case 'error':
        return <FaExclamationTriangle className="notification-icon error" />;
      case 'success':
        return <FaCheck className="notification-icon success" />;
      default:
        return <FaInfoCircle className="notification-icon info" />;
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3><FaBell /> Notifications</h3>
        <div className="notification-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''} 
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={filter === 'read' ? 'active' : ''} 
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>
      </div>

      <div className="notification-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <FaBell className="empty-icon" />
            <p>No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              {getNotificationIcon(notification.type)}
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.timestamp}</span>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    onClick={() => onMarkAsRead(notification.id)}
                    className="btn-mark-read"
                    title="Mark as read"
                  >
                    <FaCheck />
                  </button>
                )}
                <button 
                  onClick={() => onDeleteNotification(notification.id)}
                  className="btn-delete"
                  title="Delete notification"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
