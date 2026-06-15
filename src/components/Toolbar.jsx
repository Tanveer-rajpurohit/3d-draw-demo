import React from 'react'
import useStore from '../store/store'

export default function Toolbar() {
  const transformMode = useStore((s) => s.transformMode)
  const setTransformMode = useStore((s) => s.setTransformMode)
  const sceneObjects = useStore((s) => s.sceneObjects)
  const selectedIds = useStore((s) => s.selectedIds)

  const modes = [
    { id: 'translate', label: 'Move', shortcut: 'W', icon: TranslateIcon },
    { id: 'rotate', label: 'Rotate', shortcut: 'E', icon: RotateIcon },
    { id: 'scale', label: 'Scale', shortcut: 'R', icon: ScaleIcon },
  ]

  const btnStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'all 0.15s ease',
    backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
    color: isActive ? 'white' : 'var(--text-muted)',
    fontFamily: 'inherit',
  })

  return (
    <>
      {/* Center transform toolbar */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        backgroundColor: 'rgba(19, 19, 24, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '4px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        zIndex: 15,
      }}>
        {modes.map(({ id, label, shortcut, icon: Icon }) => (
          <button
            key={id}
            id={`toolbar-${id}`}
            onClick={() => setTransformMode(id)}
            title={`${label} (${shortcut})`}
            style={btnStyle(transformMode === id)}
            onMouseEnter={(e) => { if (transformMode !== id) e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)' }}
            onMouseLeave={(e) => { if (transformMode !== id) e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Icon active={transformMode === id} />
          </button>
        ))}

        {/* Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

        {/* Focus button */}
        <button
          style={btnStyle(false)}
          title="Focus selected"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      </div>

      {/* Bottom status bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '28px',
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '8px',
        zIndex: 15,
        userSelect: 'none',
      }}>
        <span style={{
          fontSize: '10px',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          color: selectedIds.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)',
        }}>
          {selectedIds.length > 1
            ? `${selectedIds.length} objects selected`
            : selectedIds.length === 1
              ? `● ${sceneObjects.find(o => o.id === selectedIds[0])?.name || 'Object'}`
              : `${sceneObjects.length} objects in scene`}
        </span>
      </div>
    </>
  )
}

/* ─── Icons ─── */
function TranslateIcon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'white' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l-3 3 3 3" />
      <path d="M9 5l3-3 3 3" />
      <path d="M15 19l-3 3-3-3" />
      <path d="M19 9l3 3-3 3" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  )
}

function RotateIcon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'white' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6" />
      <path d="M21.34 15.57A10 10 0 1 1 17 3.34l4.5 4.16" />
    </svg>
  )
}

function ScaleIcon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'white' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6" />
      <path d="M21 15v6h-6" />
      <path d="M3 3l6 6" />
      <path d="M3 9V3h6" />
    </svg>
  )
}
