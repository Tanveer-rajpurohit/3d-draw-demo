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
    return (
      <div style={{
        position:'absolute', top:'8px', right:'8px', width:'200px',
        backgroundColor:'rgba(19,19,24,.88)', backdropFilter:'blur(12px)',
        border:'1px solid var(--border)', borderRadius:'8px', padding:'12px', zIndex:15, pointerEvents:'auto',
      }}>
        <p style={{ fontSize:'10px', color:'var(--text-muted)', marginBottom:'8px' }}>Click an object to inspect</p>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px' }}>
          <span style={{ color:'var(--text-muted)' }}>Objects</span>
          <span style={{ color:'var(--text-secondary)', fontFamily:'var(--mono-font)' }}>{sceneObjects.length}</span>
        </div>
      </div>
    )
  }

  return <InspectorPanel key={selectedObj.id} obj={selectedObj} updateObject={updateObject} removePrimitive={removePrimitive} saveHistory={saveHistory} />
}

function InspectorPanel({ obj, updateObject, removePrimitive, saveHistory }) {
  const [name, setName] = useState(obj.name)
  const [pos, setPos] = useState(obj.position)
  const [rot, setRot] = useState(obj.rotation.map((r) => r * 180 / Math.PI))
  const [scl, setScl] = useState(obj.scale)
  const [color, setColor] = useState(obj.color || '#aaaaaa')

  useEffect(() => {
    setName(obj.name)
    setPos([...obj.position])
    setRot(obj.rotation.map((r) => r * 180 / Math.PI))
    setScl([...obj.scale])
    setColor(obj.color || '#aaaaaa')
  }, [obj.position, obj.rotation, obj.scale, obj.color, obj.name])

  const commit = (field, val) => updateObject(obj.id, { [field]: val })
  const posChange = (i, v) => { const p=[...pos]; p[i]=parseFloat(v)||0; setPos(p); commit('position',p) }
  const rotChange = (i, v) => { const r=[...rot]; r[i]=parseFloat(v)||0; setRot(r); commit('rotation',r.map(d=>d*Math.PI/180)) }
  const sclChange = (i, v) => { const s=[...scl]; s[i]=parseFloat(v)||0.01; setScl(s); commit('scale',s) }

  const inp = { width:'100%', padding:'4px 6px', backgroundColor:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:'4px', fontSize:'10px', color:'var(--text-primary)', outline:'none', fontFamily:'var(--mono-font)', transition:'border-color .15s ease' }
  const lbl = { fontSize:'9px', color:'var(--text-muted)', fontWeight:500, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:'4px' }
  const axisC = ['#ff4060','#40ff60','#4060ff']
  const axisL = ['X','Y','Z']

  const vec3 = (vals, onChange) => (
    <div style={{ display:'flex', gap:'4px' }}>
      {[0,1,2].map((i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', gap:'2px' }}>
          <span style={{ fontSize:'8px', color:axisC[i], fontWeight:600 }}>{axisL[i]}</span>
          <input type="number" step="0.1" value={parseFloat(vals[i]).toFixed(2)} onChange={e => onChange(i,e.target.value)}
            style={inp}
            onFocus={e => e.currentTarget.style.borderColor=axisC[i]}
            onBlur={e => e.currentTarget.style.borderColor='var(--border)'}
          />
        </div>
      ))}
    </div>
  )

  return (
    <div style={{
      position:'absolute', top:'8px', right:'8px', width:'220px',
      backgroundColor:'rgba(19,19,24,.92)', backdropFilter:'blur(12px)',
      border:'1px solid var(--border)', borderRadius:'8px', padding:'12px',
      zIndex:15, display:'flex', flexDirection:'column', gap:'10px',
      animation:'fadeIn .12s ease-out forwards', pointerEvents:'auto',
    }}>
      <input type="text" value={name}
        onChange={e => { setName(e.target.value); commit('name',e.target.value) }}
        style={{ ...inp, fontSize:'11px', fontWeight:600, fontFamily:'var(--ui-font)', padding:'6px 8px' }}
      />
      <div><div style={lbl}>Position</div>{vec3(pos, posChange)}</div>
      <div><div style={lbl}>Rotation (deg)</div>{vec3(rot, rotChange)}</div>
      <div><div style={lbl}>Scale</div>{vec3(scl, sclChange)}</div>
      <div>
        <div style={lbl}>Color</div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <input type="color" value={color} onChange={e => { setColor(e.target.value); commit('color',e.target.value) }}
            style={{ width:'32px', height:'24px', border:'1px solid var(--border)', borderRadius:'4px', cursor:'pointer', backgroundColor:'transparent', padding:0 }}
          />
          <span style={{ fontSize:'10px', color:'var(--text-secondary)', fontFamily:'var(--mono-font)' }}>{color}</span>
        </div>
      </div>
      <button onClick={() => { saveHistory(); removePrimitive(obj.id) }}
        style={{
          width:'100%', padding:'6px 0', backgroundColor:'transparent',
          border:'1px solid var(--danger)', borderRadius:'6px', fontSize:'10px',
          fontWeight:500, color:'var(--danger)', cursor:'pointer', fontFamily:'inherit',
          transition:'all .15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor='rgba(255,68,102,.1)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}
      >🗑 Delete Object</button>
    </div>
  )
}
