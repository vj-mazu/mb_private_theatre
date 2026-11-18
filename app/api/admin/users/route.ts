import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminSession } from '@/lib/auth';
import { mockStore, saveStore } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Access restricted: User management is reserved for Super Administrators' }, { status: 403 });
    }

    const users = (mockStore.adminUsers || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username || u.email.split('@')[0],
      role: u.role,
      branch_id: u.branch_id,
      is_active: u.is_active,
      created_at: u.created_at
    }));

    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: Only Super Administrators can modify staff usernames and credentials' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, name, username, email, branch_id, password } = body;

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = mockStore.adminUsers.find(u => u.id === Number(user_id));
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }

    // Check for username collision
    if (username) {
      const cleanUsername = String(username).trim().toLowerCase();
      const existingUser = mockStore.adminUsers.find(u => 
        u.id !== targetUser.id && 
        (u.username?.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername)
      );
      if (existingUser) {
        return NextResponse.json({ success: false, error: `Username "${cleanUsername}" is already taken by another account.` }, { status: 400 });
      }
      targetUser.username = cleanUsername;
    }

    // Check for email collision
    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      const existingEmail = mockStore.adminUsers.find(u => 
        u.id !== targetUser.id && 
        (u.email.toLowerCase() === cleanEmail || u.username?.toLowerCase() === cleanEmail)
      );
      if (existingEmail) {
        return NextResponse.json({ success: false, error: `Email "${cleanEmail}" is already in use.` }, { status: 400 });
      }
      targetUser.email = cleanEmail;
    }

    if (name) {
      targetUser.name = String(name).trim();
    }

    if (branch_id !== undefined && targetUser.role === 'staff') {
      targetUser.branch_id = Number(branch_id);
    }

    if (password && String(password).trim().length >= 8) {
      // Store a bcrypt hash only — plaintext credentials must never touch disk.
      (targetUser as any).password_hash = bcrypt.hashSync(String(password).trim(), 10);
      delete (targetUser as any).password_plain;
    } else if (password && String(password).trim().length > 0) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    saveStore();

    // Audit log
    mockStore.auditLogs.unshift({
      id: Date.now(),
      user_id: session.id,
      user_email: session.email,
      action: 'UPDATE_STAFF_ACCOUNT',
      entity: 'adminUsers',
      entity_id: String(targetUser.id),
      details: { 
        name: targetUser.name, 
        username: targetUser.username, 
        email: targetUser.email, 
        branch_id: targetUser.branch_id,
        password_updated: !!password 
      },
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Staff account "${targetUser.name}" updated successfully!`,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
        email: targetUser.email,
        branch_id: targetUser.branch_id,
        role: targetUser.role
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
