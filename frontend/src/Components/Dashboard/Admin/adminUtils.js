// Admin utility functions
export const logout = () => {
  // Clear all admin session data
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminUsername');
  localStorage.removeItem('adminSettings');
  localStorage.removeItem('adminSystemSettings');
  
  // Redirect to login page
  window.location.href = '/';
};

export const getAdminData = () => {
  return {
    email: localStorage.getItem('adminEmail') || '',
    username: localStorage.getItem('adminUsername') || '',
    token: localStorage.getItem('adminToken') || ''
  };
};

export const setAdminData = (data) => {
  if (data.email) localStorage.setItem('adminEmail', data.email);
  if (data.username) localStorage.setItem('adminUsername', data.username);
  if (data.token) localStorage.setItem('adminToken', data.token);
};

export const isAdminLoggedIn = () => {
  const token = localStorage.getItem('adminToken');
  const email = localStorage.getItem('adminEmail');
  return !!(token && email);
};
