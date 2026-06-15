import React, { useCallback, useEffect } from 'react'
import Menubar from './components/Menubar'
import Sidebar from './components/Sidebar'
import Viewport from './components/Viewport'
import Toolbar from './components/Toolbar'
import RightPanel from './components/RightPanel'
import ViewportInfo from './components/ViewportInfo'
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
    <div className="flex flex-col w-full h-full bg-bg-primary">
      {/* Top Menu Bar */}
      <Menubar />

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <Sidebar />

        {/* 3D Viewport (center) */}
        <div className="relative flex-1 min-w-0">
          <Viewport />
          <Toolbar />
          <ViewportInfo />
        </div>

        {/* Right Panel */}
        <RightPanel />
      </div>

      {/* Modals */}
      <ShortcutsModal />
    </div>
  )
}
