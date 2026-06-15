import React, { useEffect } from 'react'
import useStore from '../store/store'

const shortcuts = [
  { group: 'General', items: [
    { key: 'Del', action: 'Delete Selected Object' },
    { key: 'Ctrl+Z', action: 'Undo' },
    { key: 'Ctrl+Y', action: 'Redo' },
    { key: 'Ctrl+C', action: 'Copy' },
    { key: 'Ctrl+V', action: 'Paste' },
  ]},
  { group: 'Tools', items: [
    { key: 'W', action: 'Translate Tool' },
    { key: 'E', action: 'Rotate Tool' },
    { key: 'R', action: 'Scale Tool' },
  ]},
  { group: 'Viewport', items: [
    { key: 'Left Click', action: 'Select Object' },
    { key: 'Right Drag', action: 'Pan Camera' },
    { key: 'Left Drag', action: 'Orbit Camera' },
    { key: 'Scroll', action: 'Zoom Camera' },
  ]},
]

export default function ShortcutsModal() {
  const showShortcuts = useStore((s) => s.showShortcuts)
  const setShowShortcuts = useStore((s) => s.setShowShortcuts)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showShortcuts, setShowShortcuts])

  if (!showShortcuts) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.15s ease-out forwards',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        width: '460px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Keyboard Shortcuts</h2>
          <button
            onClick={() => setShowShortcuts(false)}
            style={{
              color: 'var(--text-muted)', cursor: 'pointer',
              background: 'none', border: 'none', fontSize: '16px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {shortcuts.map((group) => (
            <div key={group.group} style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '10px', fontWeight: 700,
                color: 'var(--accent-teal)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '10px',
              }}>
                {group.group}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {group.items.map((item) => (
                  <div key={item.action} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(42, 42, 56, 0.3)',
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.action}</span>
                    <kbd style={{
                      padding: '3px 8px',
                      backgroundColor: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      color: 'var(--text-primary)',
                      boxShadow: 'inset 0 -1px 0 var(--border)',
                    }}>
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-base)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => setShowShortcuts(false)}
            style={{
              padding: '6px 16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '11px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
