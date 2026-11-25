import React from 'react';
import { Files, HardDrive, Tags, ShieldCheck, Clock, FileText } from 'lucide-react';

export default function ScanStats({ stats, warnings }) {
  if (!stats) return null;

  const categories = Object.entries(stats.category_counts || {});

  return (
    <section className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--sage-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Files size={18} style={{ color: 'var(--sage-700)' }} />
          <span>Scan Statistics & Metadata Overview</span>
        </h3>
        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={13} />
          <span>Scanned in {stats.scan_duration_ms} ms</span>
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Total Files */}
        <div style={{
          background: 'var(--cream-50)',
          border: '1px solid var(--cream-200)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--sage-100)',
            color: 'var(--sage-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Files size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sage-900)', lineHeight: 1.1 }}>
              {stats.total_files}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Total Files Scanned
            </div>
          </div>
        </div>

        {/* Total Size */}
        <div style={{
          background: 'var(--cream-50)',
          border: '1px solid var(--cream-200)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--cream-200)',
            color: 'var(--sage-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HardDrive size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sage-900)', lineHeight: 1.1 }}>
              {stats.total_size_formatted}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Total Storage Volume
            </div>
          </div>
        </div>

        {/* Categories Count */}
        <div style={{
          background: 'var(--cream-50)',
          border: '1px solid var(--cream-200)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: '#EDE9FE',
            color: '#6D28D9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Tags size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sage-900)', lineHeight: 1.1 }}>
              {categories.length}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Target Categories
            </div>
          </div>
        </div>

        {/* Sensitive Protected */}
        <div style={{
          background: stats.sensitive_files_skipped > 0 ? 'var(--green-100)' : 'var(--cream-50)',
          border: `1px solid ${stats.sensitive_files_skipped > 0 ? 'var(--green-500)' : 'var(--cream-200)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: '#FFFFFF',
            color: 'var(--green-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sage-900)', lineHeight: 1.1 }}>
              {stats.sensitive_files_skipped}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Protected Sensitive Files (.env, keys)
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Breakdown */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.25rem' }}>
            Detected types:
          </span>
          {categories.map(([cat, count]) => (
            <span
              key={cat}
              className={`badge badge-${cat.toLowerCase()}`}
              style={{ padding: '0.3rem 0.65rem' }}
            >
              <span>{cat}</span>
              <strong style={{ opacity: 0.85 }}>({count})</strong>
            </span>
          ))}
        </div>
      )}

      {/* Warnings Banner if any */}
      {warnings && warnings.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--amber-100)', borderRadius: 'var(--radius-sm)', color: 'var(--amber-600)', fontSize: '0.825rem' }}>
          {warnings.map((w, idx) => (
            <div key={idx}>⚠️ {w}</div>
          ))}
        </div>
      )}
    </section>
  );
}
