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
  Building2 
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [meRes, usersRes] = await Promise.all([
        fetch('/api/admin/me').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json())
      ]);

      if (meRes.success) setCurrentUser(meRes.data);
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
      <div className="py-16 text-center text-xs font-bold text-royal-900">
        Loading security credentials &amp; team access...
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-royal-700">Account &amp; Access Control</span>
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-royal-900 mt-1">
          Security &amp; Staff Credentials
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Manage secure login passwords for Super Admin and venue staff members across Electronic City and BTM 2nd Stage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Change Own Password (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border-2 border-sand-300 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-sand-200">
            <div className="p-2 rounded-xl bg-royal-100 text-royal-800">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-royal-900">Change My Password</h3>
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-royal-700"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-3 rounded-2xl text-xs font-black text-white bg-royal-700 hover:bg-royal-800 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {changingPassword ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>

        {/* Right Column: Staff Accounts Roster (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border-2 border-sand-300 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-sand-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-royal-900">Team Staff Logins</h3>
                <span className="text-[11px] text-slate-500">2 Venue Staff Accounts for Bookings &amp; Verification</span>
              </div>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-xl text-slate-500 hover:text-royal-800 hover:bg-sand-100 transition-colors"
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
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-royal-400 bg-sand-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-royal-950">{user.name}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        user.role === 'super_admin' ? 'bg-amber-400 text-royal-950' : 'bg-royal-100 text-royal-800'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Staff'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span>Login: <code className="font-mono text-royal-800 font-bold">{user.email}</code></span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                        <MapPin className="w-3 h-3 text-royal-600" />
                        <span>{branchLabel}</span>
                      </span>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetStaff(user);
                        setStaffNewPassword('');
                        setStaffModalError('');
                        setStaffModalSuccess('');
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-royal-800 bg-white border-2 border-royal-700 hover:bg-royal-800 hover:text-white transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      Change Password
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Role Permissions Explanation Card */}
          <div className="p-4 rounded-2xl bg-royal-50/80 border border-royal-200 text-xs text-royal-900 space-y-1.5">
            <span className="font-extrabold text-xs block text-royal-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-royal-700" />
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

      {/* Staff Password Change Modal */}
      {targetStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border-2 border-slate-300 shadow-elevated space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-royal-700" />
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
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-royal-700 hover:bg-royal-800 transition-all disabled:opacity-50"
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
