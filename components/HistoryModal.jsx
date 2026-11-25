import React, { useState, useEffect } from 'react';
import { History, X, RotateCcw, CheckCircle, RefreshCw, Folder } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, onNotification }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [undoingBatchId, setUndoingBatchId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/history');
      const data = await resp.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleUndo = async (batchId) => {
    setUndoingBatchId(batchId);
    try {
      const resp = await fetch('/api/organize/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId })
      });
      const data = await resp.json();
      if (data.success) {
        onNotification({ type: 'success', message: data.message });
        fetchHistory();
      } else {
        onNotification({ type: 'error', message: data.message || 'Undo operation failed.' });
      }
    } catch (err) {
      onNotification({ type: 'error', message: `Undo request failed: ${err.message}` });
    } finally {
      setUndoingBatchId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--cream-200)',
              color: 'var(--sage-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sage-900)' }}>
                Organization History & Undo Log
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Review past operations and roll back changes safely.
              </p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            <p>Loading operation history...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.95rem' }}>No organization history recorded yet.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Run an organization pass to see operations logged here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {history.map((batch) => {
              const isApplied = batch.status === 'applied';
              const isUndone = batch.status === 'undone';
              const isDryRun = batch.dry_run;

              return (
                <div
                  key={batch.batch_id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--cream-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.825rem', color: 'var(--sage-900)' }}>
                        {batch.batch_id}
                      </span>
                      {isDryRun ? (
                        <span className="badge" style={{ background: 'var(--sage-100)', color: 'var(--sage-700)' }}>
                          Dry-Run
                        </span>
                      ) : isUndone ? (
                        <span className="badge" style={{ background: '#F1F5F9', color: '#64748B' }}>
                          Undone
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--green-100)', color: 'var(--green-600)' }}>
                          Applied ({batch.operations_count} files)
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {batch.timestamp}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      <Folder size={13} />
                      <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{batch.folder_path}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isApplied && !isDryRun && (
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => handleUndo(batch.batch_id)}
                      disabled={undoingBatchId === batch.batch_id}
                    >
                      {undoingBatchId === batch.batch_id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <RotateCcw size={14} />
                      )}
                      <span>Undo This Batch</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
