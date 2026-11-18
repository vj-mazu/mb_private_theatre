import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminToken } from '@/lib/auth';
import { mockStore, saveStore } from '@/lib/db';
import { createRateLimiter } from '@/lib/rate-limiter';

const loginRateLimiter = createRateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 8,
  keyPrefix: 'admin-login',
  message: 'Too many login attempts. Please wait 5 minutes and try again.'
});

function hash(value: string): string {
  return bcrypt.hashSync(value, 10);
}

/**
 * Converts any legacy plaintext password left in store.json into a bcrypt hash.
 * Plaintext credentials must never be persisted or committed.
 */
function migratePlaintextPasswords(): boolean {
  let changed = false;
  for (const user of mockStore.adminUsers || []) {
    const legacy = (user as any).password_plain;
    if (legacy) {
      if (!user.password_hash) user.password_hash = hash(String(legacy));
      delete (user as any).password_plain;
      changed = true;
    }
  }
  return changed;
}

function ensureStaffUsers(): boolean {
  if (!mockStore.adminUsers) {
    mockStore.adminUsers = [];
  }

  const isProduction = process.env.NODE_ENV === 'production';
  let changed = false;

  // 1. Super Admin — credentials fallback safely if env var not configured
  let admin = mockStore.adminUsers.find(u => u.id === 1 || u.role === 'super_admin');
  if (!admin) {
    const email = process.env.ADMIN_EMAIL || 'admin@moviebash.in';
    const password = process.env.ADMIN_PASSWORD || 'Admin@MovieBash2026!';

    admin = {
      id: 1,
      name: 'Super Admin',
      email,
      username: 'admin',
      password_hash: hash(password),
      role: 'super_admin',
      branch_id: null,
      is_active: 1,
      created_at: '2026-01-01'
    } as any;
    mockStore.adminUsers.push(admin as any);
    changed = true;
  }

  // 2. Branch staff seeds
  const staffSeeds = [
    { id: 2, name: 'Staff – Electronic City', email: 'staff_ec@moviebash.in', username: 'staff_ec', password: 'Staff@EC2026!', branch_id: 1 },
    { id: 3, name: 'Staff – BTM 2nd Stage', email: 'staff_btm@moviebash.in', username: 'staff_btm', password: 'Staff@BTM2026!', branch_id: 2 }
  ];

  for (const seed of staffSeeds) {
    const exists = mockStore.adminUsers.find(
      u => u.id === seed.id || (u.role === 'staff' && u.branch_id === seed.branch_id)
    );
    if (!exists) {
      mockStore.adminUsers.push({
        id: seed.id,
        name: seed.name,
        email: seed.email,
        username: seed.username,
        password_hash: hash(seed.password),
        role: 'staff',
        branch_id: seed.branch_id,
        is_active: 1,
        created_at: '2026-01-01'
      } as any);
      changed = true;
    }
  }

  return changed;
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await loginRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const accountsChanged = ensureStaffUsers();
    const migrated = migratePlaintextPasswords();
    if (accountsChanged || migrated) saveStore();

    const { email, password } = await request.json();
    const inputIdentifier = String(email || '').trim().toLowerCase();
    const inputPassword = String(password || '');

    if (!inputIdentifier || !inputPassword) {
      return NextResponse.json({ success: false, error: 'Please enter both your ID and password.' }, { status: 400 });
    }

    // Match by email or username
    const user = mockStore.adminUsers.find(u =>
      (u.email && u.email.toLowerCase() === inputIdentifier) ||
      (u.username && u.username.toLowerCase() === inputIdentifier)
    );

    // Uniform response for unknown account and wrong password
    const invalid = NextResponse.json({ success: false, error: 'Invalid username or password.' }, { status: 401 });

    if (!user) return invalid;
    if (user.is_active === 0) {
      return NextResponse.json({ success: false, error: 'This account has been deactivated.' }, { status: 403 });
    }
    if (!user.password_hash) return invalid;

    const isMatch = bcrypt.compareSync(inputPassword, user.password_hash);
    if (!isMatch) return invalid;

    const token = signAdminToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      branch_id: user.branch_id
    });

    // Record audit log
    mockStore.auditLogs.unshift({
      id: Date.now(),
      user_id: user.id,
      user_email: user.email,
      action: 'LOGIN',
      entity: 'auth',
      entity_id: String(user.id),
      details: { role: user.role, branch_id: user.branch_id },
      created_at: new Date().toISOString()
    });

    saveStore();

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id
      }
    });

    response.cookies.set('mb_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 // 8 hours (active staff/admin shift)
    });

    return response;
  } catch (error: any) {
    console.error('[Movie Bash Auth] Login failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to sign in right now. Please try again.' }, { status: 500 });
  }
}
