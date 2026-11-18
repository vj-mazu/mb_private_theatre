'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Users, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  MapPin, 
  Building2,
  MessageSquare,
  Send,
  ExternalLink,
  Edit,
  UserCog,
  AtSign,
  Check
} from 'lucide-react';

export default function AdminSecurityPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Own Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Staff Password Reset Modal
  const [targetStaff, setTargetStaff] = useState<any | null>(null);
  const [staffNewPassword, setStaffNewPassword] = useState('');
  const [staffModalSuccess, setStaffModalSuccess] = useState('');
  const [staffModalError, setStaffModalError] = useState('');
  const [updatingStaffPassword, setUpdatingStaffPassword] = useState(false);

  // Full Staff Edit Modal State (Username, Email, Name, Branch, Password)
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [editStaffForm, setEditStaffForm] = useState({
    name: '',
    username: '',
    email: '',
    branch_id: 1,
    password: ''
  });
  const [editingStaffLoading, setEditingStaffLoading] = useState(false);
  const [editStaffError, setEditStaffError] = useState('');
  const [editStaffSuccess, setEditStaffSuccess] = useState('');

  const openEditStaffModal = (user: any) => {
    setEditingStaff(user);
    setEditStaffForm({
      name: user.name || '',
      username: user.username || user.email.split('@')[0],
      email: user.email || '',
      branch_id: user.branch_id || 1,
      password: ''
    });
    setEditStaffError('');
    setEditStaffSuccess('');
  };

  const handleSaveStaffProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setEditStaffError('');
    setEditStaffSuccess('');

    if (!editStaffForm.username.trim()) {
      setEditStaffError('Login username is required.');
      return;
    }

    setEditingStaffLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: editingStaff.id,
          name: editStaffForm.name,
          username: editStaffForm.username,
          email: editStaffForm.email,
          branch_id: editStaffForm.branch_id,
          password: editStaffForm.password || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditStaffSuccess(data.message || 'Staff profile updated successfully!');
        setTimeout(() => {
          setEditingStaff(null);
          loadData();
        }, 1200);
      } else {
        setEditStaffError(data.error || 'Failed to update staff credentials.');
      }
    } catch (err: any) {
      setEditStaffError(err.message || 'Network error updating staff credentials.');
    } finally {
      setEditingStaffLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [meRes, usersRes] = await Promise.all([
        fetch('/api/admin/me').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json())
      ]);

      if (meRes.success) {
        if (meRes.data?.role === 'staff') {
          window.location.href = '/admin/bookings';
          return;
        }
        setCurrentUser(meRes.data);
      }
      if (usersRes.success) setAllUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      const json = await res.json();
      if (json.success) {
        setPasswordSuccess(json.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 5000);
      } else {
        setPasswordError(json.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Network error while updating password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateStaffPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaff) return;
    setStaffModalError('');
    setStaffModalSuccess('');

    if (staffNewPassword.length < 4) {
      setStaffModalError('Password must be at least 4 characters long.');
      return;
    }

    setUpdatingStaffPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: targetStaff.id,
          new_password: staffNewPassword
        })
      });
      const json = await res.json();
      if (json.success) {
        setStaffModalSuccess(json.message || `Password for ${targetStaff.name} updated!`);
        setTimeout(() => {
          setTargetStaff(null);
          setStaffNewPassword('');
          setStaffModalSuccess('');
          loadData();
        }, 1500);
      } else {
        setStaffModalError(json.error || 'Failed to update password.');
      }
    } catch (err) {
      setStaffModalError('Network error while updating password.');
    } finally {
      setUpdatingStaffPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-bold text-ink">
        Loading security credentials &amp; team access...
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#ef4a23]">Account &amp; Access Control</span>
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-ink mt-1">
          Security &amp; Staff Credentials
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Manage secure login passwords for Super Admin, venue staff accounts, and WhatsApp API notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Change Own Password (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border-2 border-sky-200 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-sky-100">
            <div className="p-2 rounded-xl bg-royal-100 text-[#141110]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink">Change My Password</h3>
              <span className="text-[11px] text-slate-500">Logged in as {currentUser?.name}</span>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangeOwnPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password or PIN"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-royal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 4 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-royal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-royal-700"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-3 rounded-2xl text-xs font-black text-white bg-[#ef4a23] hover:bg-[#141110] shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {changingPassword ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>

        {/* Right Column: Staff Accounts Roster (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border-2 border-sky-200 shadow-[0_12px_40px_rgba(22,48,79,0.06)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-sky-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Team Staff Logins</h3>
                <span className="text-[11px] text-slate-500">2 Venue Staff Accounts for Bookings &amp; Verification</span>
              </div>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-xl text-slate-500 hover:text-[#141110] hover:bg-[#fff8f5] transition-colors"
              title="Refresh staff roster"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            {allUsers.map((user) => {
              const isStaff = user.role === 'staff';
              const branchLabel = user.branch_id === 1 ? 'Electronic City' : user.branch_id === 2 ? 'BTM 2nd Stage' : 'All Branches (Director)';

              return (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl border-2 border-sky-100 hover:border-royal-400 bg-[#fffdf9]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-royal-950">{user.name}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        user.role === 'super_admin' ? 'bg-amber-400 text-royal-950' : 'bg-[#fff0ea] text-[#ef4a23] border border-[#ef4a23]/30'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Venue Staff'}
                      </span>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        @{user.username || user.email.split('@')[0]}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span>Login Email: <code className="font-mono text-[#141110] font-bold">{user.email}</code></span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-royal-600" />
                        <span>{branchLabel}</span>
                      </span>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                      {/* EDIT USERNAME & DETAILS BUTTON */}
                      <button
                        type="button"
                        onClick={() => openEditStaffModal(user)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:border-[#ef4a23] hover:text-[#ef4a23] transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                        title="Edit Username, Name & Branch"
                      >
                        <UserCog className="w-3.5 h-3.5 text-[#ef4a23]" />
                        <span>Edit Username</span>
                      </button>

                      {/* CHANGE PASSWORD BUTTON */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStaff(user);
                          setStaffNewPassword('');
                          setStaffModalError('');
                          setStaffModalSuccess('');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#ef4a23] hover:bg-[#ff5d38] transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Assign New Password"
                      >
                        <Key className="w-3 h-3" />
                        <span>Password</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Role Permissions Explanation Card */}
          <div className="p-4 rounded-2xl bg-royal-50/80 border border-royal-200 text-xs text-ink space-y-1.5">
            <span className="font-extrabold text-xs block text-royal-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#ef4a23]" />
              <span>Role Permissions Matrix</span>
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              &bull; <strong>Super Admin</strong>: Full system control, coupon management, change all passwords, view revenue metrics, permanently delete/restore bookings.
            </p>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              &bull; <strong>Staff (Electronic City / BTM)</strong>: Log in to inspect upcoming screenings, take phone bookings, search customer reservations, and generate WhatsApp vouchers for their venue.
            </p>
          </div>
        </div>

      </div>

      {/* Staff Full Profile & Username Edit Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border-2 border-slate-300 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-100 text-[#ef4a23]">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-royal-950">
                    Edit Staff Profile &amp; Username
                  </h3>
                  <span className="text-[11px] text-slate-500">Modify login credentials for {editingStaff.name}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {editStaffSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editStaffSuccess}</span>
              </div>
            )}

            {editStaffError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editStaffError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStaffProfile} className="space-y-4 text-xs">
              
              {/* Username Field */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Login Username <span className="text-[#ef4a23]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={editStaffForm.username}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. staff_ec, rahul_ec"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#ef4a23]"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Staff can log in with this username or their email.</span>
              </div>

              {/* Display Name Field */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">Staff Display Name</label>
                <input
                  type="text"
                  required
                  value={editStaffForm.name}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
                  placeholder="e.g. Staff – Electronic City"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-[#ef4a23]"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">Staff Login Email</label>
                <input
                  type="email"
                  required
                  value={editStaffForm.email}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, email: e.target.value })}
                  placeholder="e.g. staff_ec@moviebash.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-[#ef4a23]"
                />
              </div>

              {/* Branch Assignment Field */}
              {editingStaff.role === 'staff' && (
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Assigned Branch Venue</label>
                  <select
                    value={editStaffForm.branch_id}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, branch_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#ef4a23]"
                  >
                    <option value={1}>Electronic City Branch</option>
                    <option value={2}>BTM 2nd Stage Branch</option>
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">Locks staff bookings strictly to this venue.</span>
                </div>
              )}

              {/* New Password (Optional) */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Change Password <span className="text-slate-400 font-normal">(Optional — leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={editStaffForm.password}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, password: e.target.value })}
                  placeholder="Enter new password (or leave empty)"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-900 focus:outline-none focus:border-[#ef4a23]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingStaffLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#ef4a23] hover:bg-[#ff5d38] transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStaffLoading ? 'Saving...' : 'Save Profile & Username'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {targetStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border-2 border-slate-300 shadow-elevated space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#ef4a23]" />
                <h3 className="font-bold text-sm text-royal-950">
                  Update Password: {targetStaff.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTargetStaff(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {staffModalSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{staffModalSuccess}</span>
              </div>
            )}

            {staffModalError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{staffModalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStaffPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Assign New Password for {targetStaff.username || targetStaff.email}
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={staffNewPassword}
                  onChange={(e) => setStaffNewPassword(e.target.value)}
                  placeholder="Enter new staff password"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-royal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetStaff(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStaffPassword}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-[#ef4a23] hover:bg-[#141110] transition-all disabled:opacity-50"
                >
                  {updatingStaffPassword ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
