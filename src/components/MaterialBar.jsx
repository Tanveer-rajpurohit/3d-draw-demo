import React, { useState } from 'react'
import useStore from '../store/store'

const materialModes = [
  { id: 'solid', label: 'Solid', color: '#aaaaaa' },
  { id: 'wireframe', label: 'Wireframe', color: '#4a9eff' },
  { id: 'clay', label: 'Clay', color: '#c8c8c8' },
  { id: 'normals', label: 'Normals', color: '#88aaff' },
  { id: 'scifi', label: 'Sci-Fi', color: '#00aaff' },
  { id: 'xray', label: 'X-Ray', color: '#4a9eff' },
  { id: 'matcap_a', label: 'Matcap A', color: '#ddaa88' },
  { id: 'matcap_b', label: 'Matcap B', color: '#ddbbff' },
]

export default function MaterialBar() {
  const materialMode = useStore((s) => s.materialMode)
  const setMaterialMode = useStore((s) => s.setMaterialMode)
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div style={{
      position: 'absolute',
      bottom: '48px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'rgba(19, 19, 24, 0.92)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border)',
      borderRadius: '24px',
      padding: '6px 12px',
      zIndex: 15,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      {materialModes.map((mode) => {
        const isActive = materialMode === mode.id
        const isHovered = hoveredId === mode.id

        return (
          <div
            key={mode.id}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onMouseEnter={() => setHoveredId(mode.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                bottom: '44px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '9px',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                zIndex: 20,
                animation: 'tooltipIn 0.12s ease-out forwards',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                pointerEvents: 'none',
              }}>
                {mode.label}
              </div>
            )}

            {/* Button */}
            <button
              onClick={() => setMaterialMode(mode.id)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: isActive ? '2px solid white' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                padding: 0,
                outline: 'none',
                boxShadow: isActive ? '0 0 10px rgba(255,255,255,0.15)' : 'none',
              }}
              title={mode.label}
            >
              {/* Preview sphere */}
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: mode.id === 'scifi'
                  ? 'radial-gradient(circle at 35% 35%, #003366, #001133)'
                  : mode.id === 'wireframe'
                    ? 'transparent'
                    : mode.id === 'normals'
                      ? 'linear-gradient(135deg, #ff4488, #44ff88, #4488ff)'
                      : mode.id === 'xray'
                        ? 'radial-gradient(circle at 35% 35%, rgba(74,158,255,0.4), rgba(74,158,255,0.1))'
                        : `radial-gradient(circle at 35% 35%, ${mode.color}, ${mode.color}88)`,
                border: mode.id === 'wireframe' ? `1.5px solid ${mode.color}` : 'none',
                boxShadow: mode.id === 'scifi' ? '0 0 6px rgba(0,170,255,0.4)' : 'none',
                transition: 'all 0.15s ease',
              }} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
