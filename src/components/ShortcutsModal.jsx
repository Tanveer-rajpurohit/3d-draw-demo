import React from 'react'
import useStore from '../store/store'

const shortcuts = [
  { key: 'W', action: 'Translate Mode' },
  { key: 'E', action: 'Rotate Mode' },
  { key: 'R', action: 'Scale Mode' },
  { key: 'Delete', action: 'Delete Selected' },
  { key: 'Ctrl+C', action: 'Copy' },
  { key: 'Ctrl+V', action: 'Paste' },
  { key: 'Ctrl+Z', action: 'Undo' },
  { key: 'Ctrl+Y', action: 'Redo' },
  { key: '?', action: 'Show Shortcuts' },
  { key: 'Click', action: 'Select Object' },
  { key: 'Shift+Click', action: 'Multi-select' },
  { key: 'Click Empty', action: 'Deselect All' },
]

export default function ShortcutsModal() {
  const show = useStore((s) => s.showShortcuts)
  const setShow = useStore((s) => s.setShowShortcuts)

  if (!show) return null

  return (
    <div onClick={() => setShow(false)} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '380px', backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px', boxShadow: '0 16px 48px rgba(0,0,0,.5)',
        animation: 'fadeIn .15s ease-out forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '.04em' }}>
            ⌨ Keyboard Shortcuts
          </h2>
          <button onClick={() => setShow(false)} style={{
            border: 'none', background: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '16px', padding: '4px',
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {shortcuts.map(({ key, action }) => (
            <div key={key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 8px', borderRadius: '4px', transition: 'background .1s ease',
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{action}</span>
              <kbd style={{
                padding: '3px 8px', backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border)', borderRadius: '4px',
                fontSize: '10px', fontFamily: 'var(--mono-font)',
                color: 'var(--text-muted)', minWidth: '28px', textAlign: 'center',
              }}>{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
