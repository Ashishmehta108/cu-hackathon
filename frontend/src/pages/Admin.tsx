import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CategoryBadge } from '@/components/category-badge';
import { adminLogin, fetchAdminComplaints, updateAdminComplaintStatus, deleteAdminComplaint } from '@/lib/adminApi';
import type { ComplaintStatus } from '@/lib/types';

export function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      loadComplaints();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await adminLogin(password);
      setIsLoggedIn(true);
      await loadComplaints();
    } catch (error) {
      alert('Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminComplaints();
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ComplaintStatus) => {
    try {
      await updateAdminComplaintStatus(id, status);
      await loadComplaints();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this complaint?')) {
      try {
        await deleteAdminComplaint(id);
        await loadComplaints();
      } catch (error) {
        alert('Failed to delete complaint');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loginLoading}>
            {loginLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <Button onClick={() => { localStorage.removeItem('adminToken'); setIsLoggedIn(false); }} className="mb-4">
        Logout
      </Button>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {loading ? (
        <LoadingSpinner message="Loading complaints..." />
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Complaints Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{complaint.id.slice(0, 8)}...</td>
                    <td className="p-2">
                      <Select
                        value={complaint.status}
                        onValueChange={(value) => handleUpdateStatus(complaint.id, value as ComplaintStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2"><CategoryBadge category={complaint.category} /></td>
                    <td className="p-2">{complaint.location.village}, {complaint.location.district}</td>
                    <td className="p-2">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(complaint.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {complaints.length === 0 && !loading && (
              <p className="text-muted-foreground text-center py-8">No complaints found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
