import React, { useState } from 'react'
import useStore from '../store/store'

const shapes = [
  { id: 'box', label: 'Box', icon: '⬡' },
  { id: 'cylinder', label: 'Cylinder', icon: '⏣' },
  { id: 'sphere', label: 'Sphere', icon: '◉' },
  { id: 'cone', label: 'Cone', icon: '△' },
  { id: 'plane', label: 'Plane', icon: '▭' },
  { id: 'torus', label: 'Torus', icon: '◎' },
  { id: 'capsule', label: 'Capsule', icon: '⬭' },
  { id: 'ring', label: 'Ring', icon: '○' },
  { id: 'torusknot', label: 'TorusKnot', icon: '∞' },
]

const aircraftParts = [
  { label: 'Fuselage', type: 'cylinder', scale: [0.4, 0.4, 3], rotation: [Math.PI / 2, 0, 0], position: [0, 1, 0], icon: '━' },
  { label: 'Delta Wing', type: 'box', scale: [3, 0.05, 1.5], rotation: [0, 0.785, 0], position: [0, 1, 0], icon: '◁' },
  { label: 'Swept Wing', type: 'box', scale: [2.5, 0.05, 1.2], rotation: [0, 0.4, 0], position: [1.5, 1, 0], icon: '◀' },
  { label: 'Jet Engine', type: 'cylinder', scale: [0.3, 0.3, 1.2], rotation: [Math.PI / 2, 0, 0], position: [-1, 0.8, 0.8], icon: '⊚' },
  { label: 'Tail Fin', type: 'box', scale: [0.05, 0.8, 0.6], rotation: [0, 0, 0], position: [0, 1.5, -1.5], icon: '▏' },
  { label: 'Sensor Pod', type: 'sphere', scale: [0.3, 0.3, 0.5], rotation: [0, 0, 0], position: [0, 0.5, 1.5], icon: '◦' },
  { label: 'Fuel Tank', type: 'cylinder', scale: [0.2, 0.2, 0.8], rotation: [Math.PI / 2, 0, 0], position: [1, 0.5, 0], icon: '▮' },
  { label: 'Landing Gear', type: 'cylinder', scale: [0.05, 0.05, 0.6], rotation: [0, 0, 0], position: [0, 0.3, 0], icon: '│' },
]

const lightTypes = [
  { id: 'pointlight', label: 'Point', icon: '💡' },
  { id: 'directionallight', label: 'Dir.', icon: '☀' },
  { id: 'spotlight', label: 'Spot', icon: '🔦' },
]

/* ── CSG Overlap Icon (two overlapping squares, stroke) ── */
function CSGIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="9" height="9" rx="1.5" />
      <rect x="6" y="6" width="9" height="9" rx="1.5" />
    </svg>
  )
}

export default function PrimitivesPanel() {
  const addPrimitive = useStore((s) => s.addPrimitive)
  const performCSG = useStore((s) => s.performCSG)
  const selectedIds = useStore((s) => s.selectedIds)
  const [open, setOpen] = useState({ shapes: true, aircraft: true, csg: true, lights: false, csgInfo: false })
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }))

  const csgReady = selectedIds.length >= 2

  /* ── Styles ── */
  const sectionHdr = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    color: 'var(--text-primary)',
    fontFamily: 'var(--serif-font)',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: 'transparent',
    transition: 'background .15s ease',
  }

  const gridBtn = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 4px',
    height: '72px',
    backgroundColor: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all .15s ease',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--ui-font)',
    fontSize: '9px',
  }

  const csgBtnStyle = (enabled) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '9px 0',
    backgroundColor: enabled ? 'var(--bg-raised)' : 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    fontFamily: 'var(--ui-font)',
    color: enabled ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.35,
    transition: 'all .15s ease',
  })

  const chevron = (isOpen) => ({
    fontSize: '10px',
    color: 'var(--text-muted)',
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
    transition: 'transform .2s ease',
    display: 'inline-block',
  })

  const overline = {
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontFamily: 'var(--ui-font)',
  }

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* ═══ BASIC SHAPES ═══ */}
      <Section title="Basic Shapes" isOpen={open.shapes} toggle={() => toggle('shapes')} sectionHdr={sectionHdr} chevron={chevron}>
        <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {shapes.map((s) => (
            <button key={s.id} onClick={() => addPrimitive(s.id)} style={gridBtn} title={`Add ${s.label}`}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-brand)'; e.currentTarget.style.color = 'var(--accent-brand)'; e.currentTarget.style.boxShadow = '0 2px 8px var(--accent-glow)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ═══ AIRCRAFT PARTS ═══ */}
      <Section title="Aircraft Parts" isOpen={open.aircraft} toggle={() => toggle('aircraft')} sectionHdr={sectionHdr} chevron={chevron} prefix="✈">
        <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {aircraftParts.map((p) => (
            <button key={p.label} style={gridBtn} title={`Add ${p.label}`}
              onClick={() => addPrimitive(p.type, { name: p.label, position: p.position, rotation: p.rotation, scale: p.scale })}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-coral)'; e.currentTarget.style.color = 'var(--accent-coral)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <span style={{ fontSize: '18px', marginBottom: '4px' }}>{p.icon}</span>
              <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{p.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ═══ CSG BOOLEAN — ALWAYS VISIBLE ═══ */}
      <Section
        title="CSG Boolean"
        isOpen={open.csg}
        toggle={() => toggle('csg')}
        sectionHdr={sectionHdr}
        chevron={chevron}
        iconEl={<CSGIcon />}
      >
        <div style={{ padding: '10px' }}>
          {/* Status message */}
          <p style={{
            ...overline,
            marginBottom: '8px',
            color: csgReady ? 'var(--accent-brand)' : 'var(--text-muted)',
          }}>
            {csgReady
              ? `${selectedIds.length} objects ready — pick operation`
              : 'Select 2+ objects to combine'}
          </p>

          {/* 3 operation buttons — always rendered */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              onClick={() => csgReady && performCSG('union')}
              disabled={!csgReady}
              style={csgBtnStyle(csgReady)}
              onMouseEnter={(e) => { if (csgReady) { e.currentTarget.style.borderColor = 'var(--accent-brand)'; e.currentTarget.style.color = 'var(--accent-brand)' } }}
              onMouseLeave={(e) => { if (csgReady) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
            >
              <span>∪</span> Union
            </button>
            <button
              onClick={() => csgReady && performCSG('subtract')}
              disabled={!csgReady}
              style={csgBtnStyle(csgReady)}
              onMouseEnter={(e) => { if (csgReady) { e.currentTarget.style.borderColor = 'var(--accent-brand)'; e.currentTarget.style.color = 'var(--accent-brand)' } }}
              onMouseLeave={(e) => { if (csgReady) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
            >
              <span>−</span> Subtract
            </button>
            <button
              onClick={() => csgReady && performCSG('intersect')}
              disabled={!csgReady}
              style={csgBtnStyle(csgReady)}
              onMouseEnter={(e) => { if (csgReady) { e.currentTarget.style.borderColor = 'var(--accent-brand)'; e.currentTarget.style.color = 'var(--accent-brand)' } }}
              onMouseLeave={(e) => { if (csgReady) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
            >
              <span>∩</span> Intersect
            </button>
          </div>

          {/* Collapsible info box */}
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => toggle('csgInfo')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--ui-font)',
                padding: '4px 0', transition: 'color .15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <span style={chevron(open.csgInfo)}>▾</span>
              What is CSG?
            </button>
            {open.csgInfo && (
              <div style={{
                marginTop: '6px', padding: '10px', backgroundColor: 'var(--bg-surface)',
                borderRadius: '6px', border: '1px solid var(--border)',
                fontSize: '10px', lineHeight: 1.5, color: 'var(--text-secondary)',
                fontFamily: 'var(--ui-font)', animation: 'fadeIn .15s ease-out forwards',
              }}>
                Boolean operations combine two shapes into one. Union merges them,
                Subtract cuts one from the other, Intersect keeps only the overlap.
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ═══ LIGHTS ═══ */}
      <Section title="Lights" isOpen={open.lights} toggle={() => toggle('lights')} sectionHdr={sectionHdr} chevron={chevron} prefix="💡">
        <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {lightTypes.map((l) => (
            <button key={l.id} onClick={() => addPrimitive(l.id)} style={gridBtn} title={`Add ${l.label}`}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-coral)'; e.currentTarget.style.color = 'var(--accent-coral)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <span style={{ fontSize: '18px', marginBottom: '4px' }}>{l.icon}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ═══ Collapsible Section wrapper ═══ */
function Section({ title, isOpen, toggle, sectionHdr, chevron, children, prefix, iconEl }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-panel)' }}>
      <button onClick={toggle} style={sectionHdr}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {iconEl || null}
          {prefix && <span>{prefix}</span>}
          {title}
        </span>
        <span style={chevron(isOpen)}>▾</span>
      </button>
      {isOpen && children}
    </div>
  )
}
