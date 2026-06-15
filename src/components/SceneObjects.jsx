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
  const renderMode = useStore((s) => s.renderMode)

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
          renderMode={renderMode}
        />
      ))}
    </group>
  )
}

/* ─── Individual Scene Object ─── */
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
    case 'perspectivecamera': return <boxGeometry args={[0.2, 0.2, 0.4]} />
    case 'orthographiccamera': return <boxGeometry args={[0.2, 0.2, 0.4]} />
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
    case 'perspectivecamera': return <perspectiveCamera fov={args[0]} aspect={args[1]} near={args[2]} far={args[3]} />
    case 'orthographiccamera': return <orthographicCamera left={args[0]} right={args[1]} top={args[2]} bottom={args[3]} near={args[4]} far={args[5]} />
    default: return null
  }
}

function GltfModel({ url, color }) {
  const [scene, setScene] = React.useState(null)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let isMounted = true
    const loader = new GLTFLoader()
    
    // Add Draco support just in case the imported model is compressed
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
    
    // Override the imported materials with a simple editor material
    // so the user can change its color freely via the Right Panel!
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
        <meshBasicMaterial color="#8DBCC7" wireframe />
      </mesh>
    )
  }

  return <primitive object={clonedScene} />
}

const SceneObject = React.memo(function SceneObject({
  obj,
  isSelected,
  isActiveTransform,
  onSelect,
  transformMode,
  updateObject,
  saveHistory,
  renderMode,
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
    
    // Throttle Zustand updates to 10fps to avoid lag, but ensure state is saved.
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

  // Material based on render mode
  const material = useMemo(() => {
    const baseColor = obj.color || '#aaaaaa'
    switch (renderMode) {
      case 'wireframe':
        return <meshBasicMaterial color={baseColor} wireframe />
      case 'normals':
        return <meshNormalMaterial />
      case 'depth':
        return <meshDepthMaterial />
      case 'flat':
        return <meshStandardMaterial color={baseColor} roughness={0.8} metalness={0.1} flatShading />
      case 'matcap':
        return <meshMatcapMaterial color={baseColor} />
      case 'uv':
        return <meshBasicMaterial color="#ff00ff" wireframe />
      default: // solid
        return (
          <meshStandardMaterial
            color={baseColor}
            roughness={0.8}
            metalness={0.1}
          />
        )
    }
  }, [renderMode, obj.color])

  if (!obj.visible) return null

  // Special rendering for CSG objects
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
          onUpdate={(self) => {
            if (self.geometry) {
              self.geometry.computeBoundingBox()
              self.geometry.computeBoundingSphere()
            }
          }}
        >
          {material}
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
              const orbit = meshRef.current?.parent?.parent?.parent?.children?.find(c => c.type === 'OrbitControls')
              if (orbit) orbit.enabled = !e.value
              if (e.value && saveHistory) {
                saveHistory()
              }
            }}
          />
        )}
      </group>
    )
  }

  const isSpecial = ['pointlight', 'directionallight', 'spotlight', 'hemispherelight', 'ambientlight', 'perspectivecamera', 'orthographiccamera'].includes(obj.type)

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
            ) : (
              material
            )}
            {geometry}
            {isSpecial && getLightOrCameraComponent(obj)}
          </>
        )}

        {isSelected && obj.type !== 'gltf' && (
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
            const orbit = meshRef.current?.parent?.parent?.parent?.children?.find(c => c.type === 'OrbitControls')
            if (orbit) orbit.enabled = !e.value
            if (e.value && saveHistory) {
              saveHistory()
            }
          }}
        />
      )}
    </group>
  )
})
