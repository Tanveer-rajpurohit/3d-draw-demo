import React, { useState } from 'react'
import useStore from '../store/store'

const meshItems = [
  'Box', 'Capsule', 'Circle', 'Cylinder', 'Dodecahedron', 'Icosahedron',
  'Lathe', 'Octahedron', 'Plane', 'Ring', 'Sphere', 'Tetrahedron',
  'Torus', 'TorusKnot', 'Tube', 'Cone',
]

const lightItems = ['Ambient', 'Directional', 'Hemisphere', 'Point', 'Spot']

const renderModes = [
  { id: 'solid', label: 'SOLID' },
  { id: 'wireframe', label: 'WIREFRAME' },
  { id: 'flat', label: 'FLAT' },
  { id: 'normals', label: 'NORMALS' },
  { id: 'depth', label: 'DEPTH' },
  { id: 'matcap', label: 'MATCAP' },
  { id: 'uv', label: 'UV CHECK' },
]

const menus = [
  { label: 'File', items: ['New Project', 'Import...', 'Save', 'Export STL', 'Export GLTF'] },
  {
    label: 'Edit',
    items: ['Undo', 'Redo', 'Delete Selected', 'Copy', 'Paste', 'Clear Scene'],
  },
  {
    label: 'Add',
    submenus: [
      { label: 'Group', action: 'group' },
      { label: 'Mesh', items: meshItems, submenu: true },
      { label: 'Light', items: ['AmbientLight', 'DirectionalLight', 'HemisphereLight', 'PointLight', 'SpotLight'], submenu: true },
      { label: 'Camera', items: ['OrthographicCamera', 'PerspectiveCamera'], submenu: true },
    ],
  },
  { label: 'View', items: ['Front', 'Right', 'Top', 'Reset Camera', 'Toggle Grid'] },
  { label: 'Render', items: ['Render Image', 'Path Trace'] },
  { label: 'Help', items: ['Documentation', 'Keyboard Shortcuts', 'About SkyForge AI'] },
]

export default function Menubar() {
  const [openMenu, setOpenMenu] = useState(null)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [showRenderDropdown, setShowRenderDropdown] = useState(false)
  const addPrimitive = useStore((s) => s.addPrimitive)
  const clearScene = useStore((s) => s.clearScene)
  const addModel = useStore((s) => s.addModel)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const copySelected = useStore((s) => s.copySelected)
  const pasteClipboard = useStore((s) => s.pasteClipboard)
  const removePrimitive = useStore((s) => s.removePrimitive)
  const selectedIds = useStore((s) => s.selectedIds)
  const renderMode = useStore((s) => s.renderMode)
  const setRenderMode = useStore((s) => s.setRenderMode)
  const setShowShortcuts = useStore((s) => s.setShowShortcuts)

  const handleMeshAdd = (item) => {
    setOpenMenu(null)
    setOpenSubmenu(null)
    addPrimitive(item.toLowerCase().replace(/\s+/g, ''))
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.glb,.gltf'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const url = URL.createObjectURL(file)
        addModel(url, file.name)
      }
    }
    input.click()
  }

  const handleItemClick = (menu, item) => {
    setOpenMenu(null)
    if (item === 'Clear Scene') clearScene()
    if (item === 'Import...') handleImport()
    if (item === 'Keyboard Shortcuts') setShowShortcuts(true)
    if (item === 'Undo') undo()
    if (item === 'Redo') redo()
    if (item === 'Copy') copySelected()
    if (item === 'Paste') pasteClipboard()
    if (item === 'Delete Selected') {
      selectedIds.forEach((id) => removePrimitive(id))
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '36px', backgroundColor: '#1a1a1a', borderBottom: '1px solid #333333', userSelect: 'none', flexShrink: 0, zIndex: 50, padding: '0 16px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '32px' }}>
        <div style={{ width: '20px', height: '20px', backgroundColor: '#8DBCC7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '10px', height: '10px', border: '2px solid white', borderRadius: '2px' }} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', color: '#8DBCC7' }}>SKYFORGE</span>
      </div>

      {/* Menus */}
      <div style={{ display: 'flex', gap: '8px', height: '100%', alignItems: 'center' }}>
        {menus.map((menu) => (
          <div
            key={menu.label}
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => openMenu !== null && setOpenMenu(menu.label)}
            onMouseLeave={() => setOpenSubmenu(null)}
          >
            <button
              id={`menu-${menu.label.toLowerCase()}`}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                color: openMenu === menu.label ? '#ffffff' : '#cccccc',
                backgroundColor: openMenu === menu.label ? '#2a2a2a' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                transition: 'background-color 0.2s, color 0.2s'
              }}
              onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
            >
              {menu.label}
            </button>

            {openMenu === menu.label && (
              <div className="absolute top-full left-0 min-w-[180px] bg-bg-secondary border border-border-default rounded-md shadow-2xl py-1 z-50 animate-fade-in">
                {menu.submenus
                  ? menu.submenus.map((sub, idx) =>
                      sub.submenu ? (
                        <div
                          key={idx}
                          className="relative"
                          onMouseEnter={() => setOpenSubmenu(sub.label)}
                          onMouseLeave={() => setOpenSubmenu(null)}
                        >
                          <div className="flex items-center justify-between px-4 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-accent-teal/10 cursor-pointer">
                            <span>{sub.label}</span>
                            <span className="text-text-muted ml-4">▸</span>
                          </div>
                          {openSubmenu === sub.label && (
                            <div className="absolute left-full top-0 min-w-[160px] bg-bg-secondary border border-border-default rounded-md shadow-2xl py-1 z-50 animate-fade-in max-h-[70vh] overflow-y-auto">
                              {sub.items.map((item, i) => (
                                <button
                                  key={i}
                                  className="w-full text-left px-4 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-accent-teal/10 transition-colors cursor-pointer"
                                  onClick={() => handleMeshAdd(item)}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          key={idx}
                          className="w-full text-left px-4 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-accent-teal/10 transition-colors cursor-pointer"
                          onClick={() => handleItemClick(menu.label, sub.label)}
                        >
                          {sub.label}
                        </button>
                      )
                    )
                  : menu.items.map((item, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-4 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-accent-teal/10 transition-colors cursor-pointer"
                        onClick={() => handleItemClick(menu.label, item)}
                      >
                        {item}
                      </button>
                    ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side — Camera + Render Mode selectors */}
      <div className="ml-auto flex items-center gap-2 px-4 h-full">
        {/* Camera selector */}
        <div className="flex items-center bg-bg-primary border border-border-subtle rounded px-2 py-0.5">
          <span className="text-[10px] text-text-secondary font-mono tracking-wide">CAMERA</span>
          <svg width="8" height="8" viewBox="0 0 8 8" className="ml-1 text-text-muted" fill="currentColor">
            <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        </div>

        {/* Render Mode Dropdown */}
        <div className="relative">
          <button
            className="flex items-center bg-bg-primary border border-border-subtle rounded px-2 py-0.5 cursor-pointer hover:border-accent-teal/40 transition-colors"
            onClick={() => setShowRenderDropdown(!showRenderDropdown)}
          >
            <span className="text-[10px] text-text-secondary font-mono tracking-wide">
              {renderModes.find((m) => m.id === renderMode)?.label || 'SOLID'}
            </span>
            <svg width="8" height="8" viewBox="0 0 8 8" className="ml-1 text-text-muted" fill="currentColor">
              <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          </button>
          {showRenderDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRenderDropdown(false)} />
              <div className="absolute top-full right-0 mt-1 min-w-[140px] bg-bg-secondary border border-border-default rounded-md shadow-2xl py-1 z-50 animate-fade-in">
                {renderModes.map((mode) => (
                  <button
                    key={mode.id}
                    className={`w-full text-left px-3 py-1.5 text-[11px] font-mono transition-colors cursor-pointer ${
                      renderMode === mode.id
                        ? 'text-accent-teal bg-accent-teal/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                    }`}
                    onClick={() => {
                      setRenderMode(mode.id)
                      setShowRenderDropdown(false)
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-px h-4 bg-border-subtle" />
        <span className="text-[10px] text-accent-teal font-mono tracking-wide">r184</span>
      </div>

      {/* Click-away */}
      {openMenu && <div className="fixed inset-0 z-40" onClick={() => { setOpenMenu(null); setOpenSubmenu(null) }} />}
    </div>
  )
}
