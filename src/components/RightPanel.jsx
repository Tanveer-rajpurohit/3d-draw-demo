import React from 'react'
import useStore from '../store/store'

export default function RightPanel() {
  const rightPanelTab = useStore((s) => s.rightPanelTab)
  const setRightPanelTab = useStore((s) => s.setRightPanelTab)

  const tabs = ['scene', 'project', 'settings']

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] bg-bg-secondary border-l border-border-subtle select-none shrink-0 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-border-subtle shrink-0 bg-[#1b1b1b]">
        {tabs.map((tab) => (
          <button
            key={tab}
            id={`right-tab-${tab}`}
            onClick={() => setRightPanelTab(tab)}
            className={`flex-1 py-2.5 text-[10px] font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer border-r border-border-subtle last:border-r-0
              ${rightPanelTab === tab ? 'text-text-secondary bg-bg-secondary' : 'text-text-muted hover:text-text-secondary'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {rightPanelTab === 'scene' && <SceneTab />}
        {rightPanelTab === 'project' && <ProjectTab />}
        {rightPanelTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

/* ─── Scene Tab ─── */
function SceneTab() {
  const sceneObjects = useStore((s) => s.sceneObjects)
  const selectedIds = useStore((s) => s.selectedIds)
  const toggleSelection = useStore((s) => s.toggleSelection)
  const sceneBackground = useStore((s) => s.sceneBackground)
  const setSceneBackground = useStore((s) => s.setSceneBackground)
  const sceneEnvironment = useStore((s) => s.sceneEnvironment)
  const setSceneEnvironment = useStore((s) => s.setSceneEnvironment)
  const sceneFog = useStore((s) => s.sceneFog)
  const setSceneFog = useStore((s) => s.setSceneFog)

  const builtInItems = [
    { label: 'Camera', type: 'Camera', color: '#dd8888' },
    { label: 'Scene', type: 'Scene', color: '#8888dd', children: true },
  ]

  return (
    <div className="animate-fade-in">
      {/* Scene Outliner */}
      <div className="bg-[#222] border-b border-border-subtle overflow-y-auto" style={{ minHeight: '140px', maxHeight: '220px', resize: 'vertical' }}>
        {/* Built-in */}
        {builtInItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 px-3 py-1 text-[12px] text-text-secondary hover:bg-[rgba(21,60,94,0.3)] transition-colors cursor-pointer">
            <span style={{ color: item.color }} className="text-[9px]">●</span>
            <span>{item.label}</span>
          </div>
        ))}

        {/* CSG Model */}
        <div className="flex items-center gap-1.5 px-6 py-1 text-[12px] text-text-secondary hover:bg-[rgba(21,60,94,0.3)] cursor-pointer">
          <span className="text-[9px] text-[#8888ee]">●</span>
          <span>CSG Fuselage</span>
          <span className="text-[9px] text-[#aaeeaa] ml-1">●</span>
          <span className="text-[9px] text-[#eeaaee]">●</span>
        </div>

        {/* User objects */}
        {sceneObjects.map((obj) => (
          <div
            key={obj.id}
            onClick={(e) => toggleSelection(obj.id, e.shiftKey || e.ctrlKey || e.metaKey)}
            className={`flex items-center gap-1.5 px-6 py-1 text-[12px] cursor-pointer transition-colors ${
              selectedIds.includes(obj.id)
                ? 'bg-[rgba(21,60,94,1)] text-text-primary'
                : 'text-text-secondary hover:bg-[rgba(21,60,94,0.3)]'
            }`}
          >
            <span className="text-[9px] text-[#8888ee]">●</span>
            <span>{obj.name || obj.type}</span>
            <span className="text-[9px] text-[#aaeeaa] ml-0.5">●</span>
            <span className="text-[9px] text-[#eeaaee]">●</span>
          </div>
        ))}
      </div>

      {/* Scene Settings */}
      <div className="p-3 space-y-3 border-b border-border-subtle">
        <SettingsRow label="Background">
          <select
            value={sceneBackground}
            onChange={(e) => setSceneBackground(e.target.value)}
            className="bg-[#222] border border-border-subtle rounded text-xs text-text-secondary px-2 py-1 uppercase w-[120px] cursor-pointer outline-none"
          >
            <option value="Default">DEFAULT</option>
            <option value="Color">COLOR</option>
            <option value="Texture">TEXTURE</option>
          </select>
        </SettingsRow>

        <SettingsRow label="Environment">
          <select
            value={sceneEnvironment}
            onChange={(e) => setSceneEnvironment(e.target.value)}
            className="bg-[#222] border border-border-subtle rounded text-xs text-text-secondary px-2 py-1 uppercase w-[120px] cursor-pointer outline-none"
          >
            <option value="Default">DEFAULT</option>
            <option value="None">NONE</option>
          </select>
        </SettingsRow>

        <SettingsRow label="Fog">
          <select
            value={sceneFog}
            onChange={(e) => setSceneFog(e.target.value)}
            className="bg-[#222] border border-border-subtle rounded text-xs text-text-secondary px-2 py-1 uppercase w-[120px] cursor-pointer outline-none"
          >
            <option value="None">NONE</option>
            <option value="Linear">LINEAR</option>
            <option value="Exponential">EXPONENTIAL</option>
          </select>
        </SettingsRow>
      </div>

      {/* Object Properties (when selected) */}
      <ObjectProperties />
    </div>
  )
}

/* ─── Object Properties Panel ─── */
function ObjectProperties() {
  const selectedIds = useStore((s) => s.selectedIds)
  const sceneObjects = useStore((s) => s.sceneObjects)
  const updateObject = useStore((s) => s.updateObject)
  const propertiesTab = useStore((s) => s.propertiesTab)
  const setPropertiesTab = useStore((s) => s.setPropertiesTab)

  // Show properties for the last selected object
  const activeId = selectedIds[selectedIds.length - 1]
  const selectedObj = sceneObjects.find((o) => o.id === activeId)

  if (!selectedObj) return null

  const propTabs = ['object', 'geometry', 'material', 'script']

  return (
    <div className="animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex border-b border-border-subtle bg-[#1b1b1b]">
        {propTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setPropertiesTab(tab)}
            className={`flex-1 py-2 text-[10px] font-semibold tracking-wider uppercase cursor-pointer transition-colors border-r border-border-subtle last:border-r-0
              ${propertiesTab === tab ? 'text-text-secondary bg-bg-secondary' : 'text-text-muted hover:text-text-secondary'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-2.5">
        {propertiesTab === 'object' && (
          <ObjectTab obj={selectedObj} updateObject={updateObject} />
        )}
        {propertiesTab === 'geometry' && (
          <GeometryTab obj={selectedObj} updateObject={updateObject} />
        )}
        {propertiesTab === 'material' && (
          <MaterialTab obj={selectedObj} updateObject={updateObject} />
        )}
        {propertiesTab === 'script' && (
          <div className="text-[11px] text-text-muted py-4 text-center">No scripts attached</div>
        )}
      </div>
    </div>
  )
}

/* ─── Object Tab ─── */
function ObjectTab({ obj, updateObject }) {
  return (
    <>
      <SettingsRow label="Type">
        <span className="text-xs text-text-secondary">Mesh</span>
      </SettingsRow>

      <SettingsRow label="UUID">
        <span className="text-[10px] text-text-muted font-mono truncate max-w-[120px] inline-block">{obj.id}</span>
        <button className="ml-1 px-1.5 py-0.5 text-[9px] bg-[#222] border border-border-subtle rounded text-text-secondary hover:text-text-primary cursor-pointer">NEW</button>
      </SettingsRow>

      <SettingsRow label="Name">
        <input
          type="text"
          value={obj.name || ''}
          onChange={(e) => updateObject(obj.id, { name: e.target.value })}
          className="bg-[#222] border border-transparent focus:border-border-default rounded text-xs text-text-primary px-2 py-0.5 w-[140px] outline-none"
        />
      </SettingsRow>

      {/* Position */}
      <SettingsRow label="Position">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <NumberInput
              key={i}
              value={obj.position[i]}
              onChange={(val) => {
                const p = [...obj.position]
                p[i] = val
                updateObject(obj.id, { position: p })
              }}
              className="bg-transparent border-0 text-[11px] text-[#0088ff] w-[52px] outline-none font-mono text-right"
              title={['X', 'Y', 'Z'][i] + ' Axis'}
            />
          ))}
        </div>
      </SettingsRow>

      {/* Rotation */}
      <SettingsRow label="Rotation">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <NumberInput
              key={i}
              step={1}
              value={(obj.rotation[i] * 180) / Math.PI}
              onChange={(val) => {
                const r = [...obj.rotation]
                r[i] = val * (Math.PI / 180)
                updateObject(obj.id, { rotation: r })
              }}
              className="bg-transparent border-0 text-[11px] text-[#0088ff] w-[52px] outline-none font-mono text-right"
              title={['X', 'Y', 'Z'][i] + ' Axis (Degrees)'}
            />
          ))}
        </div>
      </SettingsRow>

      {/* Scale */}
      <SettingsRow label="Scale">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <NumberInput
              key={i}
              value={obj.scale[i]}
              onChange={(val) => {
                const s = [...obj.scale]
                s[i] = val
                updateObject(obj.id, { scale: s })
              }}
              className="bg-transparent border-0 text-[11px] text-[#0088ff] w-[52px] outline-none font-mono text-right"
              title={['X', 'Y', 'Z'][i] + ' Axis'}
            />
          ))}
        </div>
      </SettingsRow>

      {/* Shadow */}
      <SettingsRow label="Shadow">
        <label className="flex items-center gap-1 text-[11px] text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={obj.castShadow || false}
            onChange={(e) => updateObject(obj.id, { castShadow: e.target.checked })}
            className="accent-[#0088ff]"
          />
          cast
        </label>
        <label className="flex items-center gap-1 text-[11px] text-text-secondary cursor-pointer ml-2">
          <input
            type="checkbox"
            checked={obj.receiveShadow || false}
            onChange={(e) => updateObject(obj.id, { receiveShadow: e.target.checked })}
            className="accent-[#0088ff]"
          />
          receive
        </label>
      </SettingsRow>

      {/* Visible */}
      <SettingsRow label="Visible">
        <input
          type="checkbox"
          checked={obj.visible !== false}
          onChange={(e) => updateObject(obj.id, { visible: e.target.checked })}
          className="accent-[#0088ff]"
        />
      </SettingsRow>
    </>
  )
}

/* ─── Geometry Tab ─── */
function GeometryTab({ obj, updateObject }) {
  const geoInfo = {
    box: { type: 'BoxGeometry', labels: ['Width', 'Height', 'Depth', 'Width Segs', 'Height Segs', 'Depth Segs'] },
    cylinder: { type: 'CylinderGeometry', labels: ['Radius Top', 'Radius Bot', 'Height', 'Rad Segs', 'Height Segs', 'Open Ended (0/1)'] },
    sphere: { type: 'SphereGeometry', labels: ['Radius', 'Width Segs', 'Height Segs', 'Phi Start', 'Phi Length', 'Theta Start', 'Theta Length'] },
    cone: { type: 'ConeGeometry', labels: ['Radius', 'Height', 'Rad Segs', 'Height Segs', 'Open Ended (0/1)', 'Theta Start', 'Theta Length'] },
    torus: { type: 'TorusGeometry', labels: ['Radius', 'Tube', 'Rad Segs', 'Tub Segs', 'Arc'] },
    plane: { type: 'PlaneGeometry', labels: ['Width', 'Height', 'Width Segs', 'Height Segs'] },
    capsule: { type: 'CapsuleGeometry', labels: ['Radius', 'Length', 'Cap Segs', 'Rad Segs'] },
    circle: { type: 'CircleGeometry', labels: ['Radius', 'Segments', 'Theta Start', 'Theta Length'] },
    dodecahedron: { type: 'DodecahedronGeometry', labels: ['Radius', 'Detail'] },
    icosahedron: { type: 'IcosahedronGeometry', labels: ['Radius', 'Detail'] },
    octahedron: { type: 'OctahedronGeometry', labels: ['Radius', 'Detail'] },
    tetrahedron: { type: 'TetrahedronGeometry', labels: ['Radius', 'Detail'] },
    ring: { type: 'RingGeometry', labels: ['Inner Rad', 'Outer Rad', 'Theta Segs', 'Phi Segs', 'Theta Start', 'Theta Length'] },
    torusknot: { type: 'TorusKnotGeometry', labels: ['Radius', 'Tube', 'Tub Segs', 'Rad Segs', 'P', 'Q'] },
    tube: { type: 'TubeGeometry', labels: ['Path', 'Segments', 'Radius', 'Rad Segs', 'Closed'] },
    lathe: { type: 'LatheGeometry', labels: ['Points', 'Segments'] },
    csg: { type: 'CSGGeometry', labels: [] },
  }

  const info = geoInfo[obj.type] || { type: 'BufferGeometry', labels: [] }

  const handleArgChange = (index, value) => {
    const newArgs = [...(obj.geometryArgs || [])]
    newArgs[index] = parseFloat(value) || 0
    updateObject(obj.id, { geometryArgs: newArgs })
  }

  return (
    <>
      <SettingsRow label="Type">
        <span className="text-xs text-text-secondary">{info.type}</span>
      </SettingsRow>
      
      {info.labels.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-[10px] text-text-muted font-semibold tracking-wider uppercase mb-2">Parameters</div>
          {info.labels.map((label, i) => (
            <SettingsRow key={label} label={label}>
              <NumberInput
                value={obj.geometryArgs ? obj.geometryArgs[i] : 0}
                onChange={(val) => handleArgChange(i, val)}
                className="bg-[#222] border border-transparent focus:border-border-default rounded text-xs text-[#0088ff] px-2 py-0.5 w-[140px] outline-none font-mono"
              />
            </SettingsRow>
          ))}
        </div>
      )}
    </>
  )
}

/* ─── Material Tab ─── */
function MaterialTab({ obj, updateObject }) {
  return (
    <>
      <SettingsRow label="Type">
        <span className="text-xs text-text-secondary">MeshStandardMaterial</span>
      </SettingsRow>
      <SettingsRow label="Color">
        <input
          type="color"
          value={obj.color || '#aaaaaa'}
          onChange={(e) => updateObject(obj.id, { color: e.target.value })}
          className="w-8 h-5 bg-transparent border border-border-subtle rounded cursor-pointer"
        />
        <span className="text-[10px] text-text-muted font-mono ml-2">{obj.color || '#aaaaaa'}</span>
      </SettingsRow>
      <SettingsRow label="Roughness">
        <input
          type="range" min="0" max="1" step="0.01" defaultValue="0.8"
          className="w-[100px] accent-[#0088ff]"
        />
        <span className="text-[10px] text-[#0088ff] font-mono ml-1">0.80</span>
      </SettingsRow>
      <SettingsRow label="Metalness">
        <input
          type="range" min="0" max="1" step="0.01" defaultValue="0.1"
          className="w-[100px] accent-[#0088ff]"
        />
        <span className="text-[10px] text-[#0088ff] font-mono ml-1">0.10</span>
      </SettingsRow>
    </>
  )
}

/* ─── Project Tab ─── */
function ProjectTab() {
  return (
    <div className="p-3 space-y-3">
      <SettingsRow label="Title">
        <input
          type="text" defaultValue="SkyForge AI Project"
          className="bg-[#222] border border-transparent focus:border-border-default rounded text-xs text-text-primary px-2 py-0.5 w-[140px] outline-none"
        />
      </SettingsRow>
      <SettingsRow label="Renderer">
        <span className="text-xs text-text-secondary">WebGLRenderer</span>
      </SettingsRow>
      <SettingsRow label="Antialias">
        <input type="checkbox" defaultChecked className="accent-[#0088ff]" />
      </SettingsRow>
      <SettingsRow label="Shadows">
        <input type="checkbox" className="accent-[#0088ff]" />
      </SettingsRow>
      <SettingsRow label="Tone Map">
        <select className="bg-[#222] border border-border-subtle rounded text-xs text-text-secondary px-2 py-0.5 uppercase w-[120px] cursor-pointer outline-none">
          <option>Linear</option>
          <option>Reinhard</option>
          <option>Cineon</option>
          <option>ACESFilmic</option>
        </select>
      </SettingsRow>
    </div>
  )
}

/* ─── Settings Tab ─── */
function SettingsTab() {
  return (
    <div className="p-3 space-y-3">
      <div className="text-[11px] text-text-muted font-semibold tracking-wider uppercase mb-2">History</div>
      <SettingsRow label="Persist">
        <input type="checkbox" defaultChecked className="accent-[#0088ff]" />
      </SettingsRow>
      <div className="text-[11px] text-text-muted font-semibold tracking-wider uppercase mb-2 mt-4">Shortcuts</div>
      <div className="space-y-1">
        {[
          { key: 'W', action: 'Translate' },
          { key: 'E', action: 'Rotate' },
          { key: 'R', action: 'Scale' },
          { key: 'Del', action: 'Delete' },
          { key: 'Ctrl+Z', action: 'Undo' },
        ].map(({ key, action }) => (
          <div key={key} className="flex justify-between text-[11px] text-text-secondary py-0.5">
            <span>{action}</span>
            <kbd className="px-1.5 py-0.5 bg-[#222] rounded text-[9px] border border-border-subtle text-text-muted font-mono">{key}</kbd>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Reusable Settings Row ─── */
function SettingsRow({ label, children }) {
  return (
    <div className="flex items-center min-h-[24px]">
      <span className="w-[90px] text-[11px] text-text-secondary shrink-0">{label}</span>
      <div className="flex items-center flex-1 min-w-0">{children}</div>
    </div>
  )
}

/* ─── Smart Number Input (Allows free typing without forcing decimals) ─── */
function NumberInput({ value, onChange, step = 0.1, className, title }) {
  const [localValue, setLocalValue] = React.useState(value)
  const [isFocused, setIsFocused] = React.useState(false)

  // Sync external value when not typing
  React.useEffect(() => {
    if (!isFocused) {
      // Strip trailing zeros and decimal point if not needed
      const formatted = Number(value).toFixed(3).replace(/\.?0+$/, '')
      setLocalValue(formatted)
    }
  }, [value, isFocused])

  return (
    <input
      type="number"
      step={step}
      value={isFocused ? localValue : Number(value).toFixed(3).replace(/\.?0+$/, '')}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false)
        onChange(parseFloat(localValue) || 0)
      }}
      onChange={(e) => {
        setLocalValue(e.target.value)
        onChange(parseFloat(e.target.value) || 0)
      }}
      className={className}
      title={title}
    />
  )
}
