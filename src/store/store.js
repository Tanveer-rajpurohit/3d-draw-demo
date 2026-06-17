import { create } from 'zustand'
import * as THREE from 'three'
import { Brush, Evaluator, ADDITION, SUBTRACTION, INTERSECTION } from 'three-bvh-csg'

const PIAPI_KEY = import.meta.env.VITE_TELLIST_AI || ''

let nextId = 1

/* ─────────────────────────────────────────────
   Helper: create a THREE.BufferGeometry from
   our serialisable scene-object descriptor.
   ───────────────────────────────────────────── */
function createGeometryFromDescriptor(type, geometryArgs) {
  const a = geometryArgs || []
  switch (type) {
    case 'box':          return new THREE.BoxGeometry(...a)
    case 'cylinder':     return new THREE.CylinderGeometry(...a)
    case 'sphere':       return new THREE.SphereGeometry(...a)
    case 'cone':         return new THREE.ConeGeometry(...a)
    case 'torus':        return new THREE.TorusGeometry(...a)
    case 'plane':        return new THREE.PlaneGeometry(...a)
    case 'capsule':      return new THREE.CapsuleGeometry(...a)
    case 'circle':       return new THREE.CircleGeometry(...a)
    case 'dodecahedron': return new THREE.DodecahedronGeometry(...a)
    case 'icosahedron':  return new THREE.IcosahedronGeometry(...a)
    case 'octahedron':   return new THREE.OctahedronGeometry(...a)
    case 'tetrahedron':  return new THREE.TetrahedronGeometry(...a)
    case 'ring':         return new THREE.RingGeometry(...a)
    case 'torusknot':    return new THREE.TorusKnotGeometry(...a)
    default:             return new THREE.BoxGeometry(1, 1, 1)
  }
}

/* ─────────────────────────────────────────────
   Helper: run CSG imperatively with three-bvh-csg.
   Returns a BufferGeometry or null on failure.
   ───────────────────────────────────────────── */
function runCSG(objA, objB, operation) {
  try {
    const geoA = objA.type === 'csg_result'
      ? objA.geometry.clone()
      : createGeometryFromDescriptor(objA.type, objA.geometryArgs)

    const geoB = objB.type === 'csg_result'
      ? objB.geometry.clone()
      : createGeometryFromDescriptor(objB.type, objB.geometryArgs)

    const brushA = new Brush(geoA, new THREE.MeshStandardMaterial())
    brushA.position.set(...(objA.position || [0, 0, 0]))
    brushA.rotation.set(...(objA.rotation || [0, 0, 0]))
    brushA.scale.set(...(objA.scale || [1, 1, 1]))
    brushA.updateMatrixWorld(true)

    const brushB = new Brush(geoB, new THREE.MeshStandardMaterial())
    brushB.position.set(...(objB.position || [0, 0, 0]))
    brushB.rotation.set(...(objB.rotation || [0, 0, 0]))
    brushB.scale.set(...(objB.scale || [1, 1, 1]))
    brushB.updateMatrixWorld(true)

    const opMap = { union: ADDITION, subtract: SUBTRACTION, intersect: INTERSECTION }
    const evaluator = new Evaluator()
    const result = evaluator.evaluate(brushA, brushB, opMap[operation] ?? ADDITION)

    // The result IS a Brush (which extends Mesh), so we grab .geometry
    const outGeo = result.geometry
    outGeo.computeVertexNormals()

    // Clean up temporaries
    geoA.dispose()
    geoB.dispose()

    return outGeo
  } catch (err) {
    console.error('CSG evaluation failed:', err)
    return null
  }
}

/* ═════════════════════════════════════════════
   ZUSTAND STORE
   ═════════════════════════════════════════════ */
const useStore = create((set, get) => ({
  // ── Scene objects ──
  sceneObjects: [],
  selectedIds: [],
  transformMode: 'translate',
  exportGroupRef: null,
  setExportGroupRef: (ref) => set({ exportGroupRef: ref }),

  // ── Material mode ──
  materialMode: 'scifi',
  setMaterialMode: (mode) => set({ materialMode: mode }),

  // ── Undo / Redo ──
  // NOTE: csg_result objects contain a BufferGeometry which is NOT
  // JSON-serialisable.  The history serialiser skips them so undo/redo
  // will not restore CSG results.  A full solution would snapshot the
  // geometry arrays, but that's out of scope here.
  history: ['[]'],
  historyIndex: 0,
  clipboard: [],

  // ── CSG (imperative, using three-bvh-csg) ──
  performCSG: (operation) => {
    const state = get()
    const selected = state.selectedIds
      .map((id) => state.sceneObjects.find((o) => o.id === id))
      .filter(Boolean)

    if (selected.length < 2) return

    get().saveHistory()

    // Fold left: A op B op C op D ...
    let accumObj = selected[0]

    for (let i = 1; i < selected.length; i++) {
      const resultGeo = runCSG(accumObj, selected[i], operation)
      if (!resultGeo) {
        console.error('CSG failed at step', i)
        return
      }
      // Build an intermediate csg_result descriptor that can be fed
      // back into runCSG (it checks for type === 'csg_result')
      accumObj = {
        id: '_tmp_',
        type: 'csg_result',
        geometry: resultGeo,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      }
    }

    const newId = `csg_${nextId++}`
    const csgObj = {
      id: newId,
      type: 'csg_result',
      name: `CSG ${operation.charAt(0).toUpperCase() + operation.slice(1)}`,
      geometry: accumObj.geometry,          // BufferGeometry stored in state
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: selected[0].color || '#aaaaaa',
      visible: true,
      castShadow: true,
      receiveShadow: true,
    }

    set((s) => ({
      sceneObjects: [
        ...s.sceneObjects.filter((o) => !s.selectedIds.includes(o.id)),
        csgObj,
      ],
      selectedIds: [newId],
    }))
  },

  // ── UI state ──
  sidebarTab: 'primitives',
  showShortcuts: false,
  isGenerating: false,
  generationStatus: '',

  // ── Actions ──
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelection: (id, multi) =>
    set((s) => {
      if (multi) {
        return s.selectedIds.includes(id)
          ? { selectedIds: s.selectedIds.filter((i) => i !== id) }
          : { selectedIds: [...s.selectedIds, id] }
      }
      return { selectedIds: [id] }
    }),
  setShowShortcuts: (show) => set({ showShortcuts: show }),

  // ── History ──
  saveHistory: () =>
    set((s) => {
      // Filter out non-serialisable csg_result geometry before snapshot
      const serialisable = s.sceneObjects.map((o) =>
        o.type === 'csg_result' ? { ...o, geometry: '__CSG__' } : o
      )
      const snap = JSON.stringify(serialisable)
      const next = s.history.slice(0, s.historyIndex + 1)
      if (next.length > 0 && next[next.length - 1] === snap) return s
      next.push(snap)
      if (next.length > 50) next.shift()
      return { history: next, historyIndex: next.length - 1 }
    }),

  undo: () =>
    set((s) => {
      if (s.historyIndex > 0) {
        const parsed = JSON.parse(s.history[s.historyIndex - 1])
        // csg_result objects lose their geometry on undo — filter them out
        const restored = parsed.filter((o) => o.type !== 'csg_result' || o.geometry !== '__CSG__')
        return { sceneObjects: restored, historyIndex: s.historyIndex - 1, selectedIds: [] }
      }
      return s
    }),

  redo: () =>
    set((s) => {
      if (s.historyIndex < s.history.length - 1) {
        const parsed = JSON.parse(s.history[s.historyIndex + 1])
        const restored = parsed.filter((o) => o.type !== 'csg_result' || o.geometry !== '__CSG__')
        return { sceneObjects: restored, historyIndex: s.historyIndex + 1, selectedIds: [] }
      }
      return s
    }),

  copySelected: () =>
    set((s) => {
      const selected = s.sceneObjects
        .filter((o) => s.selectedIds.includes(o.id) && o.type !== 'csg_result')
      return { clipboard: JSON.parse(JSON.stringify(selected)) }
    }),

  pasteClipboard: () => {
    const { clipboard } = get()
    if (clipboard.length === 0) return
    get().saveHistory()
    set((s) => {
      const newObjs = clipboard.map((obj) => ({
        ...JSON.parse(JSON.stringify(obj)),
        id: `obj_${nextId++}`,
        name: `${obj.name} (Copy)`,
        position: [obj.position[0] + 0.5, obj.position[1] + 0.5, obj.position[2] + 0.5],
      }))
      return {
        sceneObjects: [...s.sceneObjects, ...newObjs],
        selectedIds: newObjs.map((o) => o.id),
      }
    })
  },

  // ── Add Primitive ──
  addPrimitive: (type, overrides = {}) => {
    get().saveHistory()
    const id = `obj_${nextId++}`

    const defaultArgs = {
      box: [1, 1, 1],
      cylinder: [1, 1, 2, 32],
      sphere: [1, 32, 16],
      cone: [1, 2, 32],
      torus: [1, 0.4, 16, 100],
      plane: [1, 1],
      capsule: [1, 1, 4, 8],
      circle: [1, 32],
      dodecahedron: [1, 0],
      icosahedron: [1, 0],
      octahedron: [1, 0],
      tetrahedron: [1, 0],
      ring: [0.5, 1, 32],
      torusknot: [1, 0.4, 64, 8],
      tube: [],
      lathe: [],
      pointlight: [],
      directionallight: [],
      spotlight: [],
      hemispherelight: [],
      ambientlight: [],
    }

    const names = {
      box: 'Box', cylinder: 'Cylinder', sphere: 'Sphere', cone: 'Cone',
      torus: 'Torus', plane: 'Plane', capsule: 'Capsule', circle: 'Circle',
      dodecahedron: 'Dodecahedron', icosahedron: 'Icosahedron',
      octahedron: 'Octahedron', tetrahedron: 'Tetrahedron',
      ring: 'Ring', torusknot: 'Torus Knot', tube: 'Tube', lathe: 'Lathe',
      pointlight: 'Point Light', directionallight: 'Directional Light',
      spotlight: 'Spot Light', hemispherelight: 'Hemisphere Light',
      ambientlight: 'Ambient Light',
    }

    set((s) => {
      const offset = s.sceneObjects.length * 1.5
      const obj = {
        id,
        type,
        name: overrides.name || names[type] || type,
        position: overrides.position || [offset - 3, 0.977, 0],
        rotation: overrides.rotation || [0, 0, 0],
        scale: overrides.scale || [1, 1, 1],
        geometryArgs: overrides.geometryArgs || defaultArgs[type] || [1],
        color: overrides.color || '#aaaaaa',
        visible: true,
        castShadow: false,
        receiveShadow: false,
      }
      return { sceneObjects: [...s.sceneObjects, obj], selectedIds: [id] }
    })
  },

  removePrimitive: (id) => {
    get().saveHistory()
    set((s) => ({
      sceneObjects: s.sceneObjects.filter((o) => o.id !== id),
      selectedIds: s.selectedIds.filter((i) => i !== id),
    }))
  },

  updateObject: (id, updates) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),

  clearScene: () => {
    get().saveHistory()
    set({ sceneObjects: [], selectedIds: [] })
  },

  addModel: (url, filename) => {
    get().saveHistory()
    const id = `obj_${nextId++}`
    set((s) => ({
      sceneObjects: [
        ...s.sceneObjects,
        {
          id,
          type: 'gltf',
          name: filename,
          url,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true,
          castShadow: true,
          receiveShadow: true,
          color: '#ffffff',
        },
      ],
      selectedIds: [id],
    }))
  },

  // ══════════════════════════════════════════════
  // Multi-Provider AI Generation
  // ══════════════════════════════════════════════
  startGeneration: async (prompt, file, provider = 'piapi', params = {}) => {
    set({ isGenerating: true, generationStatus: 'Initializing AI...' })

    try {
      let finalModelUrl = null

      // ── OPTION 1: PiAPI Trellis ──
      if (provider === 'piapi') {
        let inputPayload = {}
        let taskType = 'text-to-3d'

        if (file) {
          set({ generationStatus: 'Converting image for PiAPI...' })
          const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
          })
          taskType = 'image-to-3d'
          inputPayload = { image: base64Image }
        } else if (prompt) {
          inputPayload = { prompt }
        } else {
          throw new Error('No prompt or image provided')
        }

        set({ generationStatus: `Creating Trellis task (${taskType})...` })

        const createRes = await fetch('https://api.piapi.ai/api/v1/task', {
          method: 'POST',
          headers: { 'x-api-key': PIAPI_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'Qubico/trellis',
            task_type: taskType,
            input: {
              ...inputPayload,
              ss_sampling_steps: params.ss_sampling_steps || 50,
              slat_sampling_steps: params.slat_sampling_steps || 50,
              ss_guidance_strength: params.ss_guidance_strength || 7.5,
              slat_guidance_strength: params.slat_guidance_strength || 3,
            },
          }),
        })

        if (!createRes.ok) {
          const errData = await createRes.json().catch(() => ({}))
          throw new Error(errData.message || `Task creation failed: ${createRes.status}`)
        }

        const createData = await createRes.json()
        const taskId = createData.data.task_id
        if (!taskId) throw new Error('No task ID received from PiAPI')

        set({ generationStatus: 'Task created. Waiting for 3D generation...' })

        let done = false
        while (!done) {
          await new Promise((r) => setTimeout(r, 2000))
          const poll = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
            headers: { 'x-api-key': PIAPI_KEY },
          })
          if (!poll.ok) continue
          const d = await poll.json()
          const st = d.data.status
          if (st === 'completed') {
            done = true
            const out = d.data.output
            finalModelUrl =
              out.model || out.model_url || out.url || out.mesh ||
              Object.values(out).find(
                (v) => typeof v === 'string' && (v.endsWith('.glb') || v.endsWith('.gltf') || v.endsWith('.obj'))
              )
          } else if (st === 'failed') {
            throw new Error('PiAPI task failed')
          } else {
            set({ generationStatus: `Status: ${st}...` })
          }
        }
      }

      // ── OPTION 2: Hugging Face (Hunyuan3D-2) ──
      else if (provider === 'hf') {
        const { Client } = await import('@gradio/client')
        set({ generationStatus: 'Connecting to tencent/Hunyuan3D-2...' })
        try {
          const client = await Client.connect('tencent/Hunyuan3D-2', {
            hf_token: import.meta.env.VITE_HF_KEY,
          })
          let result
          if (file) {
            set({ generationStatus: 'Sending image to Hunyuan3D-2...' })
            result = await client.predict('/shape_generation', [
              prompt || '', file,
              null, null, null, null,
              30, 5.0, 1234, 256, true, 8000, true,
            ])
          } else if (prompt) {
            set({ generationStatus: 'Sending text to Hunyuan3D-2...' })
            result = await client.predict('/shape_generation', [
              prompt, null,
              null, null, null, null,
              30, 5.0, 1234, 256, true, 8000, true,
            ])
          }
          if (result?.data?.[0]) {
            finalModelUrl =
              result.data[0].url ||
              (result.data[0].path
                ? `https://huggingface.co/spaces/tencent/Hunyuan3D-2/file=${result.data[0].path}`
                : null)
          } else {
            throw new Error('Invalid HF response')
          }
        } catch (err) {
          throw new Error(`Hugging Face Error: ${err.message}`)
        }
      }

      // ── OPTION 3: Tripo3D ──
      else if (provider === 'tripo') {
        let fileToken = null
        if (file) {
          set({ generationStatus: 'Uploading image to Tripo3D...' })
          const fd = new FormData()
          fd.append('file', file)
          const up = await fetch('https://api.tripo3d.ai/v2/openapi/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${import.meta.env.VITE_TRIPO_KEY}` },
            body: fd,
          })
          const ud = await up.json()
          if (ud.code !== 0) throw new Error('Tripo3D upload failed: ' + ud.message)
          fileToken = ud.data.image_token
        }

        set({ generationStatus: 'Creating Tripo3D task...' })
        const payload = fileToken
          ? { type: 'image_to_model', file: { type: 'jpg', file_token: fileToken } }
          : { type: 'text_to_model', prompt }

        const cr = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TRIPO_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        const cd = await cr.json()
        if (cd.code !== 0) throw new Error('Tripo3D task failed: ' + cd.message)
        const taskId = cd.data.task_id
        let done = false
        while (!done) {
          await new Promise((r) => setTimeout(r, 3000))
          const pr = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
            headers: { Authorization: `Bearer ${import.meta.env.VITE_TRIPO_KEY}` },
          })
          const pd = await pr.json()
          const st = pd.data.status
          if (st === 'success') {
            done = true
            const rd = pd.data.result || {}
            const od = pd.data.output || {}
            finalModelUrl =
              rd.pbr_model?.url || rd.model?.url || od.pbr_model || od.model
          } else if (st === 'failed' || st === 'cancelled') {
            throw new Error('Tripo3D generation failed')
          } else {
            set({ generationStatus: `Tripo3D: ${st} (${pd.data.progress || 0}%)...` })
          }
        }
      }

      if (!finalModelUrl) throw new Error('Could not find final model URL')

      const id = `gen_${nextId++}`
      set((s) => ({
        isGenerating: false,
        generationStatus: '',
        sceneObjects: [
          ...s.sceneObjects,
          {
            id,
            type: 'gltf',
            name: `AI (${provider}): ${(prompt || file?.name || 'Generated').slice(0, 20)}`,
            url: finalModelUrl,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: '#8DBCC7',
            visible: true,
            castShadow: true,
            receiveShadow: true,
          },
        ],
        selectedIds: [id],
      }))
    } catch (error) {
      console.error('AI Generation Error:', error)
      set({ isGenerating: false, generationStatus: `Error: ${error.message}` })
    }
  },
}))

export default useStore
