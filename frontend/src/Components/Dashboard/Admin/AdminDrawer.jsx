import React, { useState, useEffect } from 'react';
import { 
  FaTimes,
  FaTachometerAlt,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaStarHalfAlt,
  FaClipboardList,
  FaChartBar,
  FaUserShield,
  FaCog,
  FaBell,
  FaFileAlt,
  FaDatabase,
  FaShieldAlt,
  FaTools,
  FaCalendarAlt,
  FaEnvelope,
  FaPalette,
  FaGraduationCap,
  FaBookOpen,
  FaBullhorn,
  FaSignOutAlt,
  FaHome,
  FaUserCircle,
  FaChevronRight,
  FaChevronDown,
  FaDesktop
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../Assets/logo.png';
import './AdminDrawer.css';

const AdminDrawer = ({ isOpen, onClose, onMenuSelect, activeMenu }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Sample admin profile data
  useEffect(() => {
    setUserProfile({
      name: 'Admin User',
      role: 'System Administrator',
      email: 'admin@university.edu',
      avatar: null,
      lastLogin: new Date().toLocaleString()
    });
  }, []);

  // Auto-expand sections when sub-menu items are active
  useEffect(() => {
    if (activeMenu) {
      const sectionToExpand = {
        'dashboard': ['analytics'],
        'faculty': ['user-management', 'academic-management'],
        'students': ['user-management', 'academic-management'],
        'reviews': ['evaluation-system'],
        'settings': ['system-settings', 'customization']
      };

      const sectionsToExpand = sectionToExpand[activeMenu] || [];
      if (sectionsToExpand.length > 0) {
        setExpandedSections(prev => {
          const newExpanded = { ...prev };
          sectionsToExpand.forEach(section => {
            newExpanded[section] = true;
          });
          return newExpanded;
        });
      }
    }
  }, [activeMenu]);

  // Function to check if a menu item should be highlighted based on active tab
  const isMenuActive = (menuKey, subMenuKey = null) => {
    const activeTabToMenuMapping = {
      'dashboard': ['dashboard', 'performance-analytics', 'faculty-reports', 'student-reports', 'department-stats', 'notifications', 'announcements', 'messaging', 'newsletters', 'academic-calendar'],
      'faculty': ['faculty-management', 'user-management', 'departments', 'courses', 'bulk-operations'],
      'students': ['student-management', 'semesters'],
      'reviews': ['review-management', 'evaluation-criteria', 'rating-system', 'feedback-analysis', 'evaluation-system'],
      'profile': ['admin-profile'],
      'settings': ['user-roles', 'general-settings', 'security-settings', 'system-settings', 'admin-settings', 'theme-settings', 'ui-customization', 'branding', 'customization', 'backup-restore', 'system-logs']
    };

    const menuKeys = activeTabToMenuMapping[activeMenu] || [];
    return menuKeys.includes(subMenuKey || menuKey);
  };

  // Sample admin profile data
  useEffect(() => {
    setUserProfile({
      name: 'Admin User',
      role: 'System Administrator',
      email: 'admin@university.edu',
      avatar: null,
      lastLogin: new Date().toLocaleString()
    });
  }, []);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleMenuClick = (menuKey, hasSubMenu = false) => {
    if (hasSubMenu) {
      toggleSection(menuKey);
    } else {
      // Map drawer menu keys to admin dashboard tab keys
      const menuToTabMapping = {
        // Main dashboard
        'dashboard': 'dashboard',
        'performance-analytics': 'dashboard',
        'faculty-reports': 'dashboard',
        'student-reports': 'dashboard',
        'department-stats': 'dashboard',
        
        // Faculty management
        'faculty-management': 'faculty',
        'user-management': 'faculty',
        'faculty-analysis': 'faculty-analysis',
        
        // Student management  
        'student-management': 'students',
        
        // Reviews and evaluation
        'review-management': 'reviews',
        'evaluation-criteria': 'reviews',
        'rating-system': 'reviews',
        'feedback-analysis': 'reviews',
        'evaluation-system': 'reviews',
        
        // Profile and settings
        'admin-profile': 'profile',
        'user-roles': 'settings',
        'general-settings': 'settings',
        'security-settings': 'settings',
        'system-settings': 'settings',
        'admin-settings': 'settings',
        'theme-settings': 'settings',
        'ui-customization': 'settings',
        'branding': 'settings',
        'customization': 'settings',
        
        // Communication and notifications
        'notifications': 'dashboard',
        'announcements': 'dashboard',
        'messaging': 'dashboard',
        'newsletters': 'dashboard',
        'communication': 'dashboard',
        
        // Academic management
        'departments': 'faculty',
        'courses': 'faculty',
        'semesters': 'students',
        'academic-calendar': 'dashboard',
        'academic-management': 'dashboard',
        
        // System tools
        'bulk-operations': 'faculty',
        'backup-restore': 'settings',
        'system-logs': 'settings'
      };
      
      const targetTab = menuToTabMapping[menuKey] || 'dashboard';
      onMenuSelect(targetTab);
      
      // Close drawer automatically after selection
      setTimeout(() => {
        onClose();
      }, 300); // Small delay for better UX
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Admin logout initiated...');
      
      // Use AuthContext logout method
      await logout();
      
      // Close the drawer
      onClose();
      
      // Navigate to home page
      navigate('/', { replace: true });
      
      console.log('Admin logout completed');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Fallback: Clear localStorage manually and redirect
      localStorage.clear();
      navigate('/', { replace: true });
      onClose();
    }
  };

  const menuStructure = [
    {
      key: 'dashboard',
      label: 'Dashboard Overview',
      icon: FaTachometerAlt,
      color: '#3b82f6'
    },
    {
      key: 'analytics',
      label: 'Analytics & Reports',
      icon: FaChartBar,
      color: '#10b981',
      subItems: [
        { key: 'performance-analytics', label: 'Performance Analytics', icon: FaChartBar },
        { key: 'faculty-reports', label: 'Faculty Reports', icon: FaFileAlt },
        { key: 'student-reports', label: 'Student Reports', icon: FaUserGraduate },
        { key: 'department-stats', label: 'Department Statistics', icon: FaDatabase }
      ]
    },
    {
      key: 'user-management',
      label: 'User Management',
      icon: FaUsers,
      color: '#8b5cf6',
      subItems: [
        { key: 'faculty-management', label: 'Faculty Management', icon: FaChalkboardTeacher },
        { key: 'student-management', label: 'Student Management', icon: FaUserGraduate },
        { key: 'faculty-analysis', label: 'Faculty Analysis', icon: FaChartBar },
        { key: 'user-roles', label: 'User Roles & Permissions', icon: FaUserShield },
        { key: 'bulk-operations', label: 'Bulk Operations', icon: FaTools }
      ]
    },
    {
      key: 'evaluation-system',
      label: 'Evaluation System',
      icon: FaStarHalfAlt,
      color: '#f59e0b',
      subItems: [
        { key: 'review-management', label: 'Review Management', icon: FaClipboardList },
        { key: 'evaluation-criteria', label: 'Evaluation Criteria', icon: FaBookOpen },
        { key: 'rating-system', label: 'Rating System', icon: FaStarHalfAlt },
        { key: 'feedback-analysis', label: 'Feedback Analysis', icon: FaChartBar }
      ]
    },
    {
      key: 'academic-management',
      label: 'Academic Management',
      icon: FaGraduationCap,
      color: '#ec4899',
      subItems: [
        { key: 'departments', label: 'Departments', icon: FaDesktop },
        { key: 'courses', label: 'Courses & Subjects', icon: FaBookOpen },
        { key: 'semesters', label: 'Semester Management', icon: FaCalendarAlt },
        { key: 'academic-calendar', label: 'Academic Calendar', icon: FaCalendarAlt }
      ]
    },
    {
      key: 'communication',
      label: 'Communication Hub',
      icon: FaBullhorn,
      color: '#06b6d4',
      subItems: [
        { key: 'notifications', label: 'Notifications Center', icon: FaBell },
        { key: 'announcements', label: 'Announcements', icon: FaBullhorn },
        { key: 'messaging', label: 'Internal Messaging', icon: FaEnvelope },
        { key: 'newsletters', label: 'Newsletters', icon: FaFileAlt }
      ]
    },
    {
      key: 'system-settings',
      label: 'System Settings',
      icon: FaCog,
      color: '#6b7280',
      subItems: [
        { key: 'general-settings', label: 'General Settings', icon: FaCog },
        { key: 'security-settings', label: 'Security Settings', icon: FaShieldAlt },
        { key: 'backup-restore', label: 'Backup & Restore', icon: FaDatabase },
        { key: 'system-logs', label: 'System Logs', icon: FaFileAlt }
      ]
    },
    {
      key: 'customization',
      label: 'Customization',
      icon: FaPalette,
      color: '#a855f7',
      subItems: [
        { key: 'theme-settings', label: 'Theme Settings', icon: FaPalette },
        { key: 'ui-customization', label: 'UI Customization', icon: FaDesktop },
        { key: 'branding', label: 'Institution Branding', icon: FaHome }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="admin-drawer-overlay" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className={`admin-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="admin-drawer-header">
          <div className="drawer-logo-section">
            <img src={logo} alt="University Logo" className="drawer-logo" />
            <div className="drawer-title">
              <h2>Admin Panel</h2>
              <p>Control Center</p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Admin Profile Section - Compact Version */}
        {userProfile && (
          <div className="admin-profile-section compact">
            <div className="profile-avatar-small">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Admin Avatar" />
              ) : (
                <FaUserCircle />
              )}
            </div>
            <div className="profile-info-compact">
              <h4>{userProfile.name}</h4>
              <p className="profile-role-small">{userProfile.role}</p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="admin-drawer-content">
          <nav className="drawer-navigation">
            {menuStructure.map((item) => (
              <div key={item.key} className="nav-item-container">
                <div 
                  className={`nav-item ${isMenuActive(item.key) ? 'active' : ''} ${item.subItems ? 'has-submenu' : ''}`}
                  onClick={() => handleMenuClick(item.key, !!item.subItems)}
                  style={{ '--item-color': item.color }}
                >
                  <div className="nav-item-content">
                    <div className="nav-item-left">
                      <div className="nav-icon" style={{ backgroundColor: item.color }}>
                        <item.icon />
                      </div>
                      <span className="nav-label">{item.label}</span>
                    </div>
                    {item.subItems && (
                      <div className="nav-arrow">
                        {expandedSections[item.key] ? <FaChevronDown /> : <FaChevronRight />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub Menu */}
                {item.subItems && expandedSections[item.key] && (
                  <div className="sub-menu">
                    {item.subItems.map((subItem) => (
                      <div
                        key={subItem.key}
                        className={`sub-nav-item ${isMenuActive(item.key, subItem.key) ? 'active' : ''}`}
                        onClick={() => handleMenuClick(subItem.key)}
                      >
                        <div className="sub-nav-icon">
                          <subItem.icon />
                        </div>
                        <span className="sub-nav-label">{subItem.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Actions - Compact */}
        <div className="admin-drawer-footer compact">
          <div className="footer-actions-compact">
            <button 
              className="footer-action-btn-small logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
            
            <button 
              className="footer-action-btn-small settings-btn"
              onClick={() => handleMenuClick('admin-settings')}
              title="Settings"
            >
              <FaCog />
            </button>
            
            <button 
              className="footer-action-btn-small profile-btn"
              onClick={() => handleMenuClick('admin-profile')}
              title="Profile"
            >
              <FaUserCircle />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDrawer;
