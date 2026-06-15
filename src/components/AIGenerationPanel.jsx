import React, { useState, useRef } from 'react'
import useStore from '../store/store'

export default function AIGenerationPanel() {
  const [prompt, setPrompt] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [provider, setProvider] = useState('piapi')
  const [piapiParams, setPiapiParams] = useState({
    ss_sampling_steps: 50,
    slat_sampling_steps: 50,
    ss_guidance_strength: 7.5,
    slat_guidance_strength: 3
  })
  const fileInputRef = useRef(null)
  const isGenerating = useStore((s) => s.isGenerating)
  const generationStatus = useStore((s) => s.generationStatus)
  const startGeneration = useStore((s) => s.startGeneration)

  const handleGenerate = () => {
    if (!prompt.trim() && !uploadedFile) return
    startGeneration(prompt, uploadedFile, provider, piapiParams)
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0] || e.target?.files[0]
    if (file) setUploadedFile(file)
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{ width: '6px', height: '6px' }} className="rounded-full bg-accent-lavender" />
        <span className="text-[11px] font-semibold tracking-wider text-accent-lavender">
          AI MODEL GENERATION
        </span>
      </div>

      {/* Provider Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="text-[10px] font-medium text-text-muted tracking-wider uppercase">
          AI Provider
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          style={{ width: '100%', padding: '8px 12px' }}
          className="bg-bg-primary border border-border-default rounded-md text-xs text-text-primary focus:outline-none focus:border-accent-lavender/50 transition-colors duration-200 cursor-pointer"
        >
          <option value="piapi">PiAPI Trellis (Option 1)</option>
          <option value="hf">Hugging Face Spaces (Option 2)</option>
          <option value="tripo">Tripo3D (Option 3 - Enterprise)</option>
        </select>
      </div>

      {/* PiAPI Parameters (Only show if provider is piapi) */}
      {provider === 'piapi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', backgroundColor: '#1a1a1f', borderRadius: '8px', border: '1px solid #333' }}>
           <label className="text-[10px] font-medium text-accent-lavender tracking-wider uppercase">
            Trellis Quality Parameters
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
               <label className="text-[9px] text-text-muted truncate">SS Sampling ({piapiParams.ss_sampling_steps})</label>
               <input type="range" min="10" max="50" value={piapiParams.ss_sampling_steps} onChange={e => setPiapiParams({...piapiParams, ss_sampling_steps: Number(e.target.value)})} className="accent-accent-lavender" />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
               <label className="text-[9px] text-text-muted truncate">Slat Sampling ({piapiParams.slat_sampling_steps})</label>
               <input type="range" min="10" max="50" value={piapiParams.slat_sampling_steps} onChange={e => setPiapiParams({...piapiParams, slat_sampling_steps: Number(e.target.value)})} className="accent-accent-lavender" />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
               <label className="text-[9px] text-text-muted truncate">SS Guidance ({piapiParams.ss_guidance_strength})</label>
               <input type="range" min="0" max="10" step="0.5" value={piapiParams.ss_guidance_strength} onChange={e => setPiapiParams({...piapiParams, ss_guidance_strength: Number(e.target.value)})} className="accent-accent-lavender" />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
               <label className="text-[9px] text-text-muted truncate">Slat Guidance ({piapiParams.slat_guidance_strength})</label>
               <input type="range" min="0" max="10" step="0.5" value={piapiParams.slat_guidance_strength} onChange={e => setPiapiParams({...piapiParams, slat_guidance_strength: Number(e.target.value)})} className="accent-accent-lavender" />
             </div>
          </div>
        </div>
      )}

      {/* Text Prompt */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="text-[10px] font-medium text-text-muted tracking-wider uppercase">
          Text Prompt
        </label>
        <textarea
          id="ai-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g., "Stealth fighter jet with swept wings"'
          style={{ width: '100%', height: '80px', padding: '8px 12px' }}
          className="bg-bg-primary border border-border-default rounded-md text-xs text-text-primary placeholder:text-text-muted/50 resize-none focus:outline-none focus:border-accent-lavender/50 transition-colors duration-200"
          disabled={isGenerating}
        />
      </div>

      {/* Image Upload Zone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="text-[10px] font-medium text-text-muted tracking-wider uppercase">
          Sketch Upload
        </label>
        <div
          style={{ padding: '16px' }}
          className={`
            relative border-2 border-dashed rounded-lg text-center cursor-pointer
            transition-all duration-200 group
            ${
              uploadedFile
                ? 'border-accent-lavender/40 bg-accent-lavender/5'
                : 'border-border-default hover:border-accent-lavender/30 hover:bg-bg-hover'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileDrop}
          />

          {uploadedFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C5BAFF" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-xs text-accent-lavender truncate max-w-[180px]">
                {uploadedFile.name}
              </span>
              <button
                style={{ marginLeft: '4px' }}
                className="text-text-muted hover:text-danger text-xs cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setUploadedFile(null)
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <svg
                width="24" height="24" viewBox="0 0 24 24" fill="none"
                style={{ margin: '0 auto' }}
                className="opacity-30 group-hover:opacity-60 transition-opacity"
                stroke="currentColor" strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-[10px] text-text-muted">
                Drop a 2D sketch or <span className="text-accent-lavender">browse</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        id="ai-generate-btn"
        onClick={handleGenerate}
        disabled={isGenerating || (!prompt.trim() && !uploadedFile)}
        style={{ width: '100%', padding: '10px 0' }}
        className={`
          rounded-lg text-xs font-semibold tracking-wider uppercase
          transition-all duration-300 cursor-pointer
          ${
            isGenerating
              ? 'bg-accent-lavender/20 text-accent-lavender cursor-wait'
              : prompt.trim() || uploadedFile
              ? 'bg-gradient-to-r from-accent-lavender/80 to-accent-teal/80 text-white hover:from-accent-lavender hover:to-accent-teal shadow-lg hover:shadow-accent-lavender/20'
              : 'bg-bg-hover text-text-muted cursor-not-allowed'
          }
        `}
      >
        {isGenerating ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', animation: 'spin 0.8s linear infinite' }} className="border-2 border-accent-lavender/30 border-t-accent-lavender rounded-full" />
            Generating...
          </span>
        ) : (
          '⚡ Generate Model'
        )}
      </button>

      {/* Status */}
      {generationStatus && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }} className="bg-bg-primary rounded-lg border border-accent-lavender/20 animate-fade-in">
          <div style={{ width: '6px', height: '6px' }} className="rounded-full bg-accent-lavender animate-pulse-glow" />
          <span className="text-[11px] text-accent-lavender font-mono">
            {generationStatus}
          </span>
        </div>
      )}

      {/* Quick Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }} className="border-t border-border-subtle">
        <span className="text-[10px] font-medium text-text-muted tracking-wider uppercase">
          Quick Presets
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {['Stealth Jet', 'Cargo Drone', 'Space Shuttle', 'Rocket Body'].map(
            (preset) => (
              <button
                key={preset}
                style={{ padding: '6px 8px' }}
                className="text-[10px] text-text-secondary bg-bg-primary rounded border border-border-subtle hover:border-accent-lavender/30 hover:text-accent-lavender transition-all duration-150 cursor-pointer"
                onClick={() => setPrompt(preset)}
              >
                {preset}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
