import React, { useState, useRef } from 'react'
import useStore from '../store/store'

const presets = ['Fighter Jet', 'Stealth Drone', 'Transport Aircraft', 'Helicopter', 'Space Shuttle', 'Attack UAV']

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

  const labelStyle = {
    fontSize: '10px',
    fontWeight: 500,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }

  const canGenerate = prompt.trim() || uploadedFile

  return (
    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }} />
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--accent-purple)' }}>
          AI MODEL GENERATION
        </span>
      </div>

      {/* Prompt */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Text Prompt</label>
        <textarea
          id="ai-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g., "Stealth fighter jet with swept wings"'
          disabled={isGenerating}
          style={{
            width: '100%',
            height: '80px',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Image Upload */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Image Upload</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            padding: '16px',
            border: `2px dashed ${uploadedFile ? 'var(--accent-purple)' : 'var(--border)'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: uploadedFile ? 'rgba(139, 111, 255, 0.05)' : 'transparent',
          }}
          onMouseEnter={(e) => { if (!uploadedFile) e.currentTarget.style.borderColor = 'var(--accent-purple)' }}
          onMouseLeave={(e) => { if (!uploadedFile) e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileDrop}
          />
          {uploadedFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--accent-purple)' }}>📎</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-purple)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {uploadedFile.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setUploadedFile(null) }}
                style={{ marginLeft: '4px', color: 'var(--text-muted)', cursor: 'pointer', border: 'none', background: 'none', fontSize: '12px', fontFamily: 'inherit' }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', opacity: 0.3 }}>📤</span>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Drop an image or <span style={{ color: 'var(--accent-purple)' }}>browse</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Provider Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>AI Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '11px',
            color: 'var(--text-primary)',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'border-color 0.15s ease',
          }}
        >
          <option value="piapi">🔷 PiAPI Trellis</option>
          <option value="hf">🤗 Hugging Face (Hunyuan3D)</option>
          <option value="tripo">⭐ Tripo3D (Enterprise)</option>
        </select>
      </div>

      {/* PiAPI Params */}
      {provider === 'piapi' && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          padding: '10px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}>
          <label style={{ ...labelStyle, color: 'var(--accent-blue)' }}>Quality Parameters</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { key: 'ss_sampling_steps', label: 'SS Sampling', min: 10, max: 50, step: 1 },
              { key: 'slat_sampling_steps', label: 'Slat Sampling', min: 10, max: 50, step: 1 },
              { key: 'ss_guidance_strength', label: 'SS Guidance', min: 0, max: 10, step: 0.5 },
              { key: 'slat_guidance_strength', label: 'Slat Guidance', min: 0, max: 10, step: 0.5 },
            ].map(({ key, label, min, max, step }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{label} ({piapiParams[key]})</label>
                <input
                  type="range" min={min} max={max} step={step}
                  value={piapiParams[key]}
                  onChange={e => setPiapiParams({...piapiParams, [key]: Number(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        id="ai-generate-btn"
        onClick={handleGenerate}
        disabled={isGenerating || !canGenerate}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: isGenerating ? 'wait' : canGenerate ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          background: isGenerating
            ? 'rgba(139, 111, 255, 0.15)'
            : canGenerate
              ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))'
              : 'var(--bg-surface)',
          color: isGenerating
            ? 'var(--accent-purple)'
            : canGenerate
              ? 'white'
              : 'var(--text-muted)',
          boxShadow: canGenerate && !isGenerating ? '0 4px 16px rgba(74, 158, 255, 0.2)' : 'none',
        }}
      >
        {isGenerating ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              width: '12px', height: '12px',
              border: '2px solid rgba(139,111,255,0.3)',
              borderTopColor: 'var(--accent-purple)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              display: 'inline-block',
            }} />
            Generating...
          </span>
        ) : (
          '⚡ Generate 3D Model'
        )}
      </button>

      {/* Status */}
      {generationStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px',
          backgroundColor: 'var(--bg-base)', borderRadius: '8px',
          border: '1px solid rgba(139, 111, 255, 0.2)',
          animation: 'fadeIn 0.15s ease-out forwards',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', animation: 'pulseGlow 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
            {generationStatus}
          </span>
        </div>
      )}

      {/* Quick Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
        <span style={labelStyle}>Quick Presets</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setPrompt(preset)}
              style={{
                padding: '5px 10px',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-base)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.color = 'var(--accent-purple)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
