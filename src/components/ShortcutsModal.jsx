import React, { useEffect } from 'react'
import useStore from '../store/store'

const shortcuts = [
  { group: 'General', items: [
    { key: 'Del', action: 'Delete Selected Object' },
    { key: 'Esc', action: 'Deselect All' },
    { key: 'Ctrl+Z', action: 'Undo (Coming soon)' },
    { key: 'Shift+A', action: 'Add Object Menu' },
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

  // Global keydown for Escape to close
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1b1b1b] border border-border-subtle rounded-xl shadow-2xl w-[500px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-[#222]">
          <h2 className="text-lg font-semibold text-text-primary tracking-wide">Keyboard Shortcuts</h2>
          <button 
            onClick={() => setShowShortcuts(false)}
            className="text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {shortcuts.map((group) => (
            <div key={group.group}>
              <h3 className="text-xs font-bold text-accent-teal uppercase tracking-widest mb-3">{group.group}</h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.action} className="flex items-center justify-between py-1 border-b border-border-subtle/30 last:border-0">
                    <span className="text-sm text-text-secondary">{item.action}</span>
                    <kbd className="px-2.5 py-1 bg-[#111] border border-border-subtle rounded shadow-inner text-xs font-mono text-text-primary">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-[#111] flex justify-end">
          <button 
            onClick={() => setShowShortcuts(false)}
            className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-sm text-white rounded transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
