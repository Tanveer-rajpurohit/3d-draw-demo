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
    { id: 'ai', label: 'AI GENERATE', icon: AIIcon },
    { id: 'scene', label: 'SCENE', icon: SceneIcon },
  ]

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] bg-bg-secondary border-r border-border-subtle select-none shrink-0 overflow-hidden">
      {/* Tab Headers */}
      <div style={{ display: 'flex', backgroundColor: '#1b1b1b', borderBottom: '1px solid #333333', flexShrink: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`sidebar-tab-${tab.id}`}
            onClick={() => setSidebarTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderBottom: sidebarTab === tab.id ? '2px solid #8DBCC7' : '2px solid transparent',
              color: sidebarTab === tab.id ? '#8DBCC7' : '#888888',
              backgroundColor: sidebarTab === tab.id ? '#1a1a1a' : 'transparent',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (sidebarTab !== tab.id) {
                e.currentTarget.style.color = '#cccccc';
                e.currentTarget.style.backgroundColor = '#2a2a2a';
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarTab !== tab.id) {
                e.currentTarget.style.color = '#888888';
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#8DBCC7' : '#5a5a66'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <circle cx="17.5" cy="17.5" r="3.5" />
    </svg>
  )
}

function AIIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#8DBCC7' : '#5a5a66'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function SceneIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#8DBCC7' : '#5a5a66'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
