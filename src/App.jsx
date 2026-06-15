import React, { useCallback, useEffect } from 'react'
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
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return

      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        copySelected()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        pasteClipboard()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        redo()
      }

      if (e.key === '?') {
        setShowShortcuts(true)
      }

      if (e.key === 'Delete' && selectedIds.length > 0) {
        selectedIds.forEach((id) => removePrimitive(id))
      }
      if (e.key === 'w' || e.key === 'W') setTransformMode('translate')
      if (e.key === 'e' || e.key === 'E') setTransformMode('rotate')
      if (e.key === 'r' || e.key === 'R') setTransformMode('scale')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, removePrimitive, setTransformMode])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-base)',
    }}>
      {/* Top Menu Bar */}
      <Menubar />

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Sidebar */}
        <Sidebar />

        {/* 3D Viewport (center) */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <Viewport />
          <Toolbar />
          <ViewportOverlay />
        </div>
      </div>

      {/* Modals */}
      <ShortcutsModal />
    </div>
  )
}
