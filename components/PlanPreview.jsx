import React, { useState, useMemo } from 'react';
import {
  Sparkles, CheckSquare, Square, Search, Filter, AlertTriangle,
  Info, Edit3, ArrowRight, ShieldCheck, RefreshCw, CheckCircle, FileText,
  Image, FileCode, Archive, Music, Video
} from 'lucide-react';

const CATEGORY_ICONS = {
  Documents: FileText,
  College: FileText,
  Images: Image,
  Spreadsheets: FileText,
  Presentations: FileText,
  Code: FileCode,
  Archives: Archive,
  Audio: Music,
  Video: Video,
  Miscellaneous: FileText
};

export default function PlanPreview({
  plan,
  onGeneratePlan,
  isPlanning,
  aiStatus,
  onApplyPlan,
  isApplying,
  dryRun,
  setDryRun,
  collisionStrategy,
  setCollisionStrategy
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [forceDemoMode, setForceDemoMode] = useState(false);
  const [items, setItems] = useState([]);

  // Sync internal items state with plan response
  React.useEffect(() => {
    if (plan?.items) {
      setItems(plan.items);
    }
  }, [plan]);

  // Handle individual approval toggle
  const toggleApproval = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, approved: !item.approved } : item))
    );
  };

  // Toggle all approved
  const toggleAll = (select) => {
    setItems((prev) => prev.map((item) => ({ ...item, approved: select })));
  };

  // Handle inline proposed filename editing
  const handleFilenameChange = (id, newName) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const cat = item.suggested_category;
          return {
            ...item,
            suggested_name: newName,
            suggested_rel_path: `${cat}/${newName}`
          };
        }
        return item;
      })
    );
  };

  // Handle inline category change
  const handleCategoryChange = (id, newCategory) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            suggested_category: newCategory,
            suggested_rel_path: `${newCategory}/${item.suggested_name}`
          };
        }
        return item;
      })
    );
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.suggested_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategoryFilter === 'ALL' || item.suggested_category === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, selectedCategoryFilter]);

  const approvedCount = items.filter((i) => i.approved).length;

  return (
    <section className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
      {/* Header & Trigger */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
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
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--sage-900)' }}>
              Step 2: AI Organization Plan
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Review proposed categories, descriptive filenames, and destinations before approval.
            </p>
          </div>
        </div>

        {/* Generate / Re-plan Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              id="toggle-force-demo"
              type="checkbox"
              checked={forceDemoMode}
              onChange={(e) => setForceDemoMode(e.target.checked)}
              style={{ accentColor: 'var(--amber-600)', width: '15px', height: '15px' }}
            />
            <span>Test Heuristic Demo</span>
          </label>

          <button
            id="btn-organize-mess"
            className="btn btn-primary"
            onClick={() => onGeneratePlan({ forceDemoMode })}
            disabled={isPlanning}
          >
            {isPlanning ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{plan ? 'Re-organize My Mess' : 'Organize My Mess'}</span>
          </button>
        </div>
      </div>

      {/* Honest AI Engine Banner */}
      {plan && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: plan.is_simulated ? 'var(--amber-100)' : 'var(--sage-100)',
          border: `1px solid ${plan.is_simulated ? 'var(--amber-500)' : 'var(--sage-300)'}`,
          color: plan.is_simulated ? 'var(--amber-600)' : 'var(--sage-800)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {plan.is_simulated ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {plan.is_simulated
                  ? 'Simulated AI (Demo Mode Active)'
                  : `Local Open-Weight Model (${plan.model_name})`}
              </div>
              <div style={{ fontSize: '0.775rem', opacity: 0.9 }}>
                {plan.message}
              </div>
            </div>
          </div>
          <span className="badge badge-privacy">
            <ShieldCheck size={13} />
            <span>Zero Data Uploaded</span>
          </span>
        </div>
      )}

      {/* If Plan generated, show Preview Table and Approval controls */}
      {plan && (
        <>
          {/* Search and Filters Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  id="input-search-plan"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by filename or proposed name..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.5rem 0.5rem 2rem',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    background: '#FFFFFF',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                id="btn-select-all"
                className="btn btn-outline btn-sm"
                onClick={() => toggleAll(true)}
              >
                <CheckSquare size={14} />
                <span>Select All</span>
              </button>
              <button
                id="btn-deselect-all"
                className="btn btn-outline btn-sm"
                onClick={() => toggleAll(false)}
              >
                <Square size={14} />
                <span>Deselect All</span>
              </button>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--sage-800)', marginLeft: '0.5rem' }}>
                {approvedCount} of {items.length} approved
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div style={{
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: '#FFFFFF',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead style={{
                  background: 'var(--cream-100)',
                  borderBottom: '1px solid var(--border-light)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10
                }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', width: '48px', textAlign: 'center' }}>
                      Approve
                    </th>
                    <th style={{ padding: '0.75rem 1rem' }}>Original File</th>
                    <th style={{ padding: '0.75rem 1rem', width: '150px' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Proposed Filename (Editable)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Destination Path</th>
                    <th style={{ padding: '0.75rem 1rem', width: '120px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const IconComp = CATEGORY_ICONS[item.suggested_category] || FileText;
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: item.approved ? 'transparent' : 'rgba(0,0,0,0.02)',
                          opacity: item.approved ? 1 : 0.65,
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Approval Checkbox */}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={item.approved}
                            onChange={() => toggleApproval(item.id)}
                            style={{ accentColor: 'var(--sage-700)', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        </td>

                        {/* Original File */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconComp size={16} style={{ color: 'var(--sage-600)', flexShrink: 0 }} />
                            <div>
                              <strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                                {item.original_name}
                              </strong>
                              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                {item.extension} • Original
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category Dropdown */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select
                            value={item.suggested_category}
                            onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              fontSize: '0.8rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-light)',
                              background: '#FFFFFF',
                              color: 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Documents">Documents</option>
                            <option value="College">College</option>
                            <option value="Images">Images</option>
                            <option value="Spreadsheets">Spreadsheets</option>
                            <option value="Presentations">Presentations</option>
                            <option value="Code">Code</option>
                            <option value="Archives">Archives</option>
                            <option value="Audio">Audio</option>
                            <option value="Video">Video</option>
                            <option value="Projects">Projects</option>
                            <option value="Miscellaneous">Miscellaneous</option>
                          </select>
                        </td>

                        {/* Proposed Filename (Inline Editable) */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={item.suggested_name}
                              onChange={(e) => handleFilenameChange(item.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.35rem 0.5rem',
                                fontSize: '0.825rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--sage-200)',
                                background: '#FFFFFF',
                                fontFamily: 'monospace'
                              }}
                            />
                          </div>
                        </td>

                        {/* Destination Path */}
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: 'var(--sage-800)', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <ArrowRight size={13} style={{ color: 'var(--sage-500)', flexShrink: 0 }} />
                            <span>{item.suggested_rel_path}</span>
                          </div>
                        </td>

                        {/* Collision status badge */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {item.collision_detected ? (
                            <span
                              className="badge"
                              style={{ background: 'var(--amber-100)', color: 'var(--amber-600)', fontSize: '0.725rem' }}
                              title="Destination exists: Safe numbered suffix will be applied"
                            >
                              Auto-Numbered
                            </span>
                          ) : (
                            <span
                              className="badge"
                              style={{ background: 'var(--green-100)', color: 'var(--green-600)', fontSize: '0.725rem' }}
                            >
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Execution & Safety Bar */}
          <div style={{
            background: 'var(--cream-50)',
            border: '1px solid var(--cream-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Safety Switches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Dry Run Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  id="toggle-dry-run"
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  style={{ accentColor: 'var(--sage-700)', width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sage-900)' }}>
                    Dry-Run Mode (Simulation)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Verifies all moves without modifying the disk (Default safe setting)
                  </div>
                </div>
              </label>

              {/* Collision Strategy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>On Collision:</span>
                <select
                  id="select-collision-strategy"
                  value={collisionStrategy}
                  onChange={(e) => setCollisionStrategy(e.target.value)}
                  style={{
                    padding: '0.35rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.8rem',
                    background: '#FFFFFF'
                  }}
                >
                  <option value="rename">Auto-Rename (_1, _2)</option>
                  <option value="skip">Skip without overwriting</option>
                </select>
              </div>
            </div>

            {/* Apply Button */}
            <button
              id="btn-apply-changes"
              className="btn btn-primary"
              onClick={() => onApplyPlan(items)}
              disabled={isApplying || approvedCount === 0}
              style={{
                background: dryRun ? 'var(--sage-800)' : 'var(--terracotta-500)',
                padding: '0.75rem 1.5rem'
              }}
            >
              {isApplying ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              <span>
                {dryRun
                  ? `Simulate Dry-Run (${approvedCount} files)`
                  : `Apply Approved Changes (${approvedCount} files)`}
              </span>
            </button>
          </div>
        </>
      )}
    </section>
  );
}
