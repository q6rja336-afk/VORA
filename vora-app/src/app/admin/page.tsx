'use client';

import React, { useEffect, useState } from 'react';
import { getAllContent, deleteContent } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Search, ExternalLink, Film, Tv, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await getAllContent();
      if (data) {
        setContent(data);
      }
    } catch (err) {
      console.error('Database connection failed.');
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
      try {
        await deleteContent(id);
        setContent(content.filter(item => item.id !== id));
      } catch (err) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.title_ar && item.title_ar.includes(searchTerm))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>إدارة المحتوى</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>إجمالي المواد: {content.length}</p>
        </div>
        
        <Link href="/admin/new">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(77,197,123,0.3)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 24px', 
              background: 'linear-gradient(135deg, #4dc57b 0%, #3ba665 100%)', 
              color: '#fff',
              border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 10px 20px rgba(77,197,123,0.15)'
            }}
          >
            <Plus size={18} />
            إضافة جديد
          </motion.button>
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <Search size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
        <input
          type="text"
          placeholder="ابحث بالعنوان..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '16px 52px 16px 16px',
            background: 'var(--surface-container)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px', color: '#fff', fontSize: '16px', outline: 'none'
          }}
        />
      </div>

      {/* Content Table */}
      <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={thStyle}>المحتوى</th>
              <th style={thStyle}>النوع</th>
              <th style={thStyle}>السنة</th>
              <th style={thStyle}>التقييم</th>
              <th style={thStyle}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={item.poster_url} alt="" style={{ width: '48px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{item.title_ar ?? item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '2px' }}>{item.title}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--on-surface-variant)' }}>
                    {item.type === 'movie' ? <Film size={14} /> : <Tv size={14} />}
                    {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
                  </div>
                </td>
                <td style={tdStyle}>{item.year}</td>
                <td style={tdStyle}>
                  <span style={{ color: '#ffd700', fontWeight: '700' }}>★ {item.score}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/admin/edit/${item.id}`}>
                      <button style={actionBtnStyle} title="تعديل"><Edit2 size={16} /></button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ ...actionBtnStyle, color: '#f87171' }} 
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link href={`/details/${item.id}`}>
                      <button style={actionBtnStyle} title="عرض"><ExternalLink size={16} /></button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredContent.length === 0 && !loading && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--outline)' }}>
            لا يوجد محتوى متوافق مع البحث
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '20px 24px',
  color: 'var(--outline)',
  fontWeight: '600',
  fontSize: '14px'
};

const tdStyle: React.CSSProperties = {
  padding: '20px 24px',
  color: 'var(--on-surface)'
};

const actionBtnStyle: React.CSSProperties = {
  width: '36px', height: '36px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)', border: 'none',
  color: 'var(--on-surface-variant)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.2s'
};
