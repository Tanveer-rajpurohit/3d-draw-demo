import { create } from 'zustand'

const PIAPI_KEY = import.meta.env.VITE_TELLIST_AI || "5293e4a56b9129c5c42417fff4867f63f1eb6151395028dba3cab1bee3b9d584";

let nextId = 1

const useStore = create((set, get) => ({
  // Scene objects
  sceneObjects: [],
  selectedIds: [],
  transformMode: 'translate',
  
  // Material/Render mode — default is scifi
  materialMode: 'scifi',
  setMaterialMode: (mode) => set({ materialMode: mode }),

  // Undo/Redo History
  history: [JSON.stringify([])],
  historyIndex: 0,

  // Clipboard
  clipboard: [],

  // Render mode (legacy alias — now mapped through materialMode)
  renderMode: 'solid',

  // CSG Operations
  performCSG: (operation) => {
    get().saveHistory()
    set((state) => {
      const selected = state.selectedIds.map(id => state.sceneObjects.find(o => o.id === id)).filter(Boolean)
      if (selected.length < 2) return state

      const baseObj = selected[0]
      const opObjs = selected.slice(1)
      const newId = Math.random().toString(36).substr(2, 9)

      let finalBase = baseObj;
      let accumulatedOps = [];

      if (baseObj.type === 'csg') {
        finalBase = baseObj.csgData.base;
        accumulatedOps = [...baseObj.csgData.operands];
      }

      opObjs.forEach(op => {
        if (op.type === 'csg') {
           accumulatedOps.push({ obj: op.csgData.base, operation });
           op.csgData.operands.forEach(innerOp => {
             accumulatedOps.push({ obj: innerOp.obj, operation: innerOp.operation });
           });
        } else {
           accumulatedOps.push({ obj: op, operation });
        }
      });

      const newObj = {
        id: newId,
        type: 'csg',
        name: `CSG ${operation.charAt(0).toUpperCase() + operation.slice(1)}`,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryArgs: [],
        color: baseObj.color,
        visible: true,
        castShadow: true,
        receiveShadow: true,
        csgData: {
          base: finalBase,
          operands: accumulatedOps
        }
      }

      const newSceneObjects = state.sceneObjects.filter(o => !state.selectedIds.includes(o.id))
      return {
        sceneObjects: [...newSceneObjects, newObj],
        selectedIds: [newId],
      }
    })
  },

  // CSG wing position (for the demo fuse)
  wingPosition: [2.5, 0, 0],
  wingRotation: [0, 0, Math.PI / 2],

  // UI state
  sidebarTab: 'primitives',
  rightPanelTab: 'scene',
  propertiesTab: 'object',
  isGenerating: false,
  generationStatus: '',
  showShortcuts: false,

  // Scene settings
  sceneBackground: 'Default',
  sceneEnvironment: 'Default',
  sceneFog: 'None',

  // Actions
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setPropertiesTab: (tab) => set({ propertiesTab: tab }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  setRenderMode: (mode) => set({ renderMode: mode }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelection: (id, multi) => set((state) => {
    if (multi) {
      if (state.selectedIds.includes(id)) {
        return { selectedIds: state.selectedIds.filter(i => i !== id) }
      }
      return { selectedIds: [...state.selectedIds, id] }
    }
    return { selectedIds: [id] }
  }),
  setShowShortcuts: (show) => set({ showShortcuts: show }),

  setWingPosition: (pos) => set({ wingPosition: pos }),
  setWingRotation: (rot) => set({ wingRotation: rot }),

  setSceneBackground: (bg) => set({ sceneBackground: bg }),
  setSceneEnvironment: (env) => set({ sceneEnvironment: env }),
  setSceneFog: (fog) => set({ sceneFog: fog }),

  saveHistory: () => set((state) => {
    const nextHistory = state.history.slice(0, state.historyIndex + 1)
    const snapshot = JSON.stringify(state.sceneObjects)
    if (nextHistory.length > 0 && nextHistory[nextHistory.length - 1] === snapshot) return state
    nextHistory.push(snapshot)
    if (nextHistory.length > 50) nextHistory.shift()
    return { history: nextHistory, historyIndex: nextHistory.length - 1 }
  }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      return {
        sceneObjects: JSON.parse(state.history[state.historyIndex - 1]),
        historyIndex: state.historyIndex - 1,
        selectedIds: []
      }
    }
    return state
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      return {
        sceneObjects: JSON.parse(state.history[state.historyIndex + 1]),
        historyIndex: state.historyIndex + 1,
        selectedIds: []
      }
    }
    return state
  }),

  copySelected: () => set((state) => {
    const selected = state.sceneObjects.filter((o) => state.selectedIds.includes(o.id))
    return { clipboard: JSON.parse(JSON.stringify(selected)) }
  }),

  pasteClipboard: () => {
    const { clipboard } = get()
    if (clipboard.length === 0) return
    get().saveHistory()
    set((state) => {
      const newObjects = clipboard.map((obj) => ({
        ...JSON.parse(JSON.stringify(obj)),
        id: `obj_${nextId++}`,
        name: `${obj.name} (Copy)`,
        position: [obj.position[0] + 0.5, obj.position[1] + 0.5, obj.position[2] + 0.5],
      }))
      return {
        sceneObjects: [...state.sceneObjects, ...newObjects],
        selectedIds: newObjects.map((o) => o.id),
      }
    })
  },

  addPrimitive: (type, overrides = {}) => {
    get().saveHistory()
    const id = `obj_${nextId++}`

    const defaultArgs = {
      box: [1, 1, 1, 1, 1, 1],
      cylinder: [1, 1, 2, 32, 1, 0],
      sphere: [1, 32, 16, 0, Math.PI * 2, 0, Math.PI],
      cone: [1, 2, 32, 1, 0, 0, Math.PI * 2],
      torus: [1, 0.4, 16, 100, Math.PI * 2],
      plane: [1, 1, 1, 1],
      capsule: [1, 1, 4, 8],
      circle: [1, 32, 0, Math.PI * 2],
      dodecahedron: [1, 0],
      icosahedron: [1, 0],
      octahedron: [1, 0],
      tetrahedron: [1, 0],
      ring: [0.5, 1, 32, 1, 0, Math.PI * 2],
      torusknot: [1, 0.4, 64, 8, 2, 3],
      tube: [null, 64, 0.2, 8, false],
      lathe: [null, 12],
      pointlight: [0xffffff, 1, 100],
      directionallight: [0xffffff, 1],
      spotlight: [0xffffff, 1, 0, Math.PI / 3, 0.5, 1],
      hemispherelight: [0xffffff, 0x444444, 1],
      ambientlight: [0xffffff, 0.2],
    }

    const names = {
      box: 'Box', cylinder: 'Cylinder', sphere: 'Sphere', cone: 'Cone', torus: 'Torus',
      plane: 'Plane', capsule: 'Capsule', circle: 'Circle', dodecahedron: 'Dodecahedron',
      icosahedron: 'Icosahedron', octahedron: 'Octahedron', tetrahedron: 'Tetrahedron',
      ring: 'Ring', torusknot: 'Torus Knot', tube: 'Tube', lathe: 'Lathe', csg: 'CSG',
      pointlight: 'Point Light', directionallight: 'Directional Light', spotlight: 'Spot Light',
      hemispherelight: 'Hemisphere Light', ambientlight: 'Ambient Light',
    }

    set((state) => {
      const offset = state.sceneObjects.length * 1.5;
      
      const obj = {
        id,
        type,
        name: overrides.name || names[type] || type.charAt(0).toUpperCase() + type.slice(1),
        position: overrides.position || [offset - 3, 0.977, 0],
        rotation: overrides.rotation || [0, 0, 0],
        scale: overrides.scale || [1, 1, 1],
        geometryArgs: overrides.geometryArgs || defaultArgs[type] || [1],
        color: overrides.color || '#aaaaaa',
        visible: true,
        castShadow: false,
        receiveShadow: false,
      }
      return {
        sceneObjects: [...state.sceneObjects, obj],
        selectedIds: [id],
      }
    })
  },

  removePrimitive: (id) => {
    get().saveHistory()
    set((state) => ({
      sceneObjects: state.sceneObjects.filter((o) => o.id !== id),
      selectedIds: state.selectedIds.filter((i) => i !== id),
    }))
  },

  updateObject: (id, updates) => {
    set((state) => ({
      sceneObjects: state.sceneObjects.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    }))
  },

  clearScene: () => {
    get().saveHistory()
    set({ sceneObjects: [], selectedIds: [] })
  },

  addModel: (url, filename) => {
    get().saveHistory()
    const id = `obj_${nextId++}`
    const obj = {
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
    }
    set((state) => ({
      sceneObjects: [...state.sceneObjects, obj],
      selectedIds: [id],
    }))
  },

  // Multi-Provider AI Generation
  startGeneration: async (prompt, file, provider = 'piapi', params = {}) => {
    set({ isGenerating: true, generationStatus: 'Initializing AI...' })

    try {
      let finalModelUrl = null;

      // OPTION 1: PiAPI Trellis
      if (provider === 'piapi') {
        let inputPayload = {};
        let taskType = "text-to-3d";

        if (file) {
          set({ generationStatus: 'Converting image for PiAPI...' });
          const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
          });
          
          taskType = "image-to-3d";
          inputPayload = { image: base64Image };
        } else if (prompt) {
          taskType = "text-to-3d";
          inputPayload = { prompt: prompt };
        } else {
          throw new Error("No prompt or image provided");
        }

        set({ generationStatus: `Creating Trellis task (${taskType})...` })

        const createRes = await fetch("https://api.piapi.ai/api/v1/task", {
          method: "POST",
          headers: {
            "x-api-key": PIAPI_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "Qubico/trellis",
            task_type: taskType,
            input: {
              ...inputPayload,
              ss_sampling_steps: params.ss_sampling_steps || 50,
              slat_sampling_steps: params.slat_sampling_steps || 50,
              ss_guidance_strength: params.ss_guidance_strength || 7.5,
              slat_guidance_strength: params.slat_guidance_strength || 3
            }
          })
        });

        if (!createRes.ok) {
          const errData = await createRes.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to create task: ${createRes.status}`);
        }

        const createData = await createRes.json();
        const taskId = createData.data.task_id;

        if (!taskId) throw new Error("No task ID received from PiAPI");

        set({ generationStatus: 'Task created. Waiting for 3D generation...' })

        let isCompleted = false;

        while (!isCompleted) {
          await new Promise(r => setTimeout(r, 2000));
          const pollRes = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
            method: "GET",
            headers: { "x-api-key": PIAPI_KEY }
          });

          if (!pollRes.ok) continue;

          const pollData = await pollRes.json();
          const status = pollData.data.status;

          if (status === "completed") {
            isCompleted = true;
            const output = pollData.data.output;
            finalModelUrl = output.model || output.model_url || output.url || output.mesh || Object.values(output).find(v => typeof v === 'string' && (v.endsWith('.glb') || v.endsWith('.gltf') || v.endsWith('.obj')));
          } else if (status === "failed") {
            throw new Error("PiAPI task failed");
          } else {
            set({ generationStatus: `Status: ${status}...` })
          }
        }
      }

      // OPTION 2: Hugging Face Spaces (via Gradio)
      else if (provider === 'hf') {
        const { Client } = await import('@gradio/client');
        set({ generationStatus: 'Connecting to Hugging Face Spaces (tencent/Hunyuan3D-2)...' });
        
        try {
          const client = await Client.connect("tencent/Hunyuan3D-2", { hf_token: import.meta.env.VITE_HF_KEY });
          let result;
          
          if (file) {
             set({ generationStatus: 'Sending image to tencent/Hunyuan3D-2...' });
             result = await client.predict("/shape_generation", [
                prompt || "",
                file,
                null, null, null, null,
                30, 5.0, 1234, 256, true, 8000, true
             ]);
          } else if (prompt) {
             set({ generationStatus: 'Sending text to tencent/Hunyuan3D-2...' });
             result = await client.predict("/shape_generation", [
                prompt, null,
                null, null, null, null,
                30, 5.0, 1234, 256, true, 8000, true
             ]);
          }

          if (result && result.data && result.data[0]) {
            finalModelUrl = result.data[0].url || (result.data[0].path ? `https://huggingface.co/spaces/tencent/Hunyuan3D-2/file=${result.data[0].path}` : null);
          } else {
            throw new Error("Invalid response format from Hugging Face.");
          }
        } catch (err) {
           console.error("HF Generation Error:", err);
           throw new Error(`Hugging Face Error: ${err.message}. Spaces often return 503 due to traffic. Please try PiAPI or Tripo3D.`);
        }
      }

      // OPTION 3: Tripo3D API
      else if (provider === 'tripo') {
        let fileToken = null;
        if (file) {
          set({ generationStatus: 'Uploading image to Tripo3D...' });
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch("https://api.tripo3d.ai/v2/openapi/upload", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${import.meta.env.VITE_TRIPO_KEY}`
            },
            body: formData
          });
          const uploadData = await uploadRes.json();
          if (uploadData.code !== 0) throw new Error("Tripo3D upload failed: " + uploadData.message);
          fileToken = uploadData.data.image_token;
        }

        set({ generationStatus: 'Creating Tripo3D task...' });
        const payload = fileToken ? {
          type: "image_to_model",
          file: {
            type: "jpg",
            file_token: fileToken
          }
        } : {
          type: "text_to_model",
          prompt: prompt
        };

        const createRes = await fetch("https://api.tripo3d.ai/v2/openapi/task", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_TRIPO_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        
        const createData = await createRes.json();
        if (createData.code !== 0) throw new Error("Tripo3D task creation failed: " + createData.message);
        
        const taskId = createData.data.task_id;
        let isCompleted = false;

        while (!isCompleted) {
          await new Promise(r => setTimeout(r, 3000));
          const pollRes = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
            headers: { "Authorization": `Bearer ${import.meta.env.VITE_TRIPO_KEY}` }
          });
          const pollData = await pollRes.json();
          const status = pollData.data.status;
          
          if (status === "success") {
             isCompleted = true;
             const resultData = pollData.data.result || {};
             const outputData = pollData.data.output || {};
             
             finalModelUrl = 
               (resultData.pbr_model && resultData.pbr_model.url) || 
               (resultData.model && resultData.model.url) || 
               outputData.pbr_model || 
               outputData.model;
               
          } else if (status === "failed" || status === "cancelled") {
             throw new Error("Tripo3D generation failed");
          } else {
             set({ generationStatus: `Tripo3D Status: ${status} (${pollData.data.progress || 0}%)...` });
          }
        }
      }

      if (!finalModelUrl) throw new Error("Could not find final model URL");

      // Inject model into scene
      const id = `gen_${nextId++}`
      set((state) => ({
        isGenerating: false,
        generationStatus: '',
        sceneObjects: [
          ...state.sceneObjects,
          {
            id,
            type: 'gltf',
            name: `AI (${provider}): ${(prompt || (file && file.name) || 'Generated').slice(0, 20)}`,
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
      console.error("API Error:", error);
      set({ isGenerating: false, generationStatus: `Error: ${error.message}` })
    }
  },
}))

export default useStore
