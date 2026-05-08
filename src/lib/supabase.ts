import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

const isConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Continue Watching ───────────────────────────────────────────────────────

export interface WatchProgress {
  id: string;
  user_id: string;
  content_id: string;
  position_seconds: number;
  duration_seconds: number;
  season_number?: number;
  episode_number?: number;
  updated_at: string;
}

export async function upsertWatchProgress(
  userId: string,
  contentId: string,
  positionSeconds: number,
  durationSeconds: number,
  season?: number,
  episode?: number
): Promise<void> {
  if (!isConfigured) return;
  const { error } = await supabase.from('watch_progress').upsert(
    {
      user_id: userId,
      content_id: contentId,
      position_seconds: positionSeconds,
      duration_seconds: durationSeconds,
      season_number: season,
      episode_number: episode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,content_id' }
  );
  if (error) {
    console.error("Error saving progress:", error.message, error.details);
  } else {
    console.log("Progress saved successfully for:", contentId);
  }
}

export async function getWatchProgress(
  userId: string,
  contentId: string
): Promise<WatchProgress | null> {
  if (!isConfigured) return null;
  const { data } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .single();
  return data ?? null;
}

export async function getContinueWatching(userId: string): Promise<WatchProgress[]> {
  if (!isConfigured) return [];
  const { data } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(10);
  return data ?? [];
}

// ─── Watchlist ─────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

export async function toggleWatchlist(userId: string, contentId: string): Promise<boolean> {
  if (!isConfigured) return false;

  const { data } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .single();

  if (data) {
    await supabase.from('watchlist').delete().eq('user_id', userId).eq('content_id', contentId);
    return false;
  } else {
    await supabase.from('watchlist').insert({ user_id: userId, content_id: contentId });
    return true;
  }
}

export async function getWatchlist(userId: string): Promise<string[]> {
  if (!isConfigured) return [];
  const { data } = await supabase
    .from('watchlist')
    .select('content_id')
    .eq('user_id', userId);
  
  return data?.map(d => d.content_id) ?? [];
}

// ── Profiles & Auth ──────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// ── Content Management (Admin) ────────────────────────────────────────────────

export async function getAllContent() {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addContent(content: any) {
  const { data, error } = await supabase
    .from('content')
    .insert([content])
    .select();
  
  if (error) throw error;
  return data;
}

export async function updateContent(id: string, updates: any) {
  const { data, error } = await supabase
    .from('content')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
}

export async function deleteContent(id: string) {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
