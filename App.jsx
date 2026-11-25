import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FolderSelector from './components/FolderSelector';
import ScanStats from './components/ScanStats';
import PlanPreview from './components/PlanPreview';
import ExecutionSummary from './components/ExecutionSummary';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import {
  Folder, Search, Sparkles, CheckCircle2, RotateCcw,
  Shield, AlertTriangle, Check, X, Heart
} from 'lucide-react';

export default function App() {
  const [folderPath, setFolderPath] = useState('');
  const [includeSubfolders, setIncludeSubfolders] = useState(false);
  const [includeHidden, setIncludeHidden] = useState(false);

  // Status & Data
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState(null);

  const [isPlanning, setIsPlanning] = useState(false);
  const [planData, setPlanData] = useState(null);

  const [isApplying, setIsApplying] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const [isUndoing, setIsUndoing] = useState(false);

  // Settings
  const [dryRun, setDryRun] = useState(true);
  const [collisionStrategy, setCollisionStrategy] = useState('rename');
  const [aiStatus, setAiStatus] = useState(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast Notification
  const [notification, setNotification] = useState(null);

  const showNotification = ({ type, message }) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Fetch AI status on mount
  const fetchAiStatus = async () => {
    try {
      const resp = await fetch('/api/ai/status');
      const data = await resp.json();
      setAiStatus(data);
    } catch (err) {
      console.warn('Failed to fetch AI status:', err);
    }
  };

  useEffect(() => {
    fetchAiStatus();
  }, []);

  // Scan folder
  const handleScan = async (path) => {
    setIsScanning(true);
    setScanData(null);
    setPlanData(null);
    setExecutionResult(null);

    try {
      const resp = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder_path: path,
          include_subfolders: includeSubfolders,
          include_hidden: includeHidden,
          max_files: 500
        })
      });

      if (!resp.ok) {
        const errorJson = await resp.json();
        throw new Error(errorJson.detail || 'Scan failed.');
      }

      const data = await resp.json();
      setScanData(data);
      showNotification({
        type: 'success',
        message: `Found ${data.stats.total_files} files (${data.stats.total_size_formatted})!`
      });
    } catch (err) {
      showNotification({ type: 'error', message: err.message });
    } finally {
      setIsScanning(false);
    }
  };

  // Generate Plan
  const handleGeneratePlan = async ({ forceDemoMode }) => {
    if (!scanData || !scanData.files) {
      showNotification({ type: 'error', message: 'Please scan a folder first.' });
      return;
    }

    setIsPlanning(true);
    setExecutionResult(null);

    try {
      const resp = await fetch('/api/organize/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder_path: scanData.folder_path,
          files: scanData.files,
          force_demo_mode: forceDemoMode
        })
      });

      if (!resp.ok) {
        const errorJson = await resp.json();
        throw new Error(errorJson.detail || 'Planning failed.');
      }

      const data = await resp.json();
      setPlanData(data);
      showNotification({
        type: 'success',
        message: `Plan prepared: ${data.items.length} files organized into categories!`
      });
    } catch (err) {
      showNotification({ type: 'error', message: err.message });
    } finally {
      setIsPlanning(false);
    }
  };

  // Apply Plan
  const handleApplyPlan = async (itemsToApply) => {
    if (!itemsToApply || itemsToApply.length === 0) {
      showNotification({ type: 'error', message: 'No items selected for execution.' });
      return;
    }

    setIsApplying(true);

    try {
      const resp = await fetch('/api/organize/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder_path: folderPath,
          items: itemsToApply,
          dry_run: dryRun,
          collision_strategy: collisionStrategy
        })
      });

      if (!resp.ok) {
        const errorJson = await resp.json();
        throw new Error(errorJson.detail || 'Execution failed.');
      }

      const data = await resp.json();
      setExecutionResult(data);

      if (data.dry_run) {
        showNotification({
          type: 'success',
          message: `Dry-run completed safely: ${data.success_count} moves verified.`
        });
      } else {
        showNotification({
          type: 'success',
          message: `Successfully organized ${data.success_count} files on disk!`
        });
        // Refresh scan to show updated structure
        handleScan(folderPath);
      }
    } catch (err) {
      showNotification({ type: 'error', message: err.message });
    } finally {
      setIsApplying(false);
    }
  };

  // Undo batch
  const handleUndo = async (batchId) => {
    setIsUndoing(true);
    try {
      const resp = await fetch('/api/organize/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId })
      });
      const data = await resp.json();
      if (data.success) {
        showNotification({ type: 'success', message: data.message });
        setExecutionResult(null);
        // Refresh scan
        handleScan(folderPath);
      } else {
        showNotification({ type: 'error', message: data.message || 'Undo operation failed.' });
      }
    } catch (err) {
      showNotification({ type: 'error', message: `Undo failed: ${err.message}` });
    } finally {
      setIsUndoing(false);
    }
  };

  // Active step calculation
  const currentStep = executionResult
    ? 4
    : planData
    ? 3
    : scanData
    ? 2
    : 1;

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 2000,
          background: notification.type === 'error' ? 'var(--terracotta-500)' : 'var(--sage-800)',
          color: '#FFFFFF',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          animation: 'pulseSubtle 0.3s ease'
        }}>
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: '0.5rem', opacity: 0.8 }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        aiStatus={aiStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Workflow Stepper */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          {[
            { num: 1, label: 'Select Folder', icon: Folder },
            { num: 2, label: 'Scan Files', icon: Search },
            { num: 3, label: 'Preview & Approve', icon: Sparkles },
            { num: 4, label: 'Done / Rollback', icon: CheckCircle2 }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;

            return (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: isActive
                    ? 'var(--sage-800)'
                    : isDone
                    ? 'var(--sage-100)'
                    : 'transparent',
                  color: isActive
                    ? '#FFFFFF'
                    : isDone
                    ? 'var(--sage-800)'
                    : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isActive ? 'rgba(255,255,255,0.25)' : isDone ? 'var(--sage-200)' : 'var(--cream-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.725rem'
                }}>
                  {isDone ? '✓' : s.num}
                </div>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Sloth Philosophy Welcome Card */}
        <div style={{
          marginBottom: '1.75rem',
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(135deg, rgba(232, 242, 236, 0.8), rgba(246, 241, 231, 0.9))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--sage-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.4rem' }}>🦥</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sage-900)' }}>
                Slow and Steady Keeps Your Files Safe
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                No rush, no automatic destructive edits, and no cloud uploads. Inspect every single rename and rollback with 1-click at any time.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-privacy">
              <Shield size={13} />
              <span>Offline First</span>
            </span>
            <span className="badge" style={{ background: 'var(--cream-200)', color: 'var(--sage-900)' }}>
              Dry-Run Default
            </span>
          </div>
        </div>

        {/* Step 1: Folder Selector */}
        <FolderSelector
          folderPath={folderPath}
          setFolderPath={setFolderPath}
          onScan={handleScan}
          isScanning={isScanning}
          includeSubfolders={includeSubfolders}
          setIncludeSubfolders={setIncludeSubfolders}
          includeHidden={includeHidden}
          setIncludeHidden={setIncludeHidden}
          onNotification={showNotification}
        />

        {/* Step 2: Scan Stats */}
        {scanData && (
          <ScanStats stats={scanData.stats} warnings={scanData.warnings} />
        )}

        {/* Execution Summary if applied or dry-run run */}
        {executionResult && (
          <ExecutionSummary
            result={executionResult}
            onUndo={handleUndo}
            isUndoing={isUndoing}
            onDismiss={() => setExecutionResult(null)}
          />
        )}

        {/* Step 3: Plan Preview & Approval */}
        {scanData && (
          <PlanPreview
            plan={planData}
            onGeneratePlan={handleGeneratePlan}
            isPlanning={isPlanning}
            aiStatus={aiStatus}
            onApplyPlan={handleApplyPlan}
            isApplying={isApplying}
            dryRun={dryRun}
            setDryRun={setDryRun}
            collisionStrategy={collisionStrategy}
            setCollisionStrategy={setCollisionStrategy}
          />
        )}
      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onNotification={showNotification}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aiStatus={aiStatus}
        onRefreshAiStatus={fetchAiStatus}
        onNotification={showNotification}
      />

      {/* Footer */}
      <footer style={{
        padding: '1.5rem 2rem',
        borderTop: '1px solid var(--border-light)',
        background: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
          <span>Built for Hacktoberfest 2026: <strong>Slow and Steady</strong></span>
          <span>•</span>
          <span>Open-Weight Local AI</span>
          <span>•</span>
          <span>Zero Telemetry</span>
        </div>
        <div>
          SlothSort AI is open-source under the MIT License • <a href="https://github.com/guunda/SlothSort-AI" target="_blank" rel="noreferrer" style={{ color: 'var(--sage-700)', textDecoration: 'underline', fontWeight: 600 }}>GitHub: guunda/SlothSort-AI</a>
        </div>
      </footer>
    </div>
  );
}
