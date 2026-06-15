import React, { useRef, useCallback } from 'react'
import * as THREE from 'three'
import { TransformControls, Edges } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import useStore from '../store/store'

/* ═══════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════ */
export default function SceneObjects() {
  const sceneObjects = useStore((s) => s.sceneObjects)
  const selectedIds = useStore((s) => s.selectedIds)
  const toggleSelection = useStore((s) => s.toggleSelection)
  const updateObject = useStore((s) => s.updateObject)
  const transformMode = useStore((s) => s.transformMode)
  const saveHistory = useStore((s) => s.saveHistory)
  const materialMode = useStore((s) => s.materialMode)

  return (
    <group>
      {sceneObjects.map((obj) => (
        <SceneObject
          key={obj.id}
          obj={obj}
          isSelected={selectedIds.includes(obj.id)}
          isActiveTransform={selectedIds[selectedIds.length - 1] === obj.id}
          onSelect={toggleSelection}
          transformMode={transformMode}
          updateObject={updateObject}
          saveHistory={saveHistory}
          materialMode={materialMode}
        />
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════
   GEOMETRY FACTORY
   ═══════════════════════════════════════════════ */
function getGeometryElement(type, args) {
  switch (type) {
    case 'box':          return <boxGeometry args={args} />
    case 'cylinder':     return <cylinderGeometry args={args} />
    case 'sphere':       return <sphereGeometry args={args} />
    case 'cone':         return <coneGeometry args={args} />
    case 'torus':        return <torusGeometry args={args} />
    case 'plane':        return <planeGeometry args={args} />
    case 'capsule':      return <capsuleGeometry args={args} />
    case 'circle':       return <circleGeometry args={args} />
    case 'dodecahedron': return <dodecahedronGeometry args={args} />
    case 'icosahedron':  return <icosahedronGeometry args={args} />
    case 'octahedron':   return <octahedronGeometry args={args} />
    case 'tetrahedron':  return <tetrahedronGeometry args={args} />
    case 'ring':         return <ringGeometry args={args} />
    case 'torusknot':    return <torusKnotGeometry args={args} />
    default:             return <boxGeometry args={[1, 1, 1]} />
  }
}

/* ═══════════════════════════════════════════════
   LIGHT HELPERS
   ═══════════════════════════════════════════════ */
const LIGHT_TYPES = new Set([
  'pointlight', 'directionallight', 'spotlight',
  'hemispherelight', 'ambientlight',
])

function getLightComponent(obj) {
  switch (obj.type) {
    case 'pointlight':       return <pointLight intensity={1} distance={100} color={obj.color} />
    case 'directionallight': return <directionalLight intensity={1} color={obj.color} />
    case 'spotlight':        return <spotLight intensity={1} distance={50} angle={Math.PI / 4} penumbra={0.5} color={obj.color} />
    case 'hemispherelight':  return <hemisphereLight intensity={1} color="#ffffff" groundColor="#444444" />
    case 'ambientlight':     return <ambientLight intensity={0.3} color={obj.color} />
    default: return null
  }
}

function getLightGizmoGeometry(type) {
  switch (type) {
    case 'pointlight':        return <sphereGeometry args={[0.15, 8, 8]} />
    case 'directionallight':  return <planeGeometry args={[0.3, 0.3]} />
    case 'spotlight':         return <coneGeometry args={[0.15, 0.3, 8]} />
    case 'hemispherelight':   return <sphereGeometry args={[0.15, 8, 4]} />
    case 'ambientlight':      return <sphereGeometry args={[0.15, 8, 8]} />
    default:                  return <sphereGeometry args={[0.15, 8, 8]} />
  }
}

/* ═══════════════════════════════════════════════
   THREE.js Material creators (for GLTF traversal)
   ═══════════════════════════════════════════════ */
function createThreeMaterial(materialMode, color) {
  switch (materialMode) {
    case 'wireframe':
      return new THREE.MeshBasicMaterial({ color: '#5b8cb8', wireframe: true })
    case 'clay':
      return new THREE.MeshStandardMaterial({ color: '#d4cfc5', roughness: 0.85, metalness: 0 })
    case 'normals':
      return new THREE.MeshNormalMaterial()
    case 'xray':
      return new THREE.MeshBasicMaterial({ color: '#7ab8e0', transparent: true, opacity: 0.12, depthWrite: false })
    case 'scifi':
      return new THREE.MeshPhongMaterial({
        color: 0x88bbee, emissive: 0x4488cc, emissiveIntensity: 0.3,
        transparent: true, opacity: 0.35, side: THREE.DoubleSide,
      })
    default:
      return new THREE.MeshStandardMaterial({ color: color || '#c8c3b8', roughness: 0.4, metalness: 0.1 })
  }
}

/* ═══════════════════════════════════════════════
   GLTF LOADER — follows materialMode
   ═══════════════════════════════════════════════ */
function GltfModel({ url, color, materialMode }) {
  const [scene, setScene] = React.useState(null)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let alive = true
    const loader = new GLTFLoader()
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    loader.setDRACOLoader(draco)
    loader.load(
      url,
      (gltf) => { if (alive) setScene(gltf.scene) },
      undefined,
      (err) => { console.error('GLTF load error:', err); if (alive) setError(err) }
    )
    return () => { alive = false }
  }, [url])

  // Re-apply material whenever materialMode or color changes
  const cloned = React.useMemo(() => {
    if (!scene) return null
    const c = scene.clone()
    const mat = createThreeMaterial(materialMode, color)
    c.traverse((child) => {
      if (child.isMesh) {
        child.material = mat
      }
    })
    return c
  }, [scene, color, materialMode])

  if (error) return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#b53333" wireframe />
    </mesh>
  )

  if (!cloned) return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#3898ec" wireframe />
    </mesh>
  )

  return <primitive object={cloned} />
}

/* ═══════════════════════════════════════════════
   SCENE OBJECT
   ═══════════════════════════════════════════════ */
const SceneObject = React.memo(function SceneObject({
  obj, isSelected, isActiveTransform, onSelect,
  transformMode, updateObject, saveHistory, materialMode,
}) {
  const meshRef = useRef()

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onSelect(obj.id, e.shiftKey || e.ctrlKey || e.metaKey)
  }, [obj.id, onSelect])

  const throttle = useRef(null)
  const handleObjectChange = useCallback(() => {
    if (!meshRef.current || throttle.current) return
    throttle.current = setTimeout(() => {
      throttle.current = null
      if (!meshRef.current) return
      const { position: p, rotation: r, scale: s } = meshRef.current
      updateObject(obj.id, {
        position: [p.x, p.y, p.z],
        rotation: [r.x, r.y, r.z],
        scale: [s.x, s.y, s.z],
      })
    }, 80)
  }, [obj.id, updateObject])

  if (!obj.visible) return null

  const isLight = LIGHT_TYPES.has(obj.type)
  const isSciFi = materialMode === 'scifi' && !isLight

  /* ── JSX Material for non-GLTF ── */
  const getMaterial = () => {
    if (isLight) return <meshBasicMaterial color={obj.color || '#ffdd44'} wireframe />
    switch (materialMode) {
      case 'wireframe':
        return <meshBasicMaterial color="#5b8cb8" wireframe />
      case 'clay':
        return <meshStandardMaterial color="#d4cfc5" roughness={0.85} metalness={0} />
      case 'normals':
        return <meshNormalMaterial />
      case 'xray':
        return <meshBasicMaterial color="#7ab8e0" transparent opacity={0.12} depthWrite={false} />
      case 'scifi':
        return (
          <meshPhongMaterial
            color={0x88bbee}
            emissive={0x4488cc}
            emissiveIntensity={0.3}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        )
      default:
        return <meshStandardMaterial color={obj.color || '#c8c3b8'} roughness={0.7} metalness={0.05} />
    }
  }

  const transformEl = isActiveTransform ? (
    <TransformControls
      object={meshRef}
      mode={transformMode}
      size={0.7}
      onObjectChange={handleObjectChange}
      onDraggingChanged={(e) => { if (e.value) saveHistory() }}
    />
  ) : null

  const selectionEdge = isSelected && obj.type !== 'gltf' ? (
    <Edges threshold={15} color="#c96442" lineWidth={1} scale={1.002} />
  ) : null

  /* ── CSG_RESULT ── */
  if (obj.type === 'csg_result' && obj.geometry) {
    return (
      <group>
        <mesh ref={meshRef} position={obj.position} rotation={obj.rotation} scale={obj.scale}
          onClick={handleClick} geometry={obj.geometry}
          castShadow={obj.castShadow} receiveShadow={obj.receiveShadow}
        >
          {getMaterial()}
          {selectionEdge}
        </mesh>
        {isSciFi && (
          <mesh position={obj.position} rotation={obj.rotation} scale={obj.scale} geometry={obj.geometry}>
            <meshBasicMaterial color={0x6699cc} wireframe transparent opacity={0.4} />
          </mesh>
        )}
        {transformEl}
      </group>
    )
  }

  /* ── GLTF — material follows materialMode ── */
  if (obj.type === 'gltf') {
    return (
      <group>
        <group ref={meshRef} position={obj.position} rotation={obj.rotation} scale={obj.scale} onClick={handleClick}>
          <GltfModel url={obj.url} color={obj.color} materialMode={materialMode} />
        </group>
        {transformEl}
      </group>
    )
  }

  /* ── LIGHTS ── */
  if (isLight) {
    return (
      <group>
        <mesh ref={meshRef} position={obj.position} rotation={obj.rotation} scale={obj.scale} onClick={handleClick}>
          {getLightGizmoGeometry(obj.type)}
          <meshBasicMaterial color={obj.color || '#ffdd44'} wireframe />
          {selectionEdge}
        </mesh>
        <group position={obj.position}>{getLightComponent(obj)}</group>
        {transformEl}
      </group>
    )
  }

  /* ── STANDARD MESH ── */
  const geometryEl = getGeometryElement(obj.type, obj.geometryArgs || [])

  return (
    <group>
      <mesh ref={meshRef} position={obj.position} rotation={obj.rotation} scale={obj.scale}
        onClick={handleClick} castShadow={obj.castShadow} receiveShadow={obj.receiveShadow}
      >
        {geometryEl}
        {getMaterial()}
        {selectionEdge}
      </mesh>
      {isSciFi && (
        <mesh position={obj.position} rotation={obj.rotation} scale={obj.scale}>
          {getGeometryElement(obj.type, obj.geometryArgs || [])}
          <meshBasicMaterial color={0x6699cc} wireframe transparent opacity={0.4} />
        </mesh>
      )}
      {transformEl}
    </group>
  )
})
