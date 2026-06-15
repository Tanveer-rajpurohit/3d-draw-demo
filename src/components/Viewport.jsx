import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
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
        <FloorPlane />
        <SceneObjects />
        <SceneControls />
      </Suspense>
    </Canvas>
  )
}

/* ── Soft warm daylight — no rotating light ── */
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

/* ── Warm light-mode grid ── */
function SceneGrid() {
  return (
    <Grid
      position={[0, -0.01, 0]}
      args={[40, 40]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#dddbd0"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#c8c5b8"
      fadeDistance={40}
      fadeStrength={1}
      infiniteGrid
    />
  )
}

/* ── Warm white floor ── */
function FloorPlane() {
  return (
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#ede9df" roughness={1} metalness={0} />
    </mesh>
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
