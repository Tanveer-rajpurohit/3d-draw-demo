import React, { useState, useEffect } from 'react'
import useStore from '../store/store'

export default function Inspector() {
  const sceneObjects = useStore((s) => s.sceneObjects)
  const selectedIds = useStore((s) => s.selectedIds)
  const updateObject = useStore((s) => s.updateObject)
  const removePrimitive = useStore((s) => s.removePrimitive)
  const saveHistory = useStore((s) => s.saveHistory)

  const selectedObj = selectedIds.length === 1
    ? sceneObjects.find((o) => o.id === selectedIds[0])
    : null

  if (!selectedObj) {
    // Show info card when nothing selected
    return (
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '200px',
        backgroundColor: 'rgba(19, 19, 24, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px',
        zIndex: 15,
        pointerEvents: 'auto',
      }}>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Click an object to inspect
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Objects</span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>{sceneObjects.length}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <InspectorPanel
      key={selectedObj.id}
      obj={selectedObj}
      updateObject={updateObject}
      removePrimitive={removePrimitive}
      saveHistory={saveHistory}
    />
  )
}

function InspectorPanel({ obj, updateObject, removePrimitive, saveHistory }) {
  const [name, setName] = useState(obj.name)
  const [pos, setPos] = useState(obj.position)
  const [rot, setRot] = useState(obj.rotation.map(r => (r * 180 / Math.PI)))
  const [scl, setScl] = useState(obj.scale)
  const [color, setColor] = useState(obj.color || '#aaaaaa')

  // Sync from store when obj changes
  useEffect(() => {
    setName(obj.name)
    setPos([...obj.position])
    setRot(obj.rotation.map(r => (r * 180 / Math.PI)))
    setScl([...obj.scale])
    setColor(obj.color || '#aaaaaa')
  }, [obj.position, obj.rotation, obj.scale, obj.color, obj.name])

  const handlePosChange = (axis, val) => {
    const newPos = [...pos]
    newPos[axis] = parseFloat(val) || 0
    setPos(newPos)
    updateObject(obj.id, { position: newPos })
  }

  const handleRotChange = (axis, val) => {
    const newRot = [...rot]
    newRot[axis] = parseFloat(val) || 0
    setRot(newRot)
    updateObject(obj.id, { rotation: newRot.map(d => d * Math.PI / 180) })
  }

  const handleSclChange = (axis, val) => {
    const newScl = [...scl]
    newScl[axis] = parseFloat(val) || 0.01
    setScl(newScl)
    updateObject(obj.id, { scale: newScl })
  }

  const handleNameChange = (val) => {
    setName(val)
    updateObject(obj.id, { name: val })
  }

  const handleColorChange = (val) => {
    setColor(val)
    updateObject(obj.id, { color: val })
  }

  const inputStyle = {
    width: '100%',
    padding: '4px 6px',
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    fontSize: '10px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    transition: 'border-color 0.15s ease',
  }

  const labelStyle = {
    fontSize: '9px',
    color: 'var(--text-muted)',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '4px',
  }

  const axisColors = ['#ff4060', '#40ff60', '#4060ff']
  const axisLabels = ['X', 'Y', 'Z']

  const renderVec3Input = (values, onChange) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[0, 1, 2].map((axis) => (
        <div key={axis} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '8px', color: axisColors[axis], fontWeight: 600 }}>{axisLabels[axis]}</span>
          <input
            type="number"
            step="0.1"
            value={parseFloat(values[axis]).toFixed(2)}
            onChange={(e) => onChange(axis, e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = axisColors[axis]}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>
      ))}
    </div>
  )

  return (
    <div style={{
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '220px',
      backgroundColor: 'rgba(19, 19, 24, 0.92)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '12px',
      zIndex: 15,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      animation: 'fadeIn 0.12s ease-out forwards',
      pointerEvents: 'auto',
    }}>
      {/* Object Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        style={{
          ...inputStyle,
          fontSize: '11px',
          fontWeight: 600,
          fontFamily: 'inherit',
          padding: '6px 8px',
        }}
      />

      {/* Position */}
      <div>
        <div style={labelStyle}>Position</div>
        {renderVec3Input(pos, handlePosChange)}
      </div>

      {/* Rotation */}
      <div>
        <div style={labelStyle}>Rotation (deg)</div>
        {renderVec3Input(rot, handleRotChange)}
      </div>

      {/* Scale */}
      <div>
        <div style={labelStyle}>Scale</div>
        {renderVec3Input(scl, handleSclChange)}
      </div>

      {/* Color */}
      <div>
        <div style={labelStyle}>Color</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            style={{
              width: '32px', height: '24px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              padding: 0,
            }}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>{color}</span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => { saveHistory(); removePrimitive(obj.id) }}
        style={{
          width: '100%',
          padding: '6px 0',
          backgroundColor: 'transparent',
          border: '1px solid var(--danger)',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 500,
          color: 'var(--danger)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,68,102,0.1)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        🗑 Delete Object
      </button>
    </div>
  )
}
