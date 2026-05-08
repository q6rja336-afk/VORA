'use client';

import { use, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { supabase, upsertWatchProgress } from '@/lib/supabase';
import { fetchTMDBMetadata } from '@/lib/tmdb';
import { motion } from 'framer-motion';
import { Star, Play } from 'lucide-react';

// Mock user ID — replace with Supabase Auth
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export default function WatchPage({ params }: WatchPageProps) {
  const { id } = use(params);
  const router  = useRouter();
  const searchParams = useSearchParams();
  const urlStartAt = parseInt(searchParams.get('t') ?? '0', 10);
  
  // New: Season and Episode parameters
  const seasonNum = parseInt(searchParams.get('s') ?? '1', 10);
  const episodeNum = parseInt(searchParams.get('e') ?? '1', 10);

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);

  const [startAt, setStartAt] = useState(urlStartAt);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        let currentItem = {
          ...data,
          backdropUrl: data.backdrop_url,
          posterUrl: data.poster_url,
          videoUrl: data.video_url,
          seasonsData: data.seasons_data || [],
          imdbId: data.imdb_id,
        };

        // ── AUTO-SYNC WITH TMDB ──
        // Trigger sync if we have an imdb_id and either:
        // 1. Missing Arabic title or description
        // 2. Is a series but has no seasons data
        const needsSync = data.imdb_id && (
          !data.title_ar || 
          !data.description || 
          !data.seasons_data || 
          data.seasons_data.length === 0 ||
          (data.type === 'series' && data.seasons_data.some((s: any) => !s.episodes || s.episodes.length === 0))
        );

        if (needsSync) {
          console.log("Syncing metadata with TMDB for:", data.title);
          const meta = await fetchTMDBMetadata(data.imdb_id);
          if (meta) {
            const updatePayload: any = {
              title_ar: meta.titleAr,
              description: meta.description,
              year: meta.year,
              score: meta.score,
              backdrop_url: meta.backdropUrl,
              poster_url: meta.posterUrl,
              type: meta.type
            };

            // ── SMART MERGE SEASONS DATA ──
            let mergedSeasons = data.seasons_data || [];
            if (meta.type === 'series' && meta.seasonsData) {
              mergedSeasons = meta.seasonsData.map((tmdbS: any) => {
                const existingS = mergedSeasons.find((s: any) => s.seasonNumber === tmdbS.seasonNumber);
                if (existingS) {
                  // Merge episodes: Keep existing links, fill new ones with ""
                  const mergedEpisodes = tmdbS.episodes.map((_: any, idx: number) => {
                    return existingS.episodes[idx] || "";
                  });
                  return { ...tmdbS, episodes: mergedEpisodes };
                }
                return tmdbS; // New season from TMDB
              });
              updatePayload.seasons_data = mergedSeasons;
            }

            const { error: updateError } = await supabase
              .from('content')
              .update(updatePayload)
              .eq('id', id);
            
            if (!updateError) {
              currentItem = {
                ...currentItem,
                titleAr: meta.titleAr,
                description: meta.description,
                year: meta.year,
                score: meta.score,
                backdropUrl: meta.backdropUrl,
                posterUrl: meta.posterUrl,
                seasonsData: mergedSeasons,
                type: meta.type
              };
            }
          }
        }
        setItem(currentItem);

        // ── Fetch Watch Progress ──
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id || DEMO_USER_ID;
          const { data: progress } = await supabase
            .from('watch_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('content_id', id)
            .single();

          if (progress) {
            // If it's a movie, or a series matching the exact season/episode
            const isMovie = data.type === 'movie';
            const isMatchingEpisode = !isMovie && 
              progress.season_number === seasonNum && 
              progress.episode_number === episodeNum;

            if (isMovie || isMatchingEpisode) {
              const ratio = progress.position_seconds / progress.duration_seconds;
              setStartAt(ratio < 0.95 ? Math.floor(progress.position_seconds) : urlStartAt);
            } else {
              setStartAt(urlStartAt);
            }
          } else {
            setStartAt(urlStartAt);
          }
        } catch (err) {
          console.error("Error fetching progress:", err);
        }

        // Fetch related
        const { data: relatedData } = await supabase
          .from('content')
          .select('*')
          .neq('id', id)
          .limit(4);
        
        if (relatedData) {
          setRelated(relatedData.map(r => ({
            ...r,
            backdropUrl: r.backdrop_url,
          })));
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleProgress = useCallback(async (position: number, duration: number) => {
    if (item) {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || DEMO_USER_ID;
      await upsertWatchProgress(
        userId, 
        item.id, 
        position, 
        duration,
        item.type === 'series' ? seasonNum : undefined,
        item.type === 'series' ? episodeNum : undefined
      );
    }
  }, [item, seasonNum, episodeNum]);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
       <div className="loader"></div>
    </div>
  );

  if (!item) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <p style={{ color: 'var(--on-surface-variant)', fontFamily: 'var(--font-arabic)' }}>المحتوى غير موجود.</p>
    </div>
  );

  // Determine video source based on type
  let videoSrc = '';
  let currentTitle = item.title;
  let hasSource = false;

  if (item.type === 'movie') {
    videoSrc = item.videoUrl;
    hasSource = !!videoSrc || !!item.imdbId;
  } else if (item.type === 'series' && (item.seasonsData?.length > 0 || item.imdbId)) {
    const season = item.seasonsData.find((s: any) => s.seasonNumber === seasonNum);
    if (season && season.episodes[episodeNum - 1]) {
      videoSrc = season.episodes[episodeNum - 1];
      hasSource = true;
    } else if (item.imdbId) {
      hasSource = true;
    }
    currentTitle = `${item.title} - الموسم ${seasonNum} - الحلقة ${episodeNum}`;
  }

  if (!hasSource) {
    return (
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', gap: '20px', padding: '20px', textAlign: 'center' }}>
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <p style={{ color: '#ef4444', fontFamily: 'var(--font-arabic)', fontSize: '18px', fontWeight: '600' }}>عذراً، رابط هذه الحلقة غير متوفر حالياً.</p>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '8px' }}>يرجى التأكد من إضافة رابط الحلقة في لوحة التحكم.</p>
        </div>
        <button onClick={() => router.back()} style={{ padding: '12px 32px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>العودة للخلف</button>
      </div>
    );
  }

  return (
    <main style={{ height: '100vh', width: '100vw', background: '#000', overflow: 'hidden' }}>
      {/* ── Video Player ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          height: '100vh',
          width: '100vw',
          background: '#000',
        }}
      >
        <VideoPlayer
          src={videoSrc}
          title={currentTitle}
          startAt={startAt}
          imdbId={item.imdbId}
          season={seasonNum}
          episode={episodeNum}
          onBack={() => router.back()}
          onProgress={handleProgress}
        />
      </motion.div>
    </main>
  );
}
