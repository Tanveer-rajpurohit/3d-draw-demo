import React, { useState } from 'react'
import useStore from '../store/store'

const shapes = [
  { id:'box', label:'Box', icon:'⬡' },
  { id:'cylinder', label:'Cylinder', icon:'⏣' },
  { id:'sphere', label:'Sphere', icon:'◉' },
  { id:'cone', label:'Cone', icon:'△' },
  { id:'plane', label:'Plane', icon:'▭' },
  { id:'torus', label:'Torus', icon:'◎' },
  { id:'capsule', label:'Capsule', icon:'⬭' },
  { id:'ring', label:'Ring', icon:'○' },
  { id:'torusknot', label:'TorusKnot', icon:'∞' },
]

const aircraftParts = [
  { label:'Fuselage',     type:'cylinder', scale:[0.4,0.4,3],    rotation:[Math.PI/2,0,0], position:[0,1,0], icon:'━' },
  { label:'Delta Wing',   type:'box',      scale:[3,0.05,1.5],   rotation:[0,0.785,0],     position:[0,1,0], icon:'◁' },
  { label:'Swept Wing',   type:'box',      scale:[2.5,0.05,1.2], rotation:[0,0.4,0],       position:[1.5,1,0], icon:'◀' },
  { label:'Jet Engine',   type:'cylinder', scale:[0.3,0.3,1.2],  rotation:[Math.PI/2,0,0], position:[-1,0.8,0.8], icon:'⊚' },
  { label:'Tail Fin',     type:'box',      scale:[0.05,0.8,0.6], rotation:[0,0,0],         position:[0,1.5,-1.5], icon:'▏' },
  { label:'Sensor Pod',   type:'sphere',   scale:[0.3,0.3,0.5],  rotation:[0,0,0],         position:[0,0.5,1.5], icon:'◦' },
  { label:'Fuel Tank',    type:'cylinder', scale:[0.2,0.2,0.8],  rotation:[Math.PI/2,0,0], position:[1,0.5,0], icon:'▮' },
  { label:'Landing Gear', type:'cylinder', scale:[0.05,0.05,0.6],rotation:[0,0,0],         position:[0,0.3,0], icon:'│' },
]

const lightTypes = [
  { id:'pointlight',       label:'Point',  icon:'💡' },
  { id:'directionallight', label:'Dir.',   icon:'☀' },
  { id:'spotlight',         label:'Spot',   icon:'🔦' },
]

export default function PrimitivesPanel() {
  const addPrimitive = useStore((s) => s.addPrimitive)
  const performCSG = useStore((s) => s.performCSG)
  const selectedIds = useStore((s) => s.selectedIds)
  const [open, setOpen] = useState({ shapes:true, aircraft:true, csg:true, lights:false })
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }))

  const sectionHdr = {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'8px 12px', backgroundColor:'var(--bg-surface)', cursor:'pointer',
    border:'none', width:'100%', color:'var(--text-primary)', fontSize:'10px',
    fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', fontFamily:'inherit',
    transition:'background .15s ease',
  }
  const gridBtn = {
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    padding:'8px 4px', height:'72px', backgroundColor:'var(--bg-base)',
    border:'1px solid var(--border)', borderRadius:'6px', cursor:'pointer',
    transition:'all .15s ease', color:'var(--text-secondary)', fontFamily:'inherit',
  }
  const csgBtn = (ok) => ({
    display:'flex', alignItems:'center', justifyContent:'center', padding:'8px 0',
    backgroundColor:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'6px',
    fontSize:'10px', fontWeight:500, color: ok?'var(--text-secondary)':'var(--text-muted)',
    cursor: ok?'pointer':'not-allowed', opacity: ok?1:0.4, fontFamily:'inherit', transition:'all .15s ease',
  })
  const chevron = (isOpen) => ({ fontSize:'10px', color:'var(--text-muted)', transform: isOpen?'rotate(180deg)':'rotate(0)', transition:'transform .2s ease', display:'inline-block' })

  return (
    <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
      {/* ── SHAPES ── */}
      <Section title="Basic Shapes" isOpen={open.shapes} toggle={() => toggle('shapes')} sectionHdr={sectionHdr} chevron={chevron}>
        <div style={{ padding:'8px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
          {shapes.map((s) => (
            <button key={s.id} onClick={() => addPrimitive(s.id)} style={gridBtn} title={s.label}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-blue)'; e.currentTarget.style.color='var(--accent-blue)'; e.currentTarget.style.boxShadow='0 0 8px var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.boxShadow='none' }}
            >
              <span style={{ fontSize:'20px', marginBottom:'4px' }}>{s.icon}</span>
              <span style={{ fontSize:'9px' }}>{s.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── AIRCRAFT ── */}
      <Section title="✈ Aircraft Parts" isOpen={open.aircraft} toggle={() => toggle('aircraft')} sectionHdr={sectionHdr} chevron={chevron}>
        <div style={{ padding:'8px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
          {aircraftParts.map((p) => (
            <button key={p.label} style={gridBtn} title={p.label}
              onClick={() => addPrimitive(p.type, { name:p.label, position:p.position, rotation:p.rotation, scale:p.scale })}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-teal)'; e.currentTarget.style.color='var(--accent-teal)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
            >
              <span style={{ fontSize:'18px', marginBottom:'4px' }}>{p.icon}</span>
              <span style={{ fontSize:'8px', textAlign:'center', lineHeight:1.2 }}>{p.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── CSG ── */}
      {selectedIds.length >= 2 && (
        <Section title="⊕ CSG Boolean" isOpen={open.csg} toggle={() => toggle('csg')} sectionHdr={sectionHdr} chevron={chevron}>
          <div style={{ padding:'8px' }}>
            <p style={{ fontSize:'10px', color:'var(--text-muted)', marginBottom:'8px', lineHeight:1.4 }}>
              {selectedIds.length} objects selected — Boolean operation
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
              {['union','subtract','intersect'].map((op) => (
                <button key={op} onClick={() => performCSG(op)} style={csgBtn(true)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-purple)'; e.currentTarget.style.color='var(--accent-purple)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
                >
                  {op.charAt(0).toUpperCase()+op.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── LIGHTS ── */}
      <Section title="💡 Lights" isOpen={open.lights} toggle={() => toggle('lights')} sectionHdr={sectionHdr} chevron={chevron}>
        <div style={{ padding:'8px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
          {lightTypes.map((l) => (
            <button key={l.id} onClick={() => addPrimitive(l.id)} style={gridBtn} title={l.label}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#ffdd44'; e.currentTarget.style.color='#ffdd44' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
            >
              <span style={{ fontSize:'18px', marginBottom:'4px' }}>{l.icon}</span>
              <span style={{ fontSize:'8px' }}>{l.label}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ── Collapsible Section ── */
function Section({ title, isOpen, toggle, sectionHdr, chevron, children }) {
  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
      <button onClick={toggle} style={sectionHdr}
        onMouseEnter={e => e.currentTarget.style.backgroundColor='var(--bg-panel-hover)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor='var(--bg-surface)'}
      >
        <span>{title}</span>
        <span style={chevron(isOpen)}>▾</span>
      </button>
      {isOpen && children}
    </div>
  )
}
