import React, { useState } from 'react'
import useStore from '../store/store'

const shapes = [
  { id: 'box', label: 'Cube', icon: CubeIcon },
  { id: 'cylinder', label: 'Cylinder', icon: CylinderIcon },
  { id: 'sphere', label: 'Sphere', icon: SphereIcon },
  { id: 'cone', label: 'Cone', icon: ConeIcon },
  { id: 'torus', label: 'Torus', icon: TorusIcon },
  { id: 'plane', label: 'Plane', icon: PlaneIcon },
  { id: 'capsule', label: 'Capsule', icon: SphereIcon },
  { id: 'circle', label: 'Circle', icon: PlaneIcon },
  { id: 'dodecahedron', label: 'Dodecahedron', icon: SphereIcon },
  { id: 'icosahedron', label: 'Icosahedron', icon: SphereIcon },
  { id: 'octahedron', label: 'Octahedron', icon: SphereIcon },
  { id: 'tetrahedron', label: 'Tetrahedron', icon: SphereIcon },
  { id: 'ring', label: 'Ring', icon: TorusIcon },
  { id: 'torusknot', label: 'Torus Knot', icon: TorusIcon },
  { id: 'tube', label: 'Tube', icon: CylinderIcon },
  { id: 'lathe', label: 'Lathe', icon: CylinderIcon },
]

export default function PrimitivesPanel() {
  const addPrimitive = useStore((s) => s.addPrimitive)
  const performCSG = useStore((s) => s.performCSG)
  const selectedIds = useStore((s) => s.selectedIds)
  
  const [search, setSearch] = useState('')
  const [openSections, setOpenSections] = useState({
    shapes: true,
    csg: false,
    components: false,
  })

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const filteredShapes = shapes.filter(s => s.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#888888' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search objects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', 
            backgroundColor: '#111111', 
            border: '1px solid #333333', 
            borderRadius: '6px', 
            padding: '8px 12px 8px 36px', 
            fontSize: '12px', 
            color: '#ffffff', 
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Shapes Section */}
      <div className="border border-border-subtle rounded-md overflow-hidden bg-[#1b1b1b]">
        <button 
          onClick={() => toggleSection('shapes')}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#222] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
        >
          <span className="text-xs font-semibold text-text-primary tracking-wider uppercase">Shapes</span>
          <svg className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openSections.shapes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {openSections.shapes && (
          <div className="p-2 grid grid-cols-3 gap-2">
            {filteredShapes.length > 0 ? (
              filteredShapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => addPrimitive(shape.id)}
                  className="flex flex-col items-center justify-center p-2 h-[60px] bg-bg-primary border border-border-subtle rounded hover:border-accent-teal hover:text-accent-teal group transition-colors cursor-pointer"
                  title={`Add ${shape.label}`}
                >
                  <shape.icon className="w-6 h-6 mb-1 text-text-muted group-hover:text-accent-teal transition-colors" />
                  <span className="text-[9px] text-text-secondary group-hover:text-accent-teal">{shape.label}</span>
                </button>
              ))
            ) : (
              <div className="col-span-3 text-center py-4 text-xs text-text-muted">No shapes found.</div>
            )}
          </div>
        )}
      </div>

      {/* CSG Operations Section */}
      <div className="border border-border-subtle rounded-md overflow-hidden bg-[#1b1b1b]">
        <button 
          onClick={() => toggleSection('csg')}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#222] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
        >
          <span className="text-xs font-semibold text-text-primary tracking-wider uppercase">CSG Operations</span>
          <svg className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openSections.csg ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {openSections.csg && (
          <div className="p-3">
            <p className="text-[10px] text-text-muted mb-3 leading-relaxed">
              Select multiple intersecting shapes to perform Boolean CSG operations.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => performCSG('union')}
                disabled={selectedIds.length < 2}
                className={`flex items-center justify-center py-1.5 bg-[#222] border border-border-subtle rounded text-[10px] text-text-secondary transition-colors ${selectedIds.length >= 2 ? 'hover:text-white hover:border-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                Union
              </button>
              <button 
                onClick={() => performCSG('subtract')}
                disabled={selectedIds.length < 2}
                className={`flex items-center justify-center py-1.5 bg-[#222] border border-border-subtle rounded text-[10px] text-text-secondary transition-colors ${selectedIds.length >= 2 ? 'hover:text-white hover:border-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                Subtract
              </button>
              <button 
                onClick={() => performCSG('intersect')}
                disabled={selectedIds.length < 2}
                className={`flex items-center justify-center py-1.5 bg-[#222] border border-border-subtle rounded text-[10px] text-text-secondary transition-colors ${selectedIds.length >= 2 ? 'hover:text-white hover:border-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                Intersect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Components Section */}
      <div className="border border-border-subtle rounded-md overflow-hidden bg-[#1b1b1b]">
        <button 
          onClick={() => toggleSection('components')}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#222] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
        >
          <span className="text-xs font-semibold text-text-primary tracking-wider uppercase">Components</span>
          <svg className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openSections.components ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {openSections.components && (
          <div className="p-3">
            <p className="text-[10px] text-text-muted mb-2">Build saved components.</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 p-2 bg-[#222] border border-border-subtle rounded hover:border-accent-teal hover:text-accent-teal text-[10px] text-text-secondary transition-colors cursor-pointer">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Create Component
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Simplified Icons for Shapes ─── */
function CubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="12" />
      <line x1="22" y1="8.5" x2="12" y2="12" />
      <line x1="2" y1="8.5" x2="12" y2="12" />
    </svg>
  )
}

function CylinderIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 5v14c0 1.66-4.03 3-9 3s-9-1.34-9-3V5" />
    </svg>
  )
}

function SphereIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  )
}

function ConeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2L2 20h20L12 2z" />
      <ellipse cx="12" cy="20" rx="10" ry="2" />
    </svg>
  )
}

function TorusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="4" ry="1.5" />
    </svg>
  )
}

function PlaneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="2 8 12 4 22 8 12 12 2 8" />
    </svg>
  )
}
