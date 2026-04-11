'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Profile } from '@/lib/supabase/types';

export default function UserTable() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const togglePaidStatus = async (user: Profile) => {
    setActionLoading((prev) => ({ ...prev, [`paid-${user.id}`]: true }));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ has_paid: !user.has_paid }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchUsers();
    } catch {
      setError('Failed to update paid status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`paid-${user.id}`]: false }));
    }
  };

  const deleteUser = async (userId: string) => {
    setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setDeleteConfirm(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <p className="text-text-muted">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8">
        <p className="text-error text-center">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchUsers();
          }}
          className="mt-4 mx-auto block px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <p className="text-text-muted">No users found.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Paid Status
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Created At
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-border/20 transition-colors">
                <td className="px-4 py-3 text-sm text-text-main whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-border/50 text-text-muted'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      user.has_paid ? 'text-success' : 'text-text-muted'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.has_paid ? 'bg-success' : 'bg-error'
                      }`}
                    />
                    {user.has_paid ? 'Paid' : 'Free'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePaidStatus(user)}
                      disabled={actionLoading[`paid-${user.id}`]}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
                        user.has_paid
                          ? 'bg-error/10 text-error hover:bg-error/20'
                          : 'bg-success/10 text-success hover:bg-success/20'
                      }`}
                    >
                      {actionLoading[`paid-${user.id}`]
                        ? '...'
                        : user.has_paid
                          ? 'Revoke'
                          : 'Grant'}
                    </button>

                    {deleteConfirm === user.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={actionLoading[`delete-${user.id}`]}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-error text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {actionLoading[`delete-${user.id}`]
                            ? '...'
                            : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-border/50 text-text-muted hover:bg-border transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-error/10 text-error hover:bg-error/20 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
