import React from 'react'
import useStore from '../store/store'

export default function SceneOutliner() {
  const sceneObjects = useStore((s) => s.sceneObjects)
  const selectedId = useStore((s) => s.selectedId)
  const setSelectedId = useStore((s) => s.setSelectedId)
  const removePrimitive = useStore((s) => s.removePrimitive)

  const builtInItems = [
    { label: 'Camera', type: 'Camera', color: '#dd8888' },
    { label: 'Scene', type: 'Scene', color: '#8888dd' },
    { label: 'Ambient Light', type: 'Light', color: '#dddd88' },
    { label: 'Point Light', type: 'Light', color: '#dddd88' },
    { label: 'CSG Fuselage', type: 'Mesh', color: '#8888ee' },
    { label: 'Grid', type: 'Object3D', color: '#aaaaee' },
  ]

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
        <span className="text-[11px] font-semibold tracking-wider text-accent-blue">
          SCENE HIERARCHY
        </span>
      </div>

      {/* Built-in items */}
      <div className="bg-bg-primary rounded-lg border border-border-subtle overflow-hidden">
        {builtInItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover transition-colors"
          >
            <span style={{ color: item.color }} className="text-[10px]">●</span>
            <span className="text-text-secondary">{item.label}</span>
            <span className="ml-auto text-[9px] text-text-muted font-mono">{item.type}</span>
          </div>
        ))}
      </div>

      {/* Dynamic objects */}
      {sceneObjects.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-text-muted tracking-wider uppercase">
            User Objects
          </span>
          <div className="bg-bg-primary rounded-lg border border-border-subtle overflow-hidden">
            {sceneObjects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => setSelectedId(obj.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer transition-all duration-100
                  ${
                    selectedId === obj.id
                      ? 'bg-accent-teal/10 text-accent-teal'
                      : 'text-text-secondary hover:bg-bg-hover'
                  }
                `}
              >
                <span className={`text-[10px] ${selectedId === obj.id ? 'text-accent-teal' : 'text-[#8888ee]'}`}>●</span>
                <span className="capitalize">{obj.type === 'generated' ? `AI: ${obj.prompt?.slice(0, 15)}...` : obj.type}</span>
                <span className="ml-auto text-[9px] text-text-muted font-mono">{obj.id}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removePrimitive(obj.id)
                  }}
                  className="text-text-muted hover:text-danger transition-colors text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="p-3 bg-bg-primary rounded-lg border border-border-subtle space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-text-muted">Objects</span>
          <span className="text-text-secondary font-mono">{sceneObjects.length + builtInItems.length}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-text-muted">User Meshes</span>
          <span className="text-text-secondary font-mono">{sceneObjects.length}</span>
        </div>
      </div>
    </div>
  )
}
