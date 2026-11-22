import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let userId: string = '';
    let fullName: string = '';
    let phone: string = '';
    let avatarUrl: string = '';
    let avatarFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      userId = (formData.get('userId') as string) || '';
      fullName = (formData.get('fullName') as string) || '';
      phone = (formData.get('phone') as string) || '';
      avatarFile = formData.get('avatar') as File | null;
      avatarUrl = (formData.get('avatarUrl') as string) || '';
    } else {
      const body = await req.json();
      userId = body.userId || '';
      fullName = body.fullName || '';
      phone = body.phone || '';
      avatarUrl = body.avatarUrl || '';
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User identification required to update profile.' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // 1. Process Avatar File Upload to Supabase Storage if provided
    if (avatarFile && typeof avatarFile.arrayBuffer === 'function') {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (buffer.length > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Profile image size cannot exceed 5MB.' },
          { status: 400 }
        );
      }

      const fileExt = avatarFile.name.split('.').pop() || 'png';
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadErr } = await serviceClient.storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: avatarFile.type || 'image/png',
          upsert: true,
        });

      if (uploadErr) {
        console.error('Storage upload error:', uploadErr);
        return NextResponse.json(
          { success: false, message: 'Failed to upload profile picture to storage.' },
          { status: 500 }
        );
      }

      const { data: urlData } = serviceClient.storage
        .from('avatars')
        .getPublicUrl(filePath);

      avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    }

    // 2. Format phone number cleanly
    const cleanDigits = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const visiblePhone =
      cleanDigits && cleanDigits.length === 10
        ? `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
        : phone || undefined;

    // 3. Update public.profiles
    const profileUpdate: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (fullName && fullName.trim()) {
      profileUpdate.full_name = fullName.trim();
    }
    if (visiblePhone) {
      profileUpdate.phone_masked = visiblePhone;
    }

    const { error: pErr } = await serviceClient
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId);

    if (pErr) {
      console.error('Profile update error:', pErr);
    }

    // 4. Update auth.users user_metadata
    const { data: existingUser } = await serviceClient.auth.admin.getUserById(userId);
    if (existingUser?.user) {
      const currentMeta = existingUser.user.user_metadata || {};
      const newMeta = {
        ...currentMeta,
        ...(fullName && fullName.trim() ? { full_name: fullName.trim() } : {}),
        ...(visiblePhone ? { phone: visiblePhone } : {}),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      };

      await serviceClient.auth.admin.updateUserById(userId, {
        user_metadata: newMeta,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile and account settings saved successfully!',
      profile: {
        id: userId,
        fullName: fullName || existingUser?.user?.user_metadata?.full_name,
        phone: visiblePhone || existingUser?.user?.user_metadata?.phone,
        avatarUrl: avatarUrl || existingUser?.user?.user_metadata?.avatar_url,
      },
    });
  } catch (err: any) {
    console.error('Update profile API error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error updating profile.' },
      { status: 500 }
    );
  }
}
