import React, { useState } from 'react'
import useStore from '../store/store'

/* ─── Shape definitions ─── */
const shapes = [
  { id: 'box', label: 'Box', icon: '⬡' },
  { id: 'cylinder', label: 'Cylinder', icon: '⏣' },
  { id: 'sphere', label: 'Sphere', icon: '◉' },
  { id: 'cone', label: 'Cone', icon: '△' },
  { id: 'plane', label: 'Plane', icon: '▭' },
  { id: 'torus', label: 'Torus', icon: '◎' },
  { id: 'capsule', label: 'Capsule', icon: '⬭' },
  { id: 'ring', label: 'Ring', icon: '○' },
  { id: 'tube', label: 'Tube', icon: '◌' },
]

/* ─── Aircraft presets ─── */
const aircraftParts = [
  { label: 'Fuselage', type: 'cylinder', scale: [0.4, 0.4, 3], rotation: [Math.PI/2, 0, 0], position: [0, 1, 0], icon: '━' },
  { label: 'Delta Wing', type: 'box', scale: [3, 0.05, 1.5], rotation: [0, 0.785, 0], position: [0, 1, 0], icon: '◁' },
  { label: 'Swept Wing', type: 'box', scale: [2.5, 0.05, 1.2], rotation: [0, 0.4, 0], position: [1.5, 1, 0], icon: '◀' },
  { label: 'Jet Engine', type: 'cylinder', scale: [0.3, 0.3, 1.2], rotation: [Math.PI/2, 0, 0], position: [-1, 0.8, 0.8], icon: '⊚' },
  { label: 'Tail Fin', type: 'box', scale: [0.05, 0.8, 0.6], rotation: [0, 0, 0], position: [0, 1.5, -1.5], icon: '▏' },
  { label: 'Sensor Pod', type: 'sphere', scale: [0.3, 0.3, 0.5], rotation: [0, 0, 0], position: [0, 0.5, 1.5], icon: '◦' },
  { label: 'Fuel Tank', type: 'cylinder', scale: [0.2, 0.2, 0.8], rotation: [Math.PI/2, 0, 0], position: [1, 0.5, 0], icon: '▮' },
  { label: 'Landing Gear', type: 'cylinder', scale: [0.05, 0.05, 0.6], rotation: [0, 0, 0], position: [0, 0.3, 0], icon: '│' },
]

/* ─── Light types ─── */
const lightTypes = [
  { id: 'pointlight', label: 'Point Light', icon: '💡' },
  { id: 'directionallight', label: 'Dir. Light', icon: '☀' },
  { id: 'spotlight', label: 'Spot Light', icon: '🔦' },
]

export default function PrimitivesPanel() {
  const addPrimitive = useStore((s) => s.addPrimitive)
  const performCSG = useStore((s) => s.performCSG)
  const selectedIds = useStore((s) => s.selectedIds)
  
  const [openSections, setOpenSections] = useState({
    shapes: true,
    aircraft: true,
    csg: true,
    lights: false,
  })

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAircraftAdd = (part) => {
    addPrimitive(part.type, {
      name: part.label,
      position: part.position,
      rotation: part.rotation,
      scale: part.scale,
    })
  }

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-surface)',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    color: 'var(--text-primary)',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'inherit',
    transition: 'background 0.15s ease',
  }

  const shapeBtnStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 4px',
    height: '72px',
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    color: 'var(--text-secondary)',
    fontFamily: 'inherit',
  }

  const csgBtnStyle = (enabled) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 500,
    color: enabled ? 'var(--text-secondary)' : 'var(--text-muted)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.4,
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  })

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* BASIC SHAPES */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <button 
          onClick={() => toggleSection('shapes')}
          style={sectionHeaderStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
        >
          <span>Basic Shapes</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: openSections.shapes ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>▾</span>
        </button>
        
        {openSections.shapes && (
          <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {shapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => addPrimitive(shape.id)}
                style={shapeBtnStyle}
                title={`Add ${shape.label}`}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--accent-blue)'; e.currentTarget.style.boxShadow = '0 0 8px var(--accent-glow)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: '20px', marginBottom: '4px' }}>{shape.icon}</span>
                <span style={{ fontSize: '9px' }}>{shape.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AIRCRAFT PARTS */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <button 
          onClick={() => toggleSection('aircraft')}
          style={sectionHeaderStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
        >
          <span>✈ Aircraft Parts</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: openSections.aircraft ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>▾</span>
        </button>
        
        {openSections.aircraft && (
          <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {aircraftParts.map((part) => (
              <button
                key={part.label}
                onClick={() => handleAircraftAdd(part)}
                style={shapeBtnStyle}
                title={`Add ${part.label}`}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-teal)'; e.currentTarget.style.color = 'var(--accent-teal)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(61,214,200,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: '18px', marginBottom: '4px' }}>{part.icon}</span>
                <span style={{ fontSize: '8px', textAlign: 'center', lineHeight: 1.2 }}>{part.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CSG OPERATIONS */}
      {selectedIds.length >= 2 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <button 
            onClick={() => toggleSection('csg')}
            style={sectionHeaderStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
          >
            <span>⊕ CSG Operations</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: openSections.csg ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>▾</span>
          </button>
          
          {openSections.csg && (
            <div style={{ padding: '8px' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                {selectedIds.length} objects selected — perform Boolean operations.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {['union', 'subtract', 'intersect'].map((op) => (
                  <button
                    key={op}
                    onClick={() => performCSG(op)}
                    disabled={selectedIds.length < 2}
                    style={csgBtnStyle(selectedIds.length >= 2)}
                    onMouseEnter={(e) => { if (selectedIds.length >= 2) { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.color = 'var(--accent-purple)' }}}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = selectedIds.length >= 2 ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                  >
                    {op.charAt(0).toUpperCase() + op.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIGHTS */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <button 
          onClick={() => toggleSection('lights')}
          style={sectionHeaderStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
        >
          <span>💡 Lights</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: openSections.lights ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>▾</span>
        </button>
        
        {openSections.lights && (
          <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {lightTypes.map((light) => (
              <button
                key={light.id}
                onClick={() => addPrimitive(light.id)}
                style={shapeBtnStyle}
                title={`Add ${light.label}`}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ffdd44'; e.currentTarget.style.color = '#ffdd44' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <span style={{ fontSize: '18px', marginBottom: '4px' }}>{light.icon}</span>
                <span style={{ fontSize: '8px', textAlign: 'center' }}>{light.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
