import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaBan,
  FaCheck,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaSort
} from 'react-icons/fa';

const UserManagement = ({ 
  users, 
  onAddUser, 
  onEditUser, 
  onDeleteUser, 
  onExportUsers, 
  onSendNotification,
  onBulkAction 
}) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // table or cards
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // view, add, edit
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, selectedRole, selectedStatus, selectedDepartment, sortBy, sortOrder]);

  const filterAndSortUsers = () => {
    let filtered = [...(users || [])];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(user => user.department === selectedDepartment);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openUserModal = (user = null, mode = 'view') => {
    setSelectedUser(user);
    setModalMode(mode);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setModalMode('view');
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }
    
    if (window.confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) {
      onBulkAction(action, selectedUsers);
      setSelectedUsers([]);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'student': return <FaUserGraduate className="role-icon student" />;
      case 'faculty': return <FaChalkboardTeacher className="role-icon faculty" />;
      case 'admin': return <FaUserShield className="role-icon admin" />;
      default: return <FaUserGraduate className="role-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-badge active',
      inactive: 'status-badge inactive',
      suspended: 'status-badge suspended',
      pending: 'status-badge pending'
    };
    
    return <span className={statusClasses[status] || 'status-badge'}>{status}</span>;
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const departments = [...new Set(users?.map(u => u.department).filter(Boolean) || [])];

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-management-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => openUserModal(null, 'add')}>
            <FaPlus /> Add User
          </button>
          <button className="btn-secondary" onClick={() => onExportUsers('csv')}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="user-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admins</option>
          </select>

          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="view-toggle">
          <button 
            className={viewMode === 'table' ? 'active' : ''} 
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button 
            className={viewMode === 'cards' ? 'active' : ''} 
            onClick={() => setViewMode('cards')}
          >
            Card View
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedUsers.length} users selected</span>
          <div className="bulk-buttons">
            <button onClick={() => handleBulkAction('activate')}>
              <FaCheck /> Activate
            </button>
            <button onClick={() => handleBulkAction('deactivate')}>
              <FaBan /> Deactivate
            </button>
            <button onClick={() => handleBulkAction('delete')} className="danger">
              <FaTrash /> Delete
            </button>
            <button onClick={() => handleBulkAction('notify')}>
              <FaEnvelope /> Send Notification
            </button>
          </div>
        </div>
      )}

      {/* Users Display */}
      {viewMode === 'table' ? (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('name')}>
                  Name <FaSort />
                </th>
                <th onClick={() => handleSort('role')}>
                  Role <FaSort />
                </th>
                <th onClick={() => handleSort('email')}>
                  Email <FaSort />
                </th>
                <th onClick={() => handleSort('department')}>
                  Department <FaSort />
                </th>
                <th onClick={() => handleSort('status')}>
                  Status <FaSort />
                </th>
                <th onClick={() => handleSort('createdAt')}>
                  Joined <FaSort />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td>
                    <div className="user-name-cell">
                      {getRoleIcon(user.role)}
                      <div>
                        <div className="name">{user.name}</div>
                        <div className="id">
                          {user.role === 'student' ? user.admissionNo : user.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>{user.department}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => openUserModal(user, 'view')} title="View">
                        <FaEye />
                      </button>
                      <button onClick={() => openUserModal(user, 'edit')} title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => onSendNotification(user)} title="Send Notification">
                        <FaEnvelope />
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user._id)} 
                        className="danger" 
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="users-cards">
          {currentUsers.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-card-header">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleSelectUser(user._id)}
                />
                {getRoleIcon(user.role)}
                {getStatusBadge(user.status)}
              </div>
              
              <div className="user-card-body">
                <h3>{user.name}</h3>
                <p className="user-id">
                  <FaIdCard /> {user.role === 'student' ? user.admissionNo : user.employeeId}
                </p>
                <p className="user-email">
                  <FaEnvelope /> {user.email}
                </p>
                {user.phone && (
                  <p className="user-phone">
                    <FaPhone /> {user.phone}
                  </p>
                )}
                <p className="user-department">{user.department}</p>
                <p className="user-joined">
                  <FaCalendarAlt /> Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="user-card-actions">
                <button onClick={() => openUserModal(user, 'view')}>
                  <FaEye /> View
                </button>
                <button onClick={() => openUserModal(user, 'edit')}>
                  <FaEdit /> Edit
                </button>
                <button onClick={() => onDeleteUser(user._id)} className="danger">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                Math.abs(page - currentPage) <= 2
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && <span>...</span>}
                  <button
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))
            }
          </div>
          
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={closeUserModal}
          onSave={(userData) => {
            if (modalMode === 'add') {
              onAddUser(userData);
            } else if (modalMode === 'edit') {
              onEditUser(selectedUser._id, userData);
            }
            closeUserModal();
          }}
          departments={departments}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, mode, onClose, onSave, departments }) => {
  const [formData, setFormData] = useState(
    user || {
      name: '',
      email: '',
      role: 'student',
      department: '',
      admissionNo: '',
      employeeId: '',
      phone: '',
      status: 'active'
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="user-modal">
        <div className="modal-header">
          <h3>
            {mode === 'add' ? 'Add New User' : 
             mode === 'edit' ? 'Edit User' : 'User Details'}
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              {formData.role === 'student' ? (
                <div className="form-group">
                  <label>Admission Number</label>
                  <input
                    type="text"
                    name="admissionNo"
                    value={formData.admissionNo}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    required
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            {mode !== 'view' && (
              <button type="submit" className="btn-primary">
                {mode === 'add' ? 'Add User' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
