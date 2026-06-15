import React, { useState, useRef } from 'react'
import useStore from '../store/store'

const presets = ['Fighter Jet','Stealth Drone','Transport Aircraft','Helicopter','Space Shuttle','Attack UAV']

export default function AIGenerationPanel() {
  const [prompt, setPrompt] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [provider, setProvider] = useState('piapi')
  const [piapiParams, setPiapiParams] = useState({ ss_sampling_steps:50, slat_sampling_steps:50, ss_guidance_strength:7.5, slat_guidance_strength:3 })
  const fileInputRef = useRef(null)
  const isGenerating = useStore((s) => s.isGenerating)
  const generationStatus = useStore((s) => s.generationStatus)
  const startGeneration = useStore((s) => s.startGeneration)

  const handleGenerate = () => { if (!prompt.trim() && !uploadedFile) return; startGeneration(prompt, uploadedFile, provider, piapiParams) }
  const handleFile = (e) => { const f = e.dataTransfer?.files[0] || e.target?.files[0]; if (f) setUploadedFile(f) }
  const canGen = prompt.trim() || uploadedFile
  const lbl = { fontSize:'10px', fontWeight:500, color:'var(--text-muted)', letterSpacing:'.08em', textTransform:'uppercase' }
  const inputBase = { width:'100%', padding:'8px 12px', backgroundColor:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'12px', color:'var(--text-primary)', outline:'none', fontFamily:'inherit', transition:'border-color .15s ease' }

  return (
    <div style={{ padding:'14px', display:'flex', flexDirection:'column', gap:'14px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ fontSize:'11px', fontWeight:600, letterSpacing:'.08em', color:'var(--text-primary)' }}>MODEL GENERATION</span>
      </div>

      {/* Prompt */}
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        <label style={lbl}>Text Prompt</label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} disabled={isGenerating}
          placeholder='e.g. "Stealth fighter jet with swept wings"'
          style={{ ...inputBase, height:'80px', resize:'none' }}
          onFocus={e => e.currentTarget.style.borderColor='var(--accent-purple)'}
          onBlur={e => e.currentTarget.style.borderColor='var(--border)'}
        />
      </div>

      {/* Image Upload */}
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        <label style={lbl}>Reference Image</label>
        <div onClick={() => fileInputRef.current?.click()} onDrop={handleFile} onDragOver={e => e.preventDefault()}
          style={{ padding:'16px', border:`2px dashed ${uploadedFile?'var(--accent-purple)':'var(--border)'}`, borderRadius:'8px', textAlign:'center', cursor:'pointer', transition:'all .15s ease', backgroundColor: uploadedFile?'rgba(139,111,255,.05)':'transparent' }}
          onMouseEnter={e => { if(!uploadedFile) e.currentTarget.style.borderColor='var(--accent-purple)' }}
          onMouseLeave={e => { if(!uploadedFile) e.currentTarget.style.borderColor='var(--border)' }}
        >
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
          {uploadedFile ? (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'var(--text-secondary)' }}><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              <span style={{ fontSize:'11px', color:'var(--text-primary)', maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{uploadedFile.name}</span>
              <button onClick={e => { e.stopPropagation(); setUploadedFile(null) }} style={{ marginLeft:'4px', color:'var(--text-muted)', cursor:'pointer', border:'none', background:'none', fontSize:'12px' }}>✕</button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', alignItems:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color:'var(--text-muted)' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p style={{ fontSize:'10px', color:'var(--text-muted)' }}>Drop an image or <span style={{ color:'var(--text-primary)', textDecoration: 'underline' }}>browse</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Provider */}
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        <label style={lbl}>AI Provider</label>
        <select value={provider} onChange={e => setProvider(e.target.value)} style={{ ...inputBase, cursor:'pointer', padding:'8px 12px', fontSize:'11px' }}>
          <option value="piapi">PiAPI Trellis</option>
          <option value="hf">Hugging Face (Hunyuan3D)</option>
          <option value="tripo">Tripo3D</option>
        </select>
      </div>

      {/* PiAPI Quality Params */}
      {provider === 'piapi' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', padding:'10px', backgroundColor:'var(--bg-surface)', borderRadius:'8px', border:'1px solid var(--border)' }}>
          <label style={{ ...lbl, color:'var(--accent-blue)' }}>Quality Parameters</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[
              { key:'ss_sampling_steps', label:'SS Steps', min:10, max:50, step:1 },
              { key:'slat_sampling_steps', label:'Slat Steps', min:10, max:50, step:1 },
              { key:'ss_guidance_strength', label:'SS Guide', min:0, max:10, step:0.5 },
              { key:'slat_guidance_strength', label:'Slat Guide', min:0, max:10, step:0.5 },
            ].map(({ key, label, min, max, step }) => (
              <div key={key} style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                <label style={{ fontSize:'9px', color:'var(--text-muted)' }}>{label} ({piapiParams[key]})</label>
                <input type="range" min={min} max={max} step={step} value={piapiParams[key]}
                  onChange={e => setPiapiParams({ ...piapiParams, [key]:Number(e.target.value) })}
                  style={{ width:'100%', accentColor:'var(--accent-blue)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate */}
      <button onClick={handleGenerate} disabled={isGenerating||!canGen} style={{
        width:'100%', padding:'12px 0', borderRadius:'8px', fontSize:'11px', fontWeight:600,
        letterSpacing:'.08em', textTransform:'uppercase', border:'none', fontFamily:'inherit',
        cursor: isGenerating?'wait': canGen?'pointer':'not-allowed',
        background: isGenerating ? 'var(--bg-surface)' : canGen ? 'var(--accent-brand)' : 'var(--bg-surface)',
        color: isGenerating ? 'var(--text-muted)' : canGen ? '#ffffff' : 'var(--text-muted)',
        transition:'all .2s ease',
      }}>
        {isGenerating ? (
          <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            Generating...
          </span>
        ) : 'Generate 3D Model'}
      </button>

      {/* Status */}
      {generationStatus && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px', backgroundColor:'var(--bg-base)', borderRadius:'8px', border:'1px solid rgba(139,111,255,.2)', animation:'fadeIn .15s ease-out forwards' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'var(--accent-purple)', animation:'pulseGlow 1.5s ease-in-out infinite' }}/>
          <span style={{ fontSize:'10px', color:'var(--accent-purple)', fontFamily:'var(--mono-font)' }}>{generationStatus}</span>
        </div>
      )}

      {/* Presets */}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px', paddingTop:'8px', borderTop:'1px solid var(--border)' }}>
        <span style={lbl}>Quick Presets</span>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {presets.map((p) => (
            <button key={p} onClick={() => setPrompt(p)} style={{
              padding:'5px 10px', fontSize:'10px', color:'var(--text-secondary)',
              backgroundColor:'var(--bg-base)', borderRadius:'12px', border:'1px solid var(--border)',
              cursor:'pointer', fontFamily:'inherit', transition:'all .15s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-purple)'; e.currentTarget.style.color='var(--accent-purple)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
            >{p}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
