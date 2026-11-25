import React from 'react';
import { ShieldCheck, Cpu, Settings, History, Sparkles, FolderSync } from 'lucide-react';

export default function Navbar({ aiStatus, onOpenSettings, onOpenHistory, onOpenAbout }) {
  const isRealAi = aiStatus?.mode === 'real_ollama';

  return (
    <header className="navbar-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 2rem',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Mascot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--sage-700), var(--sage-850))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(32, 54, 43, 0.25)',
          fontSize: '1.75rem',
          userSelect: 'none'
        }} className="animate-sway">
          🦥
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--sage-900)' }}>
              SlothSort AI
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: 'var(--cream-200)',
              color: 'var(--sage-800)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)'
            }}>
              Slow and Steady 2026
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Privacy-First Offline AI File Organizer • Local Open-Weight Intelligence
          </p>
        </div>
      </div>

      {/* Badges and Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* 100% Local Privacy Pill */}
        <div id="privacy-pill" className="badge badge-privacy" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
          <ShieldCheck size={14} style={{ color: 'var(--sage-700)' }} />
          <span>100% Local & Offline</span>
        </div>

        {/* Ollama Status Pill */}
        <div 
          id="ollama-status-pill"
          onClick={onOpenSettings}
          title="Click to configure local AI model settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: isRealAi ? 'var(--green-100)' : 'var(--amber-100)',
            color: isRealAi ? 'var(--green-600)' : 'var(--amber-600)',
            border: `1px solid ${isRealAi ? 'var(--green-500)' : 'var(--amber-500)'}`
          }}
        >
          <Cpu size={14} />
          {isRealAi ? (
            <span>Ollama: {aiStatus.model_configured}</span>
          ) : (
            <span>Demo Mode (Simulated AI)</span>
          )}
        </div>

        {/* History / Undo Button */}
        <button
          id="btn-navbar-history"
          className="btn btn-secondary btn-sm"
          onClick={onOpenHistory}
          title="View operation change log and roll back operations"
        >
          <History size={15} />
          <span>History & Undo</span>
        </button>

        {/* Settings Button */}
        <button
          id="btn-navbar-settings"
          className="btn btn-outline btn-sm"
          onClick={onOpenSettings}
          title="Configure local model, dry-run, and paths"
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
