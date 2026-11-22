export const DEFAULT_AVATARS: Record<string, string> = {
  shubham: 'https://rldhntvumgsrcgifjwpd.supabase.co/storage/v1/object/public/avatars/be2136bd-f85a-491a-936c-3f0b8e41c7d5/avatar.png',
  rahul: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  priya: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  amit: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  admin: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
};

export function resolveAvatarUrl(
  avatarUrl?: string | null,
  name?: string | null,
  userId?: string | null
): string {
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl;
  }

  const cleanName = (name || '').toLowerCase();
  if (cleanName.includes('shubham')) return DEFAULT_AVATARS.shubham;
  if (cleanName.includes('rahul')) return DEFAULT_AVATARS.rahul;
  if (cleanName.includes('priya')) return DEFAULT_AVATARS.priya;
  if (cleanName.includes('amit')) return DEFAULT_AVATARS.amit;
  if (cleanName.includes('admin')) return DEFAULT_AVATARS.admin;

  if (userId) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rldhntvumgsrcgifjwpd.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/avatars/${userId}/avatar.png`;
  }

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`;
}
