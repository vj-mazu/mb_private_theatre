import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore, saveStore } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Only Super Administrators can upload room photos' }, { status: 403 });
    }

    const body = await request.json();
    const { image, theatre_id, filename } = body;

    if (!image || !image.startsWith('data:image/')) {
      return NextResponse.json({ success: false, error: 'Valid compressed image data URL required' }, { status: 400 });
    }

    // Parse base64
    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ success: false, error: 'Invalid base64 image format' }, { status: 400 });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Save under public/images/rooms/
    const targetDir = path.join(process.cwd(), 'public', 'images', 'rooms');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeName = `room_${theatre_id || 'photo'}_${Date.now()}.${ext}`;
    const filePath = path.join(targetDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/rooms/${safeName}`;

    // If theatre_id provided, attach to theatre images array
    if (theatre_id) {
      const th = mockStore.theatres.find(t => t.id === Number(theatre_id));
      if (th) {
        if (!Array.isArray((th as any).images)) {
          (th as any).images = [th.image_url].filter(Boolean);
        }
        (th as any).images.push(publicUrl);
        // Also update primary image if empty
        if (!th.image_url) {
          th.image_url = publicUrl;
        }
        saveStore();
      }
    }

    // Audit log
    mockStore.auditLogs.unshift({
      id: Date.now(),
      user_id: session.id,
      user_email: session.email,
      action: 'UPLOAD_ROOM_PHOTO',
      entity: 'theatres',
      entity_id: String(theatre_id || 'general'),
      details: { url: publicUrl, size_kb: (buffer.length / 1024).toFixed(1) },
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      size_kb: (buffer.length / 1024).toFixed(1),
      theatres: mockStore.theatres
    });
  } catch (err: any) {
    console.error('Photo upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
