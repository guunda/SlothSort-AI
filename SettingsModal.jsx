import React, { useState } from 'react';
import { Settings, X, Cpu, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, aiStatus, onRefreshAiStatus, onNotification }) {
  const [host, setHost] = useState(aiStatus?.ollama_host || 'http://localhost:11434');
  const [model, setModel] = useState(aiStatus?.model_configured || 'llama3.2');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch('/api/ai/status');
      const data = await resp.json();
      setTestResult(data);
      onRefreshAiStatus();
    } catch (err) {
      setTestResult({
        ollama_available: false,
        message: `Failed to contact backend: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ollama_host: host,
          ollama_model: model
        })
      });
      const data = await resp.json();
      onNotification({ type: 'success', message: 'Settings saved successfully!' });
      onRefreshAiStatus();
      onClose();
    } catch (err) {
      onNotification({ type: 'error', message: `Failed to save settings: ${err.message}` });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--sage-100)',
              color: 'var(--sage-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sage-900)' }}>
                Local AI Configuration
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Configure your offline Ollama open-weight intelligence.
              </p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Host */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--sage-900)', marginBottom: '0.35rem' }}>
              Ollama Host Endpoint
            </label>
            <input
              id="input-ollama-host"
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="http://localhost:11434"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontFamily: 'monospace'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Standard local Ollama daemon port is 11434.
            </span>
          </div>

          {/* Model */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--sage-900)', marginBottom: '0.35rem' }}>
              Configured Model Name
            </label>
            <input
              id="input-ollama-model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="llama3.2"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontFamily: 'monospace'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Recommended models: <code>llama3.2</code>, <code>mistral</code>, <code>phi3</code>, or <code>qwen2.5-coder</code>.
            </span>
          </div>

          {/* Test Connection Button */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              id="btn-test-ollama"
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? <RefreshCw size={14} className="animate-spin" /> : <Cpu size={14} />}
              <span>Test Ollama Connection</span>
            </button>
            {testResult && (
              <span style={{
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: testResult.ollama_available ? 'var(--green-600)' : 'var(--amber-600)'
              }}>
                {testResult.ollama_available ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                <span>{testResult.message}</span>
              </span>
            )}
          </div>

          {/* Privacy Note */}
          <div style={{
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--cream-100)',
            border: '1px solid var(--cream-200)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}>
            <ShieldCheck size={20} style={{ color: 'var(--sage-700)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Zero Telemetry Commitment:</strong> SlothSort AI does not connect to any external cloud APIs. When Ollama is offline, the application seamlessly falls back to local deterministic heuristics in honest Demo Mode without breaking.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button id="btn-save-settings" type="submit" className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
