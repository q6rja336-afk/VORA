'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, Subtitles, ChevronRight,
  RotateCcw, RotateCw,
} from 'lucide-react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  title: string;
  titleAr?: string;
  onBack?: () => void;
  onProgress?: (position: number, duration: number) => void;
  startAt?: number;
  imdbId?: string;
  season?: number;
  episode?: number;
}

const SEEK_SECONDS = 5;
const HIDE_CONTROLS_AFTER = 3500;

// ترجمة الجودة
const QUALITY_LABELS: Record<string, string> = {
  'Auto': 'تلقائي',
  '1080p': '1080p',
  '720p':  '720p',
  '480p':  '480p',
};

export default function VideoPlayer({
  src, title, titleAr, onBack, onProgress, startAt = 0,
  imdbId, season, episode,
}: VideoPlayerProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const hideTimer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hlsRef      = useRef<Hls | null>(null);

  const [playing,   setPlaying]   = useState(true);
  const [muted,     setMuted]     = useState(false);
  const [volume,    setVolume]    = useState(1);
  const [current,   setCurrent]   = useState(startAt);
  const [duration,  setDuration]  = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showCtrl,  setShowCtrl]  = useState(true);
  const [buffered,  setBuffered]  = useState(0);
  const [quality,   setQuality]   = useState('Auto');
  const [showSettings, setShowSettings] = useState(false);
  const [doubleTapSide, setDoubleTapSide] = useState<'start' | 'end' | null>(null);

  // Function to normalize Google Drive and OneDrive links
  const getNormalizedSrc = (url: string) => {
    // Google Drive
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/file\/d\/(.+?)\//)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1];
      if (fileId) return `https://drive.google.com/uc?id=${fileId}&export=download`;
    }
    
    // Dropbox
    if (url.includes('dropbox.com')) {
      return url.replace('dl=0', 'dl=1');
    }
    
    // OneDrive
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
      if (url.includes('onedrive.live.com') && url.includes('embed')) {
        return url.replace('embed', 'download');
      }
      
      // Magic Conversion for 1drv.ms links
      try {
        // Remove query params like ?width=...
        const cleanUrl = url.split('?')[0];
        // Base64 encode the URL
        const b64 = btoa(cleanUrl)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        return `https://api.onedrive.com/v1.0/shares/u!${b64}/root/content`;
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  // Logic for vidapi.ru (Updated to latest format)
  let vidApiSrc = '';
  if (imdbId) {
    const autoplayParam = 'autoplay=1';
    const timeParam = startAt > 0 ? `&t=${Math.floor(startAt)}` : '';
    
    if (season && episode) {
      // Series format: /embed/tv/{imdb}/{s}/{e}
      vidApiSrc = `https://vidapi.ru/embed/tv/${imdbId}/${season}/${episode}?${autoplayParam}${timeParam}`;
    } else {
      // Movie format: /embed/movie/{imdb}
      vidApiSrc = `https://vidapi.ru/embed/movie/${imdbId}?${autoplayParam}${timeParam}`;
    }
  }

  const finalSrc = imdbId ? vidApiSrc : getNormalizedSrc(src);
  const isEmbed = !!imdbId || (src.includes('/embed') || src.includes('.html') || src.includes('youtube.com/embed')) && !src.includes('drive.google.com') && !src.includes('1drv.ms');

  // Initialize Source (Only on finalSrc change)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !finalSrc || isEmbed) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (finalSrc.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(finalSrc);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = finalSrc;
      }
    } else {
      video.src = finalSrc;
      video.load();
    }
  }, [finalSrc, isEmbed]);

  // Handle Seeking & Autoplay (On mount or startAt change)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isEmbed) return;

    const performSeekAndPlay = () => {
      if (startAt > 0 && Math.abs(video.currentTime - startAt) > 1) {
        video.currentTime = startAt;
      }
      video.play().catch(() => setPlaying(false));
    };

    video.addEventListener('loadedmetadata', performSeekAndPlay);
    if (video.readyState >= 1) performSeekAndPlay();

    return () => video.removeEventListener('loadedmetadata', performSeekAndPlay);
  }, [startAt, isEmbed]);

  const resetHideTimer = useCallback(() => {
    setShowCtrl(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowCtrl(false);
    }, HIDE_CONTROLS_AFTER);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [playing, resetHideTimer]);

  const saveProgress = useCallback(() => {
    if (videoRef.current && duration > 0 && onProgress) {
      onProgress(videoRef.current.currentTime, duration);
    }
  }, [duration, onProgress]);

  // 15s Throttle Auto-save
  useEffect(() => {
    if (playing && duration > 0 && onProgress) {
      const t = setInterval(saveProgress, 15000);
      return () => clearInterval(t);
    }
  }, [playing, duration, saveProgress]);

  // Save on Close/Unload
  useEffect(() => {
    window.addEventListener('beforeunload', saveProgress);
    return () => window.removeEventListener('beforeunload', saveProgress);
  }, [saveProgress]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      switch (e.code) {
        case 'Space':      e.preventDefault(); togglePlay(); break;
        // في RTL: السهم الأيمن يتراجع، الأيسر يتقدم (عكس LTR)
        case 'ArrowRight': seek(-SEEK_SECONDS); break;
        case 'ArrowLeft':  seek(SEEK_SECONDS);  break;
        case 'ArrowUp':    changeVolume(Math.min(1, volume + 0.1)); break;
        case 'ArrowDown':  changeVolume(Math.max(0, volume - 0.1)); break;
        case 'KeyM':       toggleMute();        break;
        case 'KeyF':       toggleFullscreen();  break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { 
      v.pause(); 
      setPlaying(false); 
      saveProgress(); // Save immediately on pause
    }
    resetHideTimer();
  }

  function seek(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(duration, v.currentTime + delta));
    resetHideTimer();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function changeVolume(val: number) {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    if (val === 0) setMuted(true);
    else { setMuted(false); v.muted = false; }
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await wrapRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  // RTL: جانب البداية (يمين) = تراجع، جانب النهاية (يسار) = تقديم
  function handleDoubleTap(side: 'start' | 'end') {
    seek(side === 'end' ? SEEK_SECONDS : -SEEK_SECONDS);
    setDoubleTapSide(side);
    setTimeout(() => setDoubleTapSide(null), 700);
  }

  function formatTime(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
        cursor: showCtrl ? 'default' : 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* ── وضع التضمين (Iframe) ── */}
      {isEmbed && finalSrc ? (
        <iframe 
          src={finalSrc}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
        />
      ) : !isEmbed ? (
        <>
          {/* ── عنصر الفيديو ── */}
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            onClick={togglePlay}
            onTimeUpdate={() => {
              const v = videoRef.current!;
              setCurrent(v.currentTime);
              if (v.buffered.length > 0)
                setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
            }}
            onLoadedMetadata={() => setDuration(videoRef.current!.duration)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            playsInline
          />
        </>
      ) : null}

      {/* ── مناطق النقر المزدوج وعناصر التحكم تظهر فقط في حالة الفيديو المباشر ── */}
      {!isEmbed && (
        <>

      {/* ── مناطق النقر المزدوج (RTL: يمين=تراجع، يسار=تقديم) ── */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none', direction: 'rtl' }}>
        {/* جانب البداية (يمين) = تراجع */}
        <div
          style={{ flex: 1, pointerEvents: 'all' }}
          onDoubleClick={() => handleDoubleTap('start')}
        />
        {/* جانب النهاية (يسار) = تقديم */}
        <div
          style={{ flex: 1, pointerEvents: 'all' }}
          onDoubleClick={() => handleDoubleTap('end')}
        />
      </div>

      {/* تأثير النقر المزدوج */}
      <AnimatePresence>
        {doubleTapSide && (
          <motion.div
            initial={{ opacity: 0.8, scale: 0.7 }}
            animate={{ opacity: 0, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute', top: '50%',
              // end = يسار الشاشة (تقديم)، start = يمين الشاشة (تراجع)
              [doubleTapSide === 'end' ? 'left' : 'right']: '15%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(79,97,255,0.25)',
              borderRadius: 'var(--radius-full)',
              width: '80px', height: '80px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '13px', fontFamily: 'var(--font-inter)',
              fontWeight: '700', flexDirection: 'column', gap: '4px',
              pointerEvents: 'none',
            }}
          >
            {doubleTapSide === 'end' ? <RotateCw size={24} /> : <RotateCcw size={24} />}
            <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '12px' }}>
              {SEEK_SECONDS} ث
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── شريط التحكم ── */}
      <AnimatePresence>
        {showCtrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', justifyContent: 'space-between',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.8) 100%)',
            }}
          >
            {/* ── الشريط العلوي (RTL للنصوص) ── */}
            <div
              dir="rtl"
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}
            >
              {/* زر الرجوع — في RTL يشير يميناً ← */}
              <motion.button
                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                style={ctrlBtnStyle}
                aria-label="رجوع"
              >
                <ChevronRight size={22} />
              </motion.button>
              <div>
                <p style={{ fontFamily: 'var(--font-arabic)', fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                  {titleAr ?? title}
                </p>
                {titleAr && (
                  <p style={{ fontFamily: 'var(--font-arabic)', fontSize: '13px', color: 'var(--primary)', opacity: 0.85 }}>
                    {title}
                  </p>
                )}
              </div>
            </div>

            {/* ── أزرار التشغيل المركزية ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(20px, 8vw, 80px)' }}>
              {/* تقديم 5 ثواني (يمين - سيظهر يساراً إذا تم العكس) — سأضع التقديم أولاً في الكود */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); seek(SEEK_SECONDS); }}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  width: '52px', height: '52px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', position: 'relative'
                }}
              >
                <RotateCw size={28} />
                <span style={{ 
                  position: 'absolute', fontSize: '9px', fontWeight: '900', 
                  marginTop: '4px', fontFamily: 'var(--font-inter)' 
                }}>5</span>
              </motion.button>

              {/* تشغيل/إيقاف (منتصف) */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                style={{
                  width: 'clamp(64px, 12vw, 90px)', height: 'clamp(64px, 12vw, 90px)',
                  borderRadius: '50%', background: 'linear-gradient(135deg, #5565af, #3e4c8c)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(85, 101, 175, 0.4)',
                }}
              >
                {playing ? <Pause size={32} fill="currentColor" /> : <Play size={32} style={{ marginLeft: '4px' }} fill="currentColor" />}
              </motion.button>

              {/* تأخير 5 ثواني (يسار) */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); seek(-SEEK_SECONDS); }}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  width: '52px', height: '52px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', position: 'relative'
                }}
              >
                <RotateCcw size={28} />
                <span style={{ 
                  position: 'absolute', fontSize: '9px', fontWeight: '900', 
                  marginTop: '4px', fontFamily: 'var(--font-inter)' 
                }}>5</span>
              </motion.button>
            </div>

            {/* ── شريط التحكم السفلي (LTR لشريط التقدم) ── */}
            <div style={{ padding: '0 20px env(safe-area-inset-bottom, 32px)' }}>
              {/* شريط التقدم */}
              <div
                style={{
                  position: 'relative', height: '4px', marginBottom: '16px',
                  background: 'rgba(255,255,255,0.2)', borderRadius: '2px',
                  cursor: 'pointer',
                }}
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current) videoRef.current.currentTime = ratio * duration;
                }}
              >
                {/* المُحمَّل */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: `${buffered}%`, background: 'rgba(255,255,255,0.15)',
                  borderRadius: '2px', transition: 'width 0.3s',
                }} />
                {/* المُشاهَد */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: `${progress}%`,
                  background: 'linear-gradient(to right, #5565af, #a8b3e5)',
                  borderRadius: '2px', transition: 'width 0.1s',
                }} />
                {/* المؤشر */}
                <div style={{
                  position: 'absolute', top: '50%',
                  left: `${progress}%`, transform: 'translate(-50%, -50%)',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#a8b3e5', boxShadow: '0 0 8px rgba(85, 101, 175, 0.6)',
                  transition: 'left 0.1s',
                }} />
              </div>

              {/* صف الأدوات — LTR للأيقونات */}
              <div dir="ltr" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* تشغيل/إيقاف */}
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={togglePlay} style={ctrlBtnStyle} aria-label={playing ? 'إيقاف' : 'تشغيل'}
                >
                  {playing ? <Pause size={18} /> : <Play size={18} />}
                </motion.button>

                {/* الصوت */}
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={toggleMute} style={ctrlBtnStyle} aria-label={muted ? 'رفع الصوت' : 'كتم'}
                >
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </motion.button>

                {/* شريط الصوت */}
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={muted ? 0 : volume}
                  onChange={e => changeVolume(parseFloat(e.target.value))}
                  style={{ width: '80px', accentColor: '#5565af', cursor: 'pointer' }}
                  aria-label="مستوى الصوت"
                />

                {/* الوقت */}
                <span style={{
                  fontFamily: 'var(--font-inter)', fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)', marginLeft: '8px',
                  whiteSpace: 'nowrap',
                }}>
                  {formatTime(current)} / {formatTime(duration)}
                </span>

                {/* فراغ */}
                <div style={{ flex: 1 }} />

                {/* الإعدادات */}
                <div style={{ position: 'relative' }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(v => !v)}
                    style={ctrlBtnStyle} aria-label="الإعدادات"
                  >
                    <Settings size={18} />
                  </motion.button>
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="glass-strong"
                        style={{
                          position: 'absolute', bottom: '48px',
                          right: 0,
                          minWidth: '160px', borderRadius: 'var(--radius-lg)',
                          padding: '8px', zIndex: 10,
                        }}
                      >
                        <p style={{
                          padding: '8px 12px', color: 'var(--on-surface-variant)',
                          fontFamily: 'var(--font-arabic)', fontSize: '12px',
                          fontWeight: '600', letterSpacing: '0',
                        }}>الجودة</p>
                        {['Auto', '1080p', '720p', '480p'].map(q => (
                          <button
                            key={q}
                            onClick={() => { setQuality(q); setShowSettings(false); }}
                            style={{
                              display: 'block', width: '100%', textAlign: 'start',
                              padding: '8px 12px', borderRadius: 'var(--radius)',
                              background: q === quality ? 'rgba(85, 101, 175, 0.2)' : 'transparent',
                              color: q === quality ? 'var(--primary)' : 'var(--on-surface)',
                              fontFamily: 'var(--font-arabic)', fontSize: '13px',
                              border: 'none', cursor: 'pointer',
                            }}
                          >
                            {QUALITY_LABELS[q] ?? q}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ملء الشاشة */}
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  style={ctrlBtnStyle}
                  aria-label={fullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
                >
                  {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        </>
      )}

      {/* ── شاشة إجبار الاتجاه الأفقي (الجوال - الوضع العمودي) ── */}
      <div className="force-landscape-overlay" style={{ display: 'none' }}>
        <div style={{ fontSize: '48px' }}>📱</div>
        <p style={{
          fontFamily: 'var(--font-arabic)', fontSize: '16px', textAlign: 'center',
          maxWidth: '220px', color: 'var(--on-surface-variant)',
        }}>
          يُرجى تدوير الجهاز للمشاهدة بأفضل تجربة
        </p>
      </div>
    </div>
  );
}

const ctrlBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
};
const ctrlBtnLargeStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '52px', height: '52px', borderRadius: 'var(--radius-full)',
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
};
