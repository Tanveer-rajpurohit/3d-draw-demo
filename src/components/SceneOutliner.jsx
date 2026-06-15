import React from 'react'
import useStore from '../store/store'

export default function SceneOutliner() {
  const sceneObjects = useStore((s) => s.sceneObjects)
  const selectedIds = useStore((s) => s.selectedIds)
  const setSelectedIds = useStore((s) => s.setSelectedIds)
  const toggleSelection = useStore((s) => s.toggleSelection)
  const removePrimitive = useStore((s) => s.removePrimitive)
  const updateObject = useStore((s) => s.updateObject)

  const typeIcons = {
    box: '⬡', cylinder: '⏣', sphere: '◉', cone: '△', torus: '◎',
    plane: '▭', capsule: '⬭', ring: '○', tube: '◌', csg: '⊕',
    gltf: '📦', pointlight: '💡', directionallight: '☀', spotlight: '🔦',
  }

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)' }} />
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--accent-teal)' }}>
          SCENE OBJECTS
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
          {sceneObjects.length}
        </span>
      </div>

      {/* Object List */}
      {sceneObjects.length === 0 ? (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '11px',
          borderRadius: '8px',
          border: '1px dashed var(--border)',
        }}>
          No objects in scene.
          <br />
          <span style={{ fontSize: '10px', marginTop: '4px', display: 'block' }}>Use the ADD tab to get started.</span>
        </div>
      ) : (
        <div style={{
          borderRadius: '8px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {sceneObjects.map((obj) => {
            const isSelected = selectedIds.includes(obj.id)
            return (
              <div
                key={obj.id}
                onClick={() => toggleSelection(obj.id, false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  backgroundColor: isSelected ? 'rgba(74, 158, 255, 0.08)' : 'transparent',
                  color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {/* Icon */}
                <span style={{ fontSize: '12px', width: '18px', textAlign: 'center' }}>
                  {typeIcons[obj.type] || '■'}
                </span>

                {/* Name */}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {obj.name || obj.type}
                </span>

                {/* Visibility toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { visible: !obj.visible }) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: obj.visible ? 'var(--text-muted)' : 'var(--danger)',
                    fontSize: '11px',
                  }}
                  title={obj.visible ? 'Hide' : 'Show'}
                >
                  {obj.visible ? '👁' : '🚫'}
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); removePrimitive(obj.id) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: 'var(--text-muted)', fontSize: '10px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Scene Stats */}
      <div style={{
        padding: '10px',
        backgroundColor: 'var(--bg-base)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Objects</span>
          <span style={{ color: 'var(--text-secondary)', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>{sceneObjects.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Selected</span>
          <span style={{ color: selectedIds.length > 0 ? 'var(--accent-blue)' : 'var(--text-secondary)', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>{selectedIds.length}</span>
        </div>
      </div>
    </div>
  )
}
