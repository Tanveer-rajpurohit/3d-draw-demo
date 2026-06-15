import React from 'react'
import useStore from '../store/store'

const typeIcons = {
  box:'⬡', cylinder:'⏣', sphere:'◉', cone:'△', torus:'◎', plane:'▭',
  capsule:'⬭', ring:'○', torusknot:'∞', csg_result:'⊕', gltf:'📦',
  pointlight:'💡', directionallight:'☀', spotlight:'🔦',
  hemispherelight:'🌗', ambientlight:'🔆',
}

export default function SceneOutliner() {
  const sceneObjects = useStore((s) => s.sceneObjects)
  const selectedIds = useStore((s) => s.selectedIds)
  const toggleSelection = useStore((s) => s.toggleSelection)
  const removePrimitive = useStore((s) => s.removePrimitive)
  const updateObject = useStore((s) => s.updateObject)

  return (
    <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'var(--accent-teal)' }}/>
        <span style={{ fontSize:'11px', fontWeight:600, letterSpacing:'.08em', color:'var(--accent-teal)' }}>SCENE OBJECTS</span>
        <span style={{ marginLeft:'auto', fontSize:'10px', color:'var(--text-muted)', fontFamily:'var(--mono-font)' }}>{sceneObjects.length}</span>
      </div>

      {sceneObjects.length === 0 ? (
        <div style={{ padding:'24px', textAlign:'center', color:'var(--text-muted)', fontSize:'11px', borderRadius:'8px', border:'1px dashed var(--border)' }}>
          No objects in scene.<br/><span style={{ fontSize:'10px', marginTop:'4px', display:'block' }}>Use the ADD tab to get started.</span>
        </div>
      ) : (
        <div style={{ borderRadius:'8px', border:'1px solid var(--border)', overflow:'hidden' }}>
          {sceneObjects.map((obj) => {
            const sel = selectedIds.includes(obj.id)
            return (
              <div key={obj.id} onClick={() => toggleSelection(obj.id, false)}
                style={{
                  display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', fontSize:'11px',
                  cursor:'pointer', transition:'all .1s ease',
                  backgroundColor: sel?'rgba(74,158,255,.08)':'transparent',
                  color: sel?'var(--accent-blue)':'var(--text-secondary)',
                  borderBottom:'1px solid var(--border)',
                }}
                onMouseEnter={e => { if(!sel) e.currentTarget.style.backgroundColor='var(--bg-panel-hover)' }}
                onMouseLeave={e => { if(!sel) e.currentTarget.style.backgroundColor='transparent' }}
              >
                <span style={{ fontSize:'12px', width:'18px', textAlign:'center' }}>{typeIcons[obj.type]||'■'}</span>
                <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{obj.name||obj.type}</span>
                <button onClick={e => { e.stopPropagation(); updateObject(obj.id, { visible:!obj.visible }) }}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:'2px', color: obj.visible?'var(--text-muted)':'var(--danger)', fontSize:'11px' }}
                  title={obj.visible?'Hide':'Show'}
                >{obj.visible?'👁':'🚫'}</button>
                <button onClick={e => { e.stopPropagation(); removePrimitive(obj.id) }}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:'2px', color:'var(--text-muted)', fontSize:'10px', transition:'color .15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                >✕</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Stats */}
      <div style={{ padding:'10px', backgroundColor:'var(--bg-base)', borderRadius:'8px', border:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'4px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px' }}>
          <span style={{ color:'var(--text-muted)' }}>Total Objects</span>
          <span style={{ color:'var(--text-secondary)', fontFamily:'var(--mono-font)' }}>{sceneObjects.length}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px' }}>
          <span style={{ color:'var(--text-muted)' }}>Selected</span>
          <span style={{ color: selectedIds.length>0?'var(--accent-blue)':'var(--text-secondary)', fontFamily:'var(--mono-font)' }}>{selectedIds.length}</span>
        </div>
      </div>
    </div>
  )
}
