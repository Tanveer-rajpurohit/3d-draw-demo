import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import SceneObjects from './SceneObjects'
import useStore from '../store/store'

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#c96442" wireframe />
    </mesh>
  )
}

export default function Viewport() {
  const setSelectedIds = useStore((s) => s.setSelectedIds)

  return (
    <Canvas
      camera={{ position: [6, 5, 8], fov: 50, near: 0.1, far: 1000 }}
      gl={{ antialias: true, powerPreference: 'high-performance', stencil: false, alpha: false }}
      dpr={[1, 1.5]}
      shadows={false}
      style={{ background: '#f2f0e8' }}
      onPointerMissed={() => setSelectedIds([])}
    >
      <color attach="background" args={['#f2f0e8']} />
      <Suspense fallback={<LoadingFallback />}>
        <SceneLighting />
        <SceneGrid />
        <SceneObjects />
        <SceneControls />
        <SceneExporter />
      </Suspense>
    </Canvas>
  )
}

/* ── Soft warm daylight ── */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.9} color="#fff8f0" />
      <directionalLight position={[8, 14, 6]} intensity={1.1} color="#fffaf5" />
      <directionalLight position={[-6, 4, -8]} intensity={0.3} color="#f5f0e8" />
      <hemisphereLight color="#f5f0e8" groundColor="#e8e4d8" intensity={0.6} />
    </>
  )
}

/* ── Sharp warm grid — higher thickness + contrast ── */
function SceneGrid() {
  return (
    <Grid
      position={[0, -0.01, 0]}
      args={[40, 40]}
      cellSize={1}
      cellThickness={1}
      cellColor="#ccc8bb"
      sectionSize={5}
      sectionThickness={1.5}
      sectionColor="#b0ab9c"
      fadeDistance={50}
      fadeStrength={0.8}
      infiniteGrid
    />
  )
}

/* ── Controls + Gizmo ── */
function SceneControls() {
  return (
    <>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={50}
        maxPolarAngle={Math.PI * 0.85}
      />
      <GizmoHelper alignment="top-right" margin={[70, 70]}>
        <GizmoViewport axisColors={['#c96442', '#5a8a4a', '#3898ec']} labelColor="#141413" />
      </GizmoHelper>
    </>
  )
}

/* ── Scene Exporter ── */
function SceneExporter() {
  const { scene } = useThree()
  
  React.useEffect(() => {
    const handleExport = (e) => {
      const isBinary = e.detail === 'glb'
      const exporter = new GLTFExporter()
      
      exporter.parse(
        scene,
        (gltf) => {
          const blob = new Blob([isBinary ? gltf : JSON.stringify(gltf, null, 2)], {
            type: isBinary ? 'application/octet-stream' : 'text/plain',
          })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `airix_export.${isBinary ? 'glb' : 'gltf'}`
          link.click()
          URL.revokeObjectURL(url)
        },
        (error) => {
          console.error('An error happened during parsing', error)
        },
        { binary: isBinary }
      )
    }

    window.addEventListener('export-scene', handleExport)
    return () => window.removeEventListener('export-scene', handleExport)
  }, [scene])
  
  return null
}
