import React from 'react';
import { CheckCircle2, AlertCircle, RotateCcw, ShieldCheck, ArrowRight, FileCheck } from 'lucide-react';

export default function ExecutionSummary({
  result,
  onUndo,
  isUndoing,
  onDismiss
}) {
  if (!result) return null;

  return (
    <div className="glass-card" style={{
      padding: '1.75rem',
      marginBottom: '1.75rem',
      borderLeft: `5px solid ${result.dry_run ? 'var(--sage-600)' : 'var(--green-600)'}`,
      background: '#FFFFFF'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: result.dry_run ? 'var(--sage-100)' : 'var(--green-100)',
            color: result.dry_run ? 'var(--sage-800)' : 'var(--green-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {result.dry_run ? <ShieldCheck size={22} /> : <CheckCircle2 size={22} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sage-900)' }}>
              {result.dry_run ? 'Dry-Run Simulation Complete' : 'Changes Applied Successfully!'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Batch ID: <span style={{ fontFamily: 'monospace' }}>{result.batch_id}</span> • {result.timestamp}
            </p>
          </div>
        </div>

        {/* Undo Button if not dry run */}
        {result.can_undo && (
          <button
            id="btn-undo-summary"
            className="btn btn-accent btn-sm"
            onClick={() => onUndo(result.batch_id)}
            disabled={isUndoing}
            title="Rollback all file moves and renames from this batch back to their exact original locations"
          >
            <RotateCcw size={15} />
            <span>{isUndoing ? 'Undoing...' : 'Undo Last Operation'}</span>
          </button>
        )}
      </div>

      {/* Summary Counts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ padding: '0.75rem', background: 'var(--cream-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-200)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sage-900)' }}>{result.total_processed}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Processed</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--green-100)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-500)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-600)' }}>{result.success_count}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--green-600)' }}>
            {result.dry_run ? 'Simulated Valid' : 'Moved & Renamed'}
          </div>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--cream-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-200)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>{result.skipped_count}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Skipped</div>
        </div>
        <div style={{ padding: '0.75rem', background: result.error_count > 0 ? 'var(--terracotta-100)' : 'var(--cream-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-200)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: result.error_count > 0 ? 'var(--terracotta-600)' : 'var(--text-muted)' }}>{result.error_count}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Errors</div>
        </div>
      </div>

      {result.dry_run && (
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--sage-50)',
          border: '1px solid var(--sage-200)',
          fontSize: '0.825rem',
          color: 'var(--sage-800)'
        }}>
          💡 <strong>Dry-run simulation succeeded!</strong> No files were modified on disk. To execute real moves, uncheck <em>Dry-Run Mode</em> above and click <em>Apply Approved Changes</em>.
        </div>
      )}
    </div>
  );
}
