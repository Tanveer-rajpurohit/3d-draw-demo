import React, { useState } from 'react'
import useStore from '../store/store'

const meshItems = [
  'Box', 'Capsule', 'Circle', 'Cylinder', 'Dodecahedron', 'Icosahedron',
  'Lathe', 'Octahedron', 'Plane', 'Ring', 'Sphere', 'Tetrahedron',
  'Torus', 'TorusKnot', 'Tube', 'Cone',
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
    ],
  },
  { label: 'View', items: ['Front', 'Right', 'Top', 'Reset Camera', 'Toggle Grid'] },
  { label: 'Help', items: ['Keyboard Shortcuts', 'About SkyForge AI'] },
]

export default function Menubar() {
  const [openMenu, setOpenMenu] = useState(null)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const addPrimitive = useStore((s) => s.addPrimitive)
  const clearScene = useStore((s) => s.clearScene)
  const addModel = useStore((s) => s.addModel)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const copySelected = useStore((s) => s.copySelected)
  const pasteClipboard = useStore((s) => s.pasteClipboard)
  const removePrimitive = useStore((s) => s.removePrimitive)
  const selectedIds = useStore((s) => s.selectedIds)
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

  const menuBtnStyle = (isOpen) => ({
    padding: '4px 10px',
    fontSize: '12px',
    color: isOpen ? '#e8e8f0' : '#9090a8',
    backgroundColor: isOpen ? '#1a1a22' : 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'background 0.15s ease, color 0.15s ease',
    fontFamily: 'inherit',
  })

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: '180px',
    backgroundColor: 'var(--bg-panel)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    padding: '4px 0',
    zIndex: 50,
    animation: 'fadeIn 0.12s ease-out forwards',
  }

  const dropdownItemStyle = (isActive) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '6px 16px',
    fontSize: '11px',
    color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.1s ease, color 0.1s ease',
    fontFamily: 'inherit',
  })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: '36px',
      backgroundColor: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      userSelect: 'none',
      flexShrink: 0,
      zIndex: 50,
      padding: '0 16px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '32px' }}>
        <div style={{
          width: '22px', height: '22px',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          borderRadius: '5px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
          </svg>
        </div>
        <span style={{
          fontSize: '13px', fontWeight: 700, letterSpacing: '1.5px',
          background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-teal))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>SKYFORGE</span>
      </div>

      {/* Menus */}
      <div style={{ display: 'flex', gap: '2px', height: '100%', alignItems: 'center' }}>
        {menus.map((menu) => (
          <div
            key={menu.label}
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => openMenu !== null && setOpenMenu(menu.label)}
            onMouseLeave={() => setOpenSubmenu(null)}
          >
            <button
              id={`menu-${menu.label.toLowerCase()}`}
              style={menuBtnStyle(openMenu === menu.label)}
              onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              onMouseEnter={(e) => { if (openMenu !== menu.label) e.currentTarget.style.color = '#e8e8f0' }}
              onMouseLeave={(e) => { if (openMenu !== menu.label) e.currentTarget.style.color = '#9090a8' }}
            >
              {menu.label}
            </button>

            {openMenu === menu.label && (
              <div style={dropdownStyle}>
                {menu.submenus
                  ? menu.submenus.map((sub, idx) =>
                      sub.submenu ? (
                        <div
                          key={idx}
                          style={{ position: 'relative' }}
                          onMouseEnter={() => setOpenSubmenu(sub.label)}
                          onMouseLeave={() => setOpenSubmenu(null)}
                        >
                          <div
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '6px 16px', fontSize: '11px', cursor: 'pointer',
                              color: 'var(--text-secondary)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                          >
                            <span>{sub.label}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '16px' }}>▸</span>
                          </div>
                          {openSubmenu === sub.label && (
                            <div style={{ ...dropdownStyle, left: '100%', top: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                              {sub.items.map((item, i) => (
                                <button
                                  key={i}
                                  style={dropdownItemStyle(false)}
                                  onClick={() => handleMeshAdd(item)}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
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
                          style={dropdownItemStyle(false)}
                          onClick={() => handleItemClick(menu.label, sub.label)}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                        >
                          {sub.label}
                        </button>
                      )
                    )
                  : menu.items.map((item, idx) => (
                      <button
                        key={idx}
                        style={dropdownItemStyle(false)}
                        onClick={() => handleItemClick(menu.label, item)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                      >
                        {item}
                      </button>
                    ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: '0.5px' }}>
          v1.0
        </span>
      </div>

      {/* Click-away */}
      {openMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => { setOpenMenu(null); setOpenSubmenu(null) }} />}
    </div>
  )
}
