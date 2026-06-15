import React, { useState } from 'react'
import useStore from '../store/store'

const modes = [
  { id: 'solid',     label: 'Solid',     bg: 'radial-gradient(circle at 35% 35%, #c8c3b8, #a09888)' },
  { id: 'wireframe', label: 'Wireframe', bg: 'transparent', border: '1.5px solid #5b8cb8' },
  { id: 'clay',      label: 'Clay',      bg: 'radial-gradient(circle at 35% 35%, #d4cfc5, #b8b0a4)' },
  { id: 'normals',   label: 'Normals',   bg: 'linear-gradient(135deg, #e87070, #70c878, #7090e0)' },
  { id: 'scifi',     label: 'Sci-Fi',    bg: 'radial-gradient(circle at 35% 35%, #a8ccee, #6699cc)', shadow: '0 0 6px rgba(102,153,204,.3)' },
  { id: 'xray',      label: 'X-Ray',     bg: 'radial-gradient(circle at 35% 35%, rgba(122,184,224,.5), rgba(122,184,224,.15))' },
]

export default function MaterialBar() {
  const materialMode = useStore((s) => s.materialMode)
  const setMaterialMode = useStore((s) => s.setMaterialMode)
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{
      position: 'absolute', bottom: '48px', left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: '6px',
      backgroundColor: 'rgba(255, 253, 248, 0.92)', backdropFilter: 'blur(12px)',
      border: '1px solid var(--border)', borderRadius: '24px', padding: '6px 12px',
      zIndex: 15, boxShadow: '0 2px 16px rgba(0,0,0,.08)',
      pointerEvents: 'auto',
    }}>
      {modes.map((m) => {
        const on = materialMode === m.id
        const hov = hovered === m.id
        return (
          <div key={m.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onMouseEnter={() => setHovered(m.id)} onMouseLeave={() => setHovered(null)}
          >
            {hov && (
              <div style={{
                position: 'absolute', bottom: '44px', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '4px',
                padding: '3px 8px', fontSize: '9px', color: 'var(--text-primary)', whiteSpace: 'nowrap',
                zIndex: 20, animation: 'tooltipIn .12s ease-out forwards',
                boxShadow: '0 2px 8px rgba(0,0,0,.06)', pointerEvents: 'none',
                fontFamily: 'var(--ui-font)',
              }}>{m.label}</div>
            )}
            <button onClick={() => setMaterialMode(m.id)} title={m.label} style={{
              width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
              border: on ? '2px solid var(--accent-brand)' : '2px solid transparent',
              outline: 'none', padding: 0,
              backgroundColor: 'transparent', transition: 'all .15s ease',
              boxShadow: on ? '0 0 8px var(--accent-glow)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: m.bg || 'transparent',
                border: m.border || 'none',
                boxShadow: m.shadow || 'none',
                transition: 'all .15s ease',
              }} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
