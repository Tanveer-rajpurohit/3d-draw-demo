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

  return (
    <>
      {/* Center toolbar (translate/rotate/scale) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-bg-secondary/95 backdrop-blur-md border border-border-subtle rounded-lg p-0.5 shadow-2xl z-10">
        {modes.map(({ id, label, shortcut, icon: Icon }) => (
          <button
            key={id}
            id={`toolbar-${id}`}
            onClick={() => setTransformMode(id)}
            title={`${label} (${shortcut})`}
            className={`flex items-center justify-center w-8 h-8 rounded cursor-pointer transition-all duration-200
              ${transformMode === id
                ? 'bg-[#0088ff] text-white'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
              }`}
          >
            <Icon active={transformMode === id} />
          </button>
        ))}

        {/* Focus button */}
        <div className="w-px h-5 bg-border-subtle mx-0.5" />
        <button className="flex items-center justify-center w-8 h-8 rounded text-text-muted hover:text-text-secondary hover:bg-bg-hover cursor-pointer" title="Focus selected">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded text-text-muted hover:text-text-secondary hover:bg-bg-hover cursor-pointer" title="Fit all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>

      {/* Bottom bar (play/pause/stop + timeline) */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-bg-secondary border-t border-border-subtle flex items-center px-3 gap-2 z-10 select-none">
        {/* Play controls */}
        <button className="text-text-muted hover:text-text-primary cursor-pointer" title="Play">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><polygon points="2,0 12,6 2,12" /></svg>
        </button>
        <button className="text-text-muted hover:text-text-primary cursor-pointer" title="Pause">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="0" width="3" height="12"/><rect x="8" y="0" width="3" height="12"/></svg>
        </button>
        <button className="text-text-muted hover:text-text-primary cursor-pointer" title="Stop">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="1" width="10" height="10"/></svg>
        </button>

        <div className="w-px h-4 bg-border-subtle" />

        {/* Time display */}
        <span className="text-[10px] font-mono text-text-muted">0.00 / 0.00</span>

        <div className="w-px h-4 bg-border-subtle" />

        {/* Time scale */}
        <span className="text-[10px] text-text-muted">Time Scale</span>
        <span className="text-[10px] font-mono text-[#0088ff]">1.00</span>

        {/* Right side info */}
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-[10px] font-mono ${selectedIds.length > 0 ? 'text-accent-teal' : 'text-text-muted'}`}>
            {selectedIds.length > 1
              ? `${selectedIds.length} objects selected`
              : selectedIds.length === 1
                ? `● ${sceneObjects.find(o => o.id === selectedIds[0])?.name || 'Object'}`
                : `${sceneObjects.length} objects`}
          </span>
        </div>
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
