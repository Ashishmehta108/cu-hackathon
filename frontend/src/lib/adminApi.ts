const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Admin login
export const adminLogin = async (password: string): Promise<boolean> => {
  // Simple check, but actually we'll use it for requests
  localStorage.setItem('adminToken', password);
  return true; // Assume success
};

// Get admin complaints
export const fetchAdminComplaints = async (): Promise<any[]> => {
  const res = await fetch(`${API_BASE}/admin/complaints`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch admin complaints');
  return res.json();
};

// Update complaint status
export const updateAdminComplaintStatus = async (id: string, status: string, notes?: string) => {
  const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
};

// Delete complaint
export const deleteAdminComplaint = async (id: string) => {
  const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete complaint');
  return res.json();
};
