import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import {
  Shield, ShieldOff, Ban, CheckCircle, Trash2, UserCheck,
  Search, ChevronLeft, ChevronRight, AlertTriangle, Loader2,
  LogIn, RefreshCw, Lock
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  registrationSource: string;
  cohortDate: string;
  lastLoginAt: string | null;
  loginCount: number;
  createdAt: string;
}

export default function AdminUsersList() {
  useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked' | 'pending' | 'admin'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<'' | 'block' | 'unblock' | 'verify' | 'makeAdmin' | 'removeAdmin' | 'delete' | 'resetPassword'>('');
  const [newPassword, setNewPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://159-194-206-229.sslip.io/api';

  async function fetchUsers() {
    setLoading(true);
    try {
      const token = localStorage.getItem('es_auth_token');
      const res = await fetch(`${API_URL}/admin/users?filter=${filter}&page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [filter, page]);

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  async function performAction() {
    if (!actionUser || !actionType) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('es_auth_token');
      let endpoint = '';
      let method = 'POST';
      let body: any = undefined;

      switch (actionType) {
        case 'block':
        case 'unblock':
          endpoint = `/admin/users/${actionUser.id}/toggle-block`;
          break;
        case 'makeAdmin':
        case 'removeAdmin':
          endpoint = `/admin/users/${actionUser.id}/toggle-admin`;
          break;
        case 'verify':
          endpoint = `/admin/users/${actionUser.id}/approve`;
          break;
        case 'delete':
          endpoint = `/admin/users/${actionUser.id}`;
          method = 'DELETE';
          break;
        case 'resetPassword':
          endpoint = `/admin/users/${actionUser.id}/reset-password`;
          body = JSON.stringify({ newPassword });
          break;
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      const data = await res.json();
      if (res.ok) {
        setToast(data.message || 'Action completed');
        fetchUsers();
      } else {
        setToast(data.error || 'Action failed');
      }
    } catch {
      setToast('Network error');
    } finally {
      setProcessing(false);
      setActionType('');
      setActionUser(null);
      setNewPassword('');
      setTimeout(() => setToast(''), 3000);
    }
  }

  const statusBadge = (u: AdminUser) => {
    if (u.isBlocked) return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-400/10 text-red-400">Blocked</span>;
    if (!u.isVerified) return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-yellow-400/10 text-yellow-400">Pending</span>;
    if (u.isAdmin) return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#B8A14E]/10 text-[#B8A14E]">Admin</span>;
    return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-400/10 text-green-400">Active</span>;
  };

  return (
    <Layout role="admin" showFooter>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[32px] font-bold" style={{ fontFamily: "'Clash Display', system-ui, sans-serif", color: '#F5F5F0' }}>
            Users
          </h1>
          <button onClick={fetchUsers} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title="Refresh">
            <RefreshCw size={18} style={{ color: '#8A8A93' }} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['all', 'active', 'blocked', 'pending', 'admin'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors"
                style={{
                  color: filter === f ? '#B8A14E' : '#8A8A93',
                  background: filter === f ? 'rgba(184,161,78,0.08)' : 'transparent',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or username..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-[14px] bg-white/5 border border-white/10 outline-none focus:border-[#B8A14E] transition-colors text-[#F5F5F0] placeholder:text-[#55555E]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin" style={{ color: '#B8A14E' }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase" style={{ color: '#8A8A93' }}>User</th>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase" style={{ color: '#8A8A93' }}>Status</th>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase" style={{ color: '#8A8A93' }}>Logins</th>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase" style={{ color: '#8A8A93' }}>Joined</th>
                    <th className="px-4 py-3 text-[12px] font-semibold uppercase text-right" style={{ color: '#8A8A93' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid rgba(255,255,255,0.1)' }}>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium" style={{ color: '#F5F5F0' }}>{u.username}</p>
                            <p className="text-[12px]" style={{ color: '#55555E' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{statusBadge(u)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <LogIn size={14} style={{ color: '#8A8A93' }} />
                          <span className="text-[13px]" style={{ color: '#8A8A93' }}>{u.loginCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px]" style={{ color: '#8A8A93' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!u.isVerified && (
                            <button
                              onClick={() => { setActionUser(u); setActionType('verify'); }}
                              className="p-1.5 rounded-lg hover:bg-green-400/10 transition-colors"
                              title="Approve user"
                            >
                              <CheckCircle size={16} style={{ color: '#10B981' }} />
                            </button>
                          )}
                          <button
                            onClick={() => { setActionUser(u); setActionType(u.isAdmin ? 'removeAdmin' : 'makeAdmin'); }}
                            className="p-1.5 rounded-lg hover:bg-[#B8A14E]/10 transition-colors"
                            title={u.isAdmin ? 'Remove admin' : 'Make admin'}
                          >
                            {u.isAdmin ? <ShieldOff size={16} style={{ color: '#EF4444' }} /> : <Shield size={16} style={{ color: '#B8A14E' }} />}
                          </button>
                          <button
                            onClick={() => { setActionUser(u); setActionType(u.isBlocked ? 'unblock' : 'block'); }}
                            className="p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                            title={u.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {u.isBlocked ? <UserCheck size={16} style={{ color: '#10B981' }} /> : <Ban size={16} style={{ color: '#EF4444' }} />}
                          </button>
                          <button
                            onClick={() => { setActionUser(u); setActionType('resetPassword'); }}
                            className="p-1.5 rounded-lg hover:bg-[#B8A14E]/10 transition-colors"
                            title="Reset password"
                          >
                            <Lock size={16} style={{ color: '#B8A14E' }} />
                          </button>
                          <button
                            onClick={() => { setActionUser(u); setActionType('delete'); }}
                            className="p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={16} style={{ color: '#EF4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={18} style={{ color: '#8A8A93' }} />
            </button>
            <span className="text-[13px]" style={{ color: '#8A8A93' }}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={18} style={{ color: '#8A8A93' }} />
            </button>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {actionType && actionUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={() => { setActionType(''); setActionUser(null); setNewPassword(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel p-6 rounded-2xl w-full max-w-sm"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {actionType === 'resetPassword' ? (
                <>
                  <h3 className="text-[18px] font-semibold mb-1" style={{ color: '#F5F5F0', fontFamily: "'Clash Display', system-ui, sans-serif" }}>
                    Reset Password
                  </h3>
                  <p className="text-[14px] mb-4" style={{ color: '#8A8A93' }}>
                    Set new password for {actionUser.username}
                  </p>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className="w-full px-4 py-3 rounded-xl text-[14px] bg-white/5 border border-white/10 outline-none focus:border-[#B8A14E] transition-colors text-[#F5F5F0] placeholder:text-[#55555E] mb-4"
                    minLength={8}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActionType(''); setActionUser(null); }}
                      className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-colors hover:bg-white/5"
                      style={{ color: '#8A8A93', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={performAction}
                      disabled={processing || newPassword.length < 8}
                      className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
                    >
                      {processing ? '...' : 'Reset'}
                    </button>
                  </div>
                </>
              ) : actionType === 'delete' ? (
                <>
                  <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <AlertTriangle size={24} style={{ color: '#EF4444' }} />
                  </div>
                  <h3 className="text-[18px] font-semibold mb-1 text-center" style={{ color: '#F5F5F0', fontFamily: "'Clash Display', system-ui, sans-serif" }}>
                    Delete User
                  </h3>
                  <p className="text-[14px] mb-4 text-center" style={{ color: '#8A8A93' }}>
                    Permanently delete <strong style={{ color: '#F5F5F0' }}>{actionUser.username}</strong>? This cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActionType(''); setActionUser(null); }}
                      className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-colors hover:bg-white/5"
                      style={{ color: '#8A8A93', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={performAction}
                      disabled={processing}
                      className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 disabled:opacity-60"
                      style={{ background: '#EF4444', color: '#fff' }}
                    >
                      {processing ? '...' : 'Delete'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-[18px] font-semibold mb-1" style={{ color: '#F5F5F0', fontFamily: "'Clash Display', system-ui, sans-serif" }}>
                    {actionType === 'verify' ? 'Approve User' :
                     actionType === 'makeAdmin' ? 'Grant Admin' :
                     actionType === 'removeAdmin' ? 'Revoke Admin' :
                     actionType === 'block' ? 'Block User' :
                     'Unblock User'}
                  </h3>
                  <p className="text-[14px] mb-4" style={{ color: '#8A8A93' }}>
                    {actionType === 'verify' ? `Approve ${actionUser.username} and grant full access.` :
                     actionType === 'makeAdmin' ? `Grant admin rights to ${actionUser.username}.` :
                     actionType === 'removeAdmin' ? `Remove admin rights from ${actionUser.username}.` :
                     actionType === 'block' ? `Block ${actionUser.username}. They will lose access.` :
                     `Unblock ${actionUser.username} and restore access.`}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActionType(''); setActionUser(null); }}
                      className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-colors hover:bg-white/5"
                      style={{ color: '#8A8A93', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={performAction}
                      disabled={processing}
                      className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
                    >
                      {processing ? '...' : 'Confirm'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] px-4 py-3 rounded-xl text-[14px] font-medium"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
