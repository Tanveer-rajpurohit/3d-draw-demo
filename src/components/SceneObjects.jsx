import React, { useRef, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { TransformControls, Edges } from '@react-three/drei'
import { Geometry, Base, Addition, Subtraction, Intersection } from '@react-three/csg'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import useStore from '../store/store'

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

/* ─── Geometry Factory ─── */
function getGeometryElement(type, args) {
  switch (type) {
    case 'box': return <boxGeometry args={args} />
    case 'cylinder': return <cylinderGeometry args={args} />
    case 'sphere': return <sphereGeometry args={args} />
    case 'cone': return <coneGeometry args={args} />
    case 'torus': return <torusGeometry args={args} />
    case 'plane': return <planeGeometry args={args} />
    case 'capsule': return <capsuleGeometry args={args} />
    case 'circle': return <circleGeometry args={args} />
    case 'dodecahedron': return <dodecahedronGeometry args={args} />
    case 'icosahedron': return <icosahedronGeometry args={args} />
    case 'octahedron': return <octahedronGeometry args={args} />
    case 'tetrahedron': return <tetrahedronGeometry args={args} />
    case 'ring': return <ringGeometry args={args} />
    case 'torusknot': return <torusKnotGeometry args={args} />
    case 'tube': return <tubeGeometry />
    case 'lathe': return <latheGeometry />
    case 'pointlight': return <sphereGeometry args={[0.2, 8, 8]} />
    case 'directionallight': return <planeGeometry args={[0.4, 0.4]} />
    case 'spotlight': return <coneGeometry args={[0.2, 0.4, 8]} />
    case 'hemispherelight': return <sphereGeometry args={[0.2, 8, 8]} />
    case 'ambientlight': return <sphereGeometry args={[0.2, 8, 8]} />
    default: return <boxGeometry args={[1, 1, 1]} />
  }
}

function getLightOrCameraComponent(obj) {
  const args = obj.geometryArgs || []
  switch (obj.type) {
    case 'pointlight': return <pointLight intensity={args[1]} distance={args[2]} color={obj.color} castShadow />
    case 'directionallight': return <directionalLight intensity={args[1]} color={obj.color} castShadow />
    case 'spotlight': return <spotLight intensity={args[1]} distance={args[2]} angle={args[3]} penumbra={args[4]} decay={args[5]} color={obj.color} castShadow />
    case 'hemispherelight': return <hemisphereLight intensity={args[2]} color={args[0]} groundColor={args[1]} />
    case 'ambientlight': return <ambientLight intensity={args[1]} color={obj.color} />
    default: return null
  }
}

/* ─── Material Factory based on materialMode ─── */
function getMaterialElement(materialMode, color) {
  const baseColor = color || '#aaaaaa'
  switch (materialMode) {
    case 'wireframe':
      return <meshBasicMaterial color="#4a9eff" wireframe />
    case 'clay':
      return <meshStandardMaterial color="#c8c8c8" roughness={0.9} metalness={0} />
    case 'solid':
      return <meshStandardMaterial color={baseColor} roughness={0.8} metalness={0.1} />
    case 'normals':
      return <meshNormalMaterial />
    case 'xray':
      return <meshBasicMaterial color="#4a9eff" transparent opacity={0.2} depthWrite={false} />
    case 'matcap_a':
      return <meshMatcapMaterial color={baseColor} />
    case 'matcap_b':
      return <meshMatcapMaterial color="#ddbbff" />
    case 'scifi':
      // SciFi mode renders in the component itself (dual mesh)
      return null
    default:
      return <meshStandardMaterial color={baseColor} roughness={0.8} metalness={0.1} />
  }
}

/* ─── GLTF Model Loader ─── */
function GltfModel({ url, color }) {
  const [scene, setScene] = React.useState(null)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let isMounted = true
    const loader = new GLTFLoader()
    
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      url,
      (gltf) => {
        if (isMounted) setScene(gltf.scene)
      },
      undefined,
      (err) => {
        console.error("Failed to load GLTF:", err)
        if (isMounted) setError(err)
      }
    )

    return () => {
      isMounted = false
    }
  }, [url])

  const clonedScene = React.useMemo(() => {
    if (!scene) return null
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: color || '#ffffff',
          roughness: 0.4,
          metalness: 0.1
        })
      }
    })
    return clone
  }, [scene, color])

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    )
  }

  if (!clonedScene) {
    return (
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#4a9eff" wireframe />
      </mesh>
    )
  }

  return <primitive object={clonedScene} />
}

/* ─── SciFi dual-mesh wrapper ─── */
function SciFiMesh({ children, geometry }) {
  return (
    <group>
      {/* Solid blue-transparent mesh */}
      <mesh>
        {geometry}
        <meshPhongMaterial
          color={0x001a33}
          emissive={0x002266}
          emissiveIntensity={0.4}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        {geometry}
        <meshBasicMaterial
          color={0x00aaff}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  )
}

/* ─── Individual Scene Object ─── */
const SceneObject = React.memo(function SceneObject({
  obj,
  isSelected,
  isActiveTransform,
  onSelect,
  transformMode,
  updateObject,
  saveHistory,
  materialMode,
}) {
  const meshRef = useRef()

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      onSelect(obj.id, e.shiftKey || e.ctrlKey || e.metaKey)
    },
    [obj.id, onSelect]
  )

  const syncTimeoutRef = useRef(null)
  const handleObjectChange = useCallback(() => {
    if (!meshRef.current) return
    if (syncTimeoutRef.current) return
    
    syncTimeoutRef.current = setTimeout(() => {
      syncTimeoutRef.current = null
      if (!meshRef.current) return
      const pos = meshRef.current.position
      const rot = meshRef.current.rotation
      const scl = meshRef.current.scale
      updateObject(obj.id, {
        position: [pos.x, pos.y, pos.z],
        rotation: [rot.x, rot.y, rot.z],
        scale: [scl.x, scl.y, scl.z],
      })
    }, 100)
  }, [obj.id, updateObject])

  const geometry = useMemo(() => {
    if (obj.type === 'csg') return null
    return getGeometryElement(obj.type, obj.geometryArgs || [])
  }, [obj.type, obj.geometryArgs])

  const material = useMemo(() => {
    return getMaterialElement(materialMode, obj.color)
  }, [materialMode, obj.color])

  if (!obj.visible) return null

  const isSpecial = ['pointlight', 'directionallight', 'spotlight', 'hemispherelight', 'ambientlight'].includes(obj.type)
  const isSciFi = materialMode === 'scifi' && !isSpecial

  // ─── CSG Rendering ───
  if (obj.type === 'csg') {
    const base = obj.csgData.base;
    const operands = obj.csgData.operands;

    return (
      <group>
        <mesh
          ref={meshRef}
          position={obj.position}
          rotation={obj.rotation}
          scale={obj.scale}
          onClick={handleClick}
          castShadow={obj.castShadow}
          receiveShadow={obj.receiveShadow}
        >
          {isSciFi ? (
            <meshPhongMaterial
              color={0x001a33}
              emissive={0x002266}
              emissiveIntensity={0.4}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
            />
          ) : (
            material || <meshStandardMaterial color={obj.color || '#aaaaaa'} roughness={0.8} metalness={0.1} />
          )}
          <Geometry useGroups={false}>
            <Base position={base.position} rotation={base.rotation} scale={base.scale}>
              {getGeometryElement(base.type, base.geometryArgs || [])}
            </Base>
            {operands.map((opItem, i) => {
              const op = opItem.obj;
              const OpComponent = opItem.operation === 'union' ? Addition : opItem.operation === 'intersect' ? Intersection : Subtraction;
              return (
                <OpComponent key={i} position={op.position} rotation={op.rotation} scale={op.scale}>
                  {getGeometryElement(op.type, op.geometryArgs || [])}
                </OpComponent>
              )
            })}
          </Geometry>

          {isSelected && (
            <Edges threshold={15} color="#ffdd00" lineWidth={1} scale={1.001} />
          )}
        </mesh>

        {isActiveTransform && (
          <TransformControls
            object={meshRef}
            mode={transformMode}
            size={0.7}
            onObjectChange={handleObjectChange}
            onDraggingChanged={(e) => {
              if (e.value && saveHistory) saveHistory()
            }}
          />
        )}
      </group>
    )
  }

  // ─── Standard + SciFi Rendering ───
  return (
    <group>
      <mesh
        ref={meshRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        onClick={handleClick}
        castShadow={!isSpecial && obj.castShadow}
        receiveShadow={!isSpecial && obj.receiveShadow}
      >
        {obj.type === 'gltf' ? (
          <GltfModel url={obj.url} color={obj.color} />
        ) : (
          <>
            {isSpecial ? (
              <meshBasicMaterial color={obj.color} wireframe />
            ) : isSciFi ? (
              <meshPhongMaterial
                color={0x001a33}
                emissive={0x002266}
                emissiveIntensity={0.4}
                transparent
                opacity={0.75}
                side={THREE.DoubleSide}
              />
            ) : (
              material || <meshStandardMaterial color={obj.color || '#aaaaaa'} roughness={0.8} metalness={0.1} />
            )}
            {geometry}
            {isSpecial && getLightOrCameraComponent(obj)}
          </>
        )}

        {isSelected && obj.type !== 'gltf' && (
          <Edges threshold={15} color="#ffdd00" lineWidth={1} scale={1.001} />
        )}
      </mesh>

      {/* SciFi wireframe overlay (second mesh) */}
      {isSciFi && obj.type !== 'gltf' && !isSpecial && (
        <mesh
          position={obj.position}
          rotation={obj.rotation}
          scale={obj.scale}
        >
          {getGeometryElement(obj.type, obj.geometryArgs || [])}
          <meshBasicMaterial
            color={0x00aaff}
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {isActiveTransform && (
        <TransformControls
          object={meshRef}
          mode={transformMode}
          size={0.7}
          onObjectChange={handleObjectChange}
          onDraggingChanged={(e) => {
            if (e.value && saveHistory) saveHistory()
          }}
        />
      )}
    </group>
  )
})
