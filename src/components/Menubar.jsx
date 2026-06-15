import React, { useState } from 'react'
import useStore from '../store/store'

const meshItems = [
  'Box','Capsule','Circle','Cone','Cylinder','Dodecahedron','Icosahedron',
  'Octahedron','Plane','Ring','Sphere','Tetrahedron','Torus','TorusKnot',
]

const menus = [
  { label:'File', items:['New Project','Import...','Save','Export GLTF'] },
  { label:'Edit', items:['Undo','Redo','Delete Selected','Copy','Paste','Clear Scene'] },
  { label:'Add',  submenus:[
    { label:'Mesh', items:meshItems, submenu:true },
    { label:'Light', items:['AmbientLight','DirectionalLight','HemisphereLight','PointLight','SpotLight'], submenu:true },
  ]},
  { label:'View', items:['Front','Right','Top','Reset Camera'] },
  { label:'Help', items:['Keyboard Shortcuts','About SkyForge AI'] },
]

export default function Menubar() {
  const [openMenu, setOpenMenu] = useState(null)
  const [openSub, setOpenSub] = useState(null)
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

  const doAdd = (name) => { setOpenMenu(null); setOpenSub(null); addPrimitive(name.toLowerCase().replace(/\s+/g,'')) }
  const doImport = () => {
    const inp = document.createElement('input'); inp.type='file'; inp.accept='.glb,.gltf'
    inp.onchange = (e) => { const f=e.target.files[0]; if(f) addModel(URL.createObjectURL(f),f.name) }
    inp.click()
  }
  const doAction = (item) => {
    setOpenMenu(null)
    if(item==='Clear Scene') clearScene()
    if(item==='Import...') doImport()
    if(item==='Keyboard Shortcuts') setShowShortcuts(true)
    if(item==='Undo') undo()
    if(item==='Redo') redo()
    if(item==='Copy') copySelected()
    if(item==='Paste') pasteClipboard()
    if(item==='Delete Selected') selectedIds.forEach(id=>removePrimitive(id))
  }

  const S = {
    bar: { display:'flex', alignItems:'center', height:'36px', backgroundColor:'var(--bg-panel)', borderBottom:'1px solid var(--border)', userSelect:'none', flexShrink:0, zIndex:50, padding:'0 16px' },
    btn: (on) => ({ padding:'4px 10px', fontSize:'12px', color:on?'var(--text-primary)':'var(--text-secondary)', backgroundColor:on?'var(--bg-panel-hover)':'transparent', borderRadius:'4px', cursor:'pointer', border:'none', fontFamily:'inherit', transition:'all .12s ease' }),
    drop: { position:'absolute', top:'100%', left:0, minWidth:'170px', backgroundColor:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:'6px', boxShadow:'0 8px 32px rgba(0,0,0,.5)', padding:'4px 0', zIndex:50, animation:'fadeIn .12s ease-out forwards' },
    item: { display:'block', width:'100%', textAlign:'left', padding:'6px 14px', fontSize:'11px', color:'var(--text-secondary)', backgroundColor:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all .1s ease' },
  }

  return (
    <div style={S.bar}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginRight:'28px' }}>
        <span style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.5px', color:'var(--text-primary)' }}>Airix — AI-Powered Aircraft Design & Fleet Intelligence</span>
      </div>

      {/* Menus */}
      <div style={{ display:'flex', gap:'2px', height:'100%', alignItems:'center' }}>
        {menus.map((m) => (
          <div key={m.label} style={{ position:'relative', height:'100%', display:'flex', alignItems:'center' }}
            onMouseEnter={() => openMenu!==null && setOpenMenu(m.label)}
            onMouseLeave={() => setOpenSub(null)}
          >
            <button style={S.btn(openMenu===m.label)}
              onClick={() => setOpenMenu(openMenu===m.label?null:m.label)}
              onMouseEnter={e => { if(openMenu!==m.label) e.currentTarget.style.color='var(--text-primary)' }}
              onMouseLeave={e => { if(openMenu!==m.label) e.currentTarget.style.color='var(--text-secondary)' }}
            >{m.label}</button>

            {openMenu===m.label && (
              <div style={S.drop}>
                {m.submenus ? m.submenus.map((sub,i) =>
                  sub.submenu ? (
                    <div key={i} style={{ position:'relative' }}
                      onMouseEnter={() => setOpenSub(sub.label)}
                      onMouseLeave={() => setOpenSub(null)}
                    >
                      <div style={{ ...S.item, display:'flex', justifyContent:'space-between' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor='var(--bg-panel-hover)'; e.currentTarget.style.color='var(--text-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--text-secondary)' }}
                      >
                        <span>{sub.label}</span><span style={{ color:'var(--text-muted)' }}>▸</span>
                      </div>
                      {openSub===sub.label && (
                        <div style={{ ...S.drop, left:'100%', top:0, maxHeight:'70vh', overflowY:'auto' }}>
                          {sub.items.map((it,j) => (
                            <button key={j} style={S.item} onClick={() => doAdd(it)}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor='var(--bg-panel-hover)'; e.currentTarget.style.color='var(--text-primary)' }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--text-secondary)' }}
                            >{it}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button key={i} style={S.item} onClick={() => doAction(sub.label)}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor='var(--bg-panel-hover)'; e.currentTarget.style.color='var(--text-primary)' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--text-secondary)' }}
                    >{sub.label}</button>
                  )
                ) : m.items.map((it,i) => (
                  <button key={i} style={S.item} onClick={() => doAction(it)}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor='var(--bg-panel-hover)'; e.currentTarget.style.color='var(--text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--text-secondary)' }}
                  >{it}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginLeft:'auto', fontSize:'10px', color:'var(--text-muted)', fontFamily:'var(--mono-font)', letterSpacing:'.5px' }}>v1.0</div>

      {openMenu && <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={() => { setOpenMenu(null); setOpenSub(null) }} />}
    </div>
  )
}
