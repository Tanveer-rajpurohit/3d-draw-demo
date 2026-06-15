import React, { useEffect } from 'react'
import Menubar from './components/Menubar'
import Sidebar from './components/Sidebar'
import Viewport from './components/Viewport'
import Toolbar from './components/Toolbar'
import ViewportOverlay from './components/ViewportOverlay'
import ShortcutsModal from './components/ShortcutsModal'
import useStore from './store/store'

export default function App() {
  const selectedIds = useStore((s) => s.selectedIds)
  const removePrimitive = useStore((s) => s.removePrimitive)
  const setTransformMode = useStore((s) => s.setTransformMode)
  const setShowShortcuts = useStore((s) => s.setShowShortcuts)
  const copySelected = useStore((s) => s.copySelected)
  const pasteClipboard = useStore((s) => s.pasteClipboard)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return

      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key.toLowerCase() === 'c') { e.preventDefault(); copySelected() }
      if (ctrl && e.key.toLowerCase() === 'v') { e.preventDefault(); pasteClipboard() }
      if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); undo() }
      if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); redo() }
      if (e.key === '?') setShowShortcuts(true)
      if (e.key === 'Delete' && selectedIds.length > 0) {
        selectedIds.forEach((id) => removePrimitive(id))
      }
      if (e.key.toLowerCase() === 'w') setTransformMode('translate')
      if (e.key.toLowerCase() === 'e') setTransformMode('rotate')
      if (e.key.toLowerCase() === 'r') setTransformMode('scale')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, removePrimitive, setTransformMode, copySelected, pasteClipboard, undo, redo, setShowShortcuts])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-base)',
    }}>
      <Menubar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <Viewport />
          <Toolbar />
          <ViewportOverlay />
        </div>
      </div>
      <ShortcutsModal />
    </div>
  )
}
