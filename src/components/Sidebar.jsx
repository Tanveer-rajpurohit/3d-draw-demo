import React from 'react'
import useStore from '../store/store'
import AIGenerationPanel from './AIGenerationPanel'
import PrimitivesPanel from './PrimitivesPanel'
import SceneOutliner from './SceneOutliner'

export default function Sidebar() {
  const sidebarTab = useStore((s) => s.sidebarTab)
  const setSidebarTab = useStore((s) => s.setSidebarTab)

  const tabs = [
    { id: 'primitives', label: 'ADD', icon: PrimitivesIcon },
    { id: 'ai', label: 'AI GEN', icon: AIIcon },
    { id: 'scene', label: 'SCENE', icon: SceneIcon },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '260px',
      minWidth: '260px',
      backgroundColor: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
      userSelect: 'none',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Tab Headers */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`sidebar-tab-${tab.id}`}
            onClick={() => setSidebarTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              borderBottom: sidebarTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: sidebarTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
              backgroundColor: sidebarTab === tab.id ? 'var(--bg-panel)' : 'transparent',
              outline: 'none',
              border: 'none',
              borderBottomStyle: 'solid',
              borderBottomWidth: '2px',
              borderBottomColor: sidebarTab === tab.id ? 'var(--accent-blue)' : 'transparent',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (sidebarTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <tab.icon active={sidebarTab === tab.id} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {sidebarTab === 'primitives' && <PrimitivesPanel />}
        {sidebarTab === 'ai' && <AIGenerationPanel />}
        {sidebarTab === 'scene' && <SceneOutliner />}
      </div>
    </div>
  )
}

/* ─── Tab Icons ─── */
function PrimitivesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent-blue)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <circle cx="17.5" cy="17.5" r="3.5" />
    </svg>
  )
}

function AIIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent-blue)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function SceneIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent-blue)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
