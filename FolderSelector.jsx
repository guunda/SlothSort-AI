import React, { useState } from 'react';
import { Folder, FolderSearch, Sparkles, AlertCircle, CheckCircle, RefreshCw, ShieldAlert } from 'lucide-react';

export default function FolderSelector({
  folderPath,
  setFolderPath,
  onScan,
  isScanning,
  includeSubfolders,
  setIncludeSubfolders,
  includeHidden,
  setIncludeHidden,
  onNotification
}) {
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [isCreatingSample, setIsCreatingSample] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Browse folder using native Windows picker
  const handleBrowse = async () => {
    setIsBrowsing(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/browse-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_path: folderPath, use_dialog: true })
      });
      const data = await resp.json();
      if (data.is_valid && data.selected_path) {
        setFolderPath(data.selected_path);
        onNotification({ type: 'success', message: `Folder selected: ${data.selected_path}` });
      } else if (data.message && !data.message.includes('cancelled')) {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(`Browse error: ${err.message}. You can also type or paste the path directly.`);
    } finally {
      setIsBrowsing(false);
    }
  };

  // Create Safe Demo Folder in workspace
  const handleCreateSampleFolder = async () => {
    setIsCreatingSample(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/sample-folder', { method: 'POST' });
      const data = await resp.json();
      if (data.folder_path) {
        setFolderPath(data.folder_path);
        onNotification({
          type: 'success',
          message: `Created sample demo folder with ${data.files_created} files! Click 'Scan Files' to test.`
        });
      }
    } catch (err) {
      setErrorMsg(`Failed to create sample folder: ${err.message}`);
    } finally {
      setIsCreatingSample(false);
    }
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!folderPath.trim()) {
      setErrorMsg('Please enter or select a folder path to scan.');
      return;
    }
    setErrorMsg('');
    onScan(folderPath.trim());
  };

  return (
    <section className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--sage-100)',
            color: 'var(--sage-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Folder size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--sage-900)' }}>
              Step 1: Select Target Folder
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              All file operations are strictly confined within this selected boundary.
            </p>
          </div>
        </div>

        {/* Quick Sample Button */}
        <button
          id="btn-create-sample-mess"
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleCreateSampleFolder}
          disabled={isCreatingSample || isScanning}
          title="Generates a mock messy folder with documents, images, code, and sensitive files for zero-risk testing"
        >
          {isCreatingSample ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} style={{ color: 'var(--terracotta-500)' }} />}
          <span>Create Demo Test Folder</span>
        </button>
      </div>

      <form onSubmit={handleScanSubmit}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <input
              id="input-folder-path"
              type="text"
              value={folderPath}
              onChange={(e) => {
                setFolderPath(e.target.value);
                setErrorMsg('');
              }}
              placeholder="e.g. C:\Users\Username\Downloads or paste folder path..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.925rem',
                borderRadius: 'var(--radius-md)',
                border: errorMsg ? '2px solid var(--terracotta-500)' : '1px solid var(--border-light)',
                background: '#FFFFFF',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
              }}
            />
          </div>

          {/* Windows Browse Button */}
          <button
            id="btn-browse-folder"
            type="button"
            className="btn btn-secondary"
            onClick={handleBrowse}
            disabled={isBrowsing || isScanning}
            title="Open native Windows folder selection dialog"
          >
            {isBrowsing ? <RefreshCw size={16} className="animate-spin" /> : <Folder size={16} />}
            <span>Browse Folder...</span>
          </button>

          {/* Scan Button */}
          <button
            id="btn-scan-files"
            type="submit"
            className="btn btn-primary"
            disabled={isScanning || !folderPath.trim()}
          >
            {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <FolderSearch size={16} />}
            <span>{isScanning ? 'Scanning...' : 'Scan Files'}</span>
          </button>
        </div>

        {/* Options & Safety Indicators */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                id="toggle-include-subfolders"
                type="checkbox"
                checked={includeSubfolders}
                onChange={(e) => setIncludeSubfolders(e.target.checked)}
                style={{ accentColor: 'var(--sage-700)', width: '16px', height: '16px' }}
              />
              <span>Include subfolders (recursive scan)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                id="toggle-include-hidden"
                type="checkbox"
                checked={includeHidden}
                onChange={(e) => setIncludeHidden(e.target.checked)}
                style={{ accentColor: 'var(--sage-700)', width: '16px', height: '16px' }}
              />
              <span>Include hidden files</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={14} style={{ color: 'var(--sage-600)' }} />
            <span>Root drives (C:\) and Windows system folders are automatically blocked for safety.</span>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--terracotta-100)',
            color: 'var(--terracotta-600)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </section>
  );
}
