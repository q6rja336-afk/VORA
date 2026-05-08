'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchTMDBMetadata } from '@/lib/tmdb';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Save, Film, Tv, Type, AlignLeft, Star, 
  Calendar, Globe, Clock, Layers, Image as ImageIcon, 
  Video, Plus, ChevronDown, ChevronUp, Loader2, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface SeasonData {
  seasonNumber: number;
  episodes: string[];
}

export default function EditContentPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'movie',
    genre: [] as string[],
    year: new Date().getFullYear(),
    rating: 'PG-13',
    score: 0,
    duration: '',
    language: 'العربية',
    seasons: 1,
    episodes: 0,
    poster_url: '',
    backdrop_url: '',
    video_url: '',
    seasons_data: [] as SeasonData[],
    is_featured: false,
    is_trending: false,
    is_new: true,
    imdb_id: '',
  });

  const [genreInput, setGenreInput] = useState('');
  const [expandedSeason, setExpandedSeason] = useState<number | null>(1);

  useEffect(() => {
    fetchContent();
  }, [id]);

  useEffect(() => {
    if (formData.type === 'series') {
      const currentSeasonsCount = formData.seasons_data?.length || 0;
      const targetSeasonsCount = formData.seasons || 0;

      if (targetSeasonsCount > currentSeasonsCount) {
        const newSeasons = [...(formData.seasons_data || [])];
        for (let i = currentSeasonsCount; i < targetSeasonsCount; i++) {
          newSeasons.push({ seasonNumber: i + 1, episodes: [] });
        }
        setFormData(prev => ({ ...prev, seasons_data: newSeasons }));
      } else if (targetSeasonsCount < currentSeasonsCount && targetSeasonsCount >= 0) {
        setFormData(prev => ({ ...prev, seasons_data: prev.seasons_data.slice(0, targetSeasonsCount) }));
      }
    }
  }, [formData.seasons, formData.type]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase.from('content').select('*').eq('id', id).single();
      if (data) {
        const type = (data.type || 'movie').toLowerCase();
        const seasons = data.seasons || 0;
        let finalSeasonsData = data.seasons_data || [];
        
        if (type === 'series' && finalSeasonsData.length === 0 && seasons > 0) {
          for (let i = 0; i < seasons; i++) {
            finalSeasonsData.push({ seasonNumber: i + 1, episodes: [] });
          }
        }

        setFormData({
          ...data,
          type,
          seasons,
          genre: data.genre || [],
          seasons_data: finalSeasonsData,
        });
      }
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!formData.imdb_id) {
      alert('يرجى إدخال كود IMDb أولاً (مثلاً: tt1234567)');
      return;
    }
    setSyncing(true);
    try {
      const meta = await fetchTMDBMetadata(formData.imdb_id);
      if (meta) {
        // Merge seasons data logic (similar to WatchPage)
        let mergedSeasons = formData.seasons_data || [];
        if (meta.type === 'series' && meta.seasonsData) {
          mergedSeasons = meta.seasonsData.map((tmdbS: any) => {
            const existingS = mergedSeasons.find((s: any) => s.seasonNumber === tmdbS.seasonNumber);
            if (existingS) {
              const mergedEpisodes = tmdbS.episodes.map((_: any, idx: number) => existingS.episodes[idx] || "");
              return { ...tmdbS, episodes: mergedEpisodes };
            }
            return tmdbS;
          });
        }

        setFormData(prev => ({
          ...prev,
          title: meta.titleAr || prev.title,
          description: meta.description || prev.description,
          year: meta.year || prev.year,
          score: meta.score || prev.score,
          backdrop_url: meta.backdropUrl || prev.backdrop_url,
          poster_url: meta.posterUrl || prev.poster_url,
          type: meta.type || prev.type,
          seasons: meta.type === 'series' ? meta.seasonsData?.length : prev.seasons,
          seasons_data: mergedSeasons
        }));
        alert('تمت مزامنة البيانات بنجاح من TMDB!');
      } else {
        alert('لم يتم العثور على بيانات لهذا الكود.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء المزامنة.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = { ...formData };
      if (formData.type === 'movie') {
        dataToSave.seasons_data = [];
        dataToSave.seasons = 0;
        dataToSave.episodes = 0;
      } else {
        dataToSave.video_url = '';
        dataToSave.episodes = formData.seasons_data.reduce((acc, s) => acc + s.episodes.length, 0);
      }

      const { error } = await supabase
        .from('content')
        .update(dataToSave)
        .eq('id', id);

      if (error) throw error;
      router.push('/admin');
    } catch (err: any) {
      alert('حدث خطأ أثناء التحديث: ' + (err.message || 'خطأ غير معروف'));
      setSaving(false);
    }
  };

  const handleAddGenre = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && genreInput.trim()) {
      e.preventDefault();
      if (!formData.genre.includes(genreInput.trim())) {
        setFormData({ ...formData, genre: [...formData.genre, genreInput.trim()] });
      }
      setGenreInput('');
    }
  };

  const removeGenre = (g: string) => {
    setFormData({ ...formData, genre: formData.genre.filter(item => item !== g) });
  };

  const updateSeasonEpisodesCount = (seasonIdx: number, count: number) => {
    const newData = [...formData.seasons_data];
    const currentEpisodes = [...newData[seasonIdx].episodes];
    
    if (currentEpisodes.length < count) {
      for (let i = currentEpisodes.length; i < count; i++) {
        currentEpisodes.push('');
      }
    } else {
      newData[seasonIdx].episodes = currentEpisodes.slice(0, count);
    }
    
    newData[seasonIdx].episodes = currentEpisodes;
    setFormData({ ...formData, seasons_data: newData });
  };

  const updateEpisodeUrl = (seasonIdx: number, epIdx: number, url: string) => {
    const newData = [...formData.seasons_data];
    newData[seasonIdx].episodes[epIdx] = url;
    setFormData({ ...formData, seasons_data: newData });
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div className="loader"></div>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '40px' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', textDecoration: 'none', marginBottom: '16px', fontWeight: '600' }}>
          <ArrowRight size={18} />
          العودة للمخزون
        </Link>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>تعديل المحتوى</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <FormSection title="المعلومات الأساسية">
          <FormInput label="العنوان" icon={<Type size={16} />} value={formData.title} onChange={(v: string) => setFormData({...formData, title: v})} placeholder="اسم الفيلم أو المسلسل..." />
          
          <div style={grid2Style}>
            <FormSelect label="النوع" icon={formData.type === 'movie' ? <Film size={16} /> : <Tv size={16} />} value={formData.type} onChange={(v: string) => setFormData({...formData, type: v})}>
              <option value="movie">فيلم</option>
              <option value="series">مسلسل</option>
            </FormSelect>
            <FormInput label="اللغة" icon={<Globe size={16} />} value={formData.language} onChange={(v: string) => setFormData({...formData, language: v})} />
          </div>

          <FormTextArea label="الوصف" icon={<AlignLeft size={16} />} value={formData.description} onChange={(v: string) => setFormData({...formData, description: v})} placeholder="اكتب وصفاً مختصراً باللغة العربية..." />
        </FormSection>

        <FormSection title="بيانات العمل">
          <div style={grid3Style}>
            <FormInput label="السنة" icon={<Calendar size={16} />} type="number" value={formData.year} onChange={(v: string) => setFormData({...formData, year: parseInt(v)})} />
            <FormInput label="التقييم (IMDb)" icon={<Star size={16} />} type="number" step="0.1" value={formData.score} onChange={(v: string) => setFormData({...formData, score: parseFloat(v)})} />
            <FormInput label="المدة (للفيلم)" icon={<Clock size={16} />} value={formData.duration} onChange={(v: string) => setFormData({...formData, duration: v})} />
          </div>

          {formData.type === 'series' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
               <FormInput label="عدد المواسم" icon={<Layers size={16} />} type="number" value={formData.seasons} onChange={(v: string) => setFormData({...formData, seasons: parseInt(v)})} />
            </motion.div>
          )}

          <div>
            <label style={labelStyle}>التصنيفات (اضغط Enter للإضافة)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {formData.genre.map(g => (
                <span key={g} style={chipStyle}>
                  {g} <button type="button" onClick={() => removeGenre(g)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '4px' }}>×</button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              value={genreInput} 
              onChange={e => setGenreInput(e.target.value)} 
              onKeyDown={handleAddGenre}
              style={inputStyle}
              placeholder="مثلاً: أكشن، دراما..."
            />
          </div>
        </FormSection>

        <FormSection title="الوسائط">
          <div style={grid2Style}>
            <FormInput label="رابط البوستر (Poster URL)" icon={<ImageIcon size={16} />} value={formData.poster_url} onChange={(v: string) => setFormData({...formData, poster_url: v})} />
            <FormInput label="رابط الخلفية (Backdrop URL)" icon={<ImageIcon size={16} />} value={formData.backdrop_url} onChange={(v: string) => setFormData({...formData, backdrop_url: v})} />
          </div>
        </FormSection>

        <FormSection title="المزامنة الذكية (TMDB)">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <FormInput 
              label="IMDb ID" 
              icon={<Globe size={16} />} 
              value={formData.imdb_id} 
              onChange={(v: string) => setFormData({...formData, imdb_id: v})} 
              placeholder="أدخل كود IMDb (مثلاً: tt2149175)" 
            />
            <button 
              type="button" 
              onClick={handleSync} 
              disabled={syncing}
              style={{
                padding: '14px 24px', borderRadius: '16px', background: 'var(--primary-container)', 
                border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '2px', fontWeight: '700', transition: 'all 0.3s',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              {syncing ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
              {syncing ? 'جاري المزامنة...' : 'مزامنة البيانات والحلقات'}
            </button>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '-12px', opacity: 0.8 }}>
            * سيتم جلب العناوين، الوصف، سنة الإنتاج، وقائمة الحلقات والمواسم تلقائياً من TMDB.
          </p>
        </FormSection>

        <FormSection title={formData.type === 'series' ? "إدارة المواسم والحلقات" : "روابط الفيلم"}>
          {formData.type === 'series' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {formData.seasons_data && formData.seasons_data.length > 0 ? (
                formData.seasons_data.map((season, sIdx) => (
                  <div key={sIdx} style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden'
                  }}>
                    <button 
                      type="button"
                      onClick={() => setExpandedSeason(expandedSeason === sIdx + 1 ? null : sIdx + 1)}
                      style={{
                        width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: expandedSeason === sIdx + 1 ? 'rgba(255,255,255,0.03)' : 'transparent',
                        border: 'none', cursor: 'pointer', color: '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Layers size={18} color="var(--primary)" />
                        <span style={{ fontWeight: '700', fontSize: '16px' }}>الموسم {season.seasonNumber}</span>
                        <span style={{ fontSize: '13px', opacity: 0.5 }}>({season.episodes.length} حلقة)</span>
                      </div>
                      {expandedSeason === sIdx + 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    <AnimatePresence>
                      {expandedSeason === sIdx + 1 && (
                        <motion.div 
                          initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                              <FormInput 
                                label="عدد حلقات هذا الموسم" 
                                type="number" 
                                value={season.episodes.length} 
                                onChange={(v: string) => updateSeasonEpisodesCount(sIdx, parseInt(v) || 0)} 
                              />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              {season.episodes.map((url, epIdx) => (
                                <FormInput 
                                  key={epIdx}
                                  label={`الحلقة ${epIdx + 1}`} 
                                  icon={<Video size={14} />} 
                                  value={url} 
                                  onChange={(v: string) => updateEpisodeUrl(sIdx, epIdx, v)} 
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--outline)', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  يرجى تحديد عدد المواسم في قسم "بيانات العمل" أولاً لفتح الحقول.
                </div>
              )}
            </div>
          ) : (
            <FormInput label="رابط الفيديو (Video URL)" icon={<Video size={16} />} value={formData.video_url} onChange={(v: string) => setFormData({...formData, video_url: v})} />
          )}
        </FormSection>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={saving}
          type="submit"
          style={submitButtonStyle}
        >
          {saving ? 'جاري الحفظ...' : (
            <>
              <Save size={20} />
              حفظ التعديلات
            </>
          )}
        </motion.button>

      </form>
    </div>
  );
}

function FormSection({ title, children }: any) {
  return (
    <div className="glass" style={{ padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '24px', borderRight: '4px solid var(--primary)', paddingRight: '12px' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>{children}</div>
    </div>
  );
}

function FormInput({ label, icon, value, onChange, type = 'text', required = false, step = '1', placeholder = '' }: any) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }}>{icon}</div>}
        <input 
          type={type} 
          step={step}
          value={value} 
          onChange={e => onChange(e.target.value)} 
          required={required}
          placeholder={placeholder}
          style={{ ...inputStyle, paddingRight: icon ? '44px' : '16px' }}
        />
      </div>
    </div>
  );
}

function FormTextArea({ label, icon, value, onChange, required = false, placeholder = '' }: any) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', right: '16px', top: '20px', color: 'var(--outline)' }}>{icon}</div>
        <textarea 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          required={required}
          placeholder={placeholder}
          style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
        />
      </div>
    </div>
  );
}

function FormSelect({ label, icon, value, onChange, children }: any) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ 
            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', 
            color: 'var(--primary)', zIndex: 2, pointerEvents: 'none', display: 'flex', alignItems: 'center'
          }}>
            {icon}
          </div>
        )}
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          style={{ ...inputStyle, paddingRight: icon ? '48px' : '16px', appearance: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}
        >
          {children}
        </select>
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--outline)', zIndex: 2, opacity: 0.5 }}>
          <ChevronDown size={16} />
        </div>
      </div>
      <style jsx>{`
        select option { background-color: #12131c; color: #ffffff; padding: 12px; }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--on-surface-variant)', marginBottom: '10px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'all 0.3s', fontFamily: 'inherit' };
const grid2Style: React.CSSProperties = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const grid3Style: React.CSSProperties = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const chipStyle: React.CSSProperties = { padding: '6px 12px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center' };
const submitButtonStyle: React.CSSProperties = { padding: '20px', background: 'linear-gradient(135deg, #4f61ff 0%, #3648e8 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(79, 97, 255, 0.35)', marginTop: '20px', transition: 'all 0.3s ease' };
