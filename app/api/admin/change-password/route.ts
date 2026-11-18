import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminSession, hashPassword } from '@/lib/auth';
import { mockStore, saveStore, getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: Only the Super Administrator has authorization to modify credentials or user authorizations.' 
      }, { status: 403 });
    }

    const { current_password, new_password, target_user_id } = await request.json();

    if (!new_password || new_password.trim().length < 4) {
      return NextResponse.json({ success: false, error: 'New password must be at least 4 characters.' }, { status: 400 });
    }

    // Determine which user account is being modified
    const isSuperAdmin = session.role === 'super_admin';
    const targetId = target_user_id && isSuperAdmin ? Number(target_user_id) : session.id;

    const user = mockStore.adminUsers.find(u => u.id === targetId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User account not found.' }, { status: 404 });
    }

    // If changing own password and not a super-admin overriding, verify current password
    if (!isSuperAdmin || targetId === session.id) {
      if (!current_password) {
        return NextResponse.json({ success: false, error: 'Please enter your current password.' }, { status: 400 });
      }

      // Verify against the stored bcrypt hash only. No master/backdoor passwords.
      let storedHash: string | null = (user as any).password_hash || null;
      const legacyPlain = (user as any).password_plain;

      if (!storedHash && legacyPlain) {
        storedHash = bcrypt.hashSync(String(legacyPlain), 10);
        (user as any).password_hash = storedHash;
        delete (user as any).password_plain;
      }

      const match = storedHash ? bcrypt.compareSync(String(current_password), storedHash) : false;

      if (!match) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
      }
    }

    // Set new password (hash only — never persist plaintext)
    const newHash = await hashPassword(String(new_password));
    (user as any).password_hash = newHash;
    (user as any).custom_password = true;
    (user as any).password_updated_at = new Date().toISOString();
    delete (user as any).password_plain;

    // Persist to SQLite admin_users table if available
    try {
      const db = getDb();
      if (db) {
        db.prepare("UPDATE admin_users SET password_hash = ?, updated_at = datetime('now', 'localtime') WHERE id = ?").run(
          newHash,
          user.id
        );
      }
    } catch (dbErr) {
      console.warn('SQLite admin_users password update error:', dbErr);
    }

    // Audit log
    mockStore.auditLogs.unshift({
      id: Date.now(),
      user_id: session.id,
      user_email: session.email,
      action: 'PASSWORD_CHANGED',
      entity: 'admin_user',
      entity_id: String(user.id),
      details: { target_name: user.name, target_email: user.email },
      created_at: new Date().toISOString()
    });

    saveStore();

    return NextResponse.json({
      success: true,
      message: `Password for ${user.name} was successfully updated!`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
