import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import SceneObjects from './SceneObjects'
import useStore from '../store/store'

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#8DBCC7" wireframe />
    </mesh>
  )
}

export default function Viewport() {
  const renderMode = useStore((s) => s.renderMode)
  const setSelectedIds = useStore((s) => s.setSelectedIds)

  return (
    <Canvas
      camera={{ position: [6, 5, 8], fov: 50, near: 0.1, far: 1000 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        alpha: false,
      }}
      dpr={[1, 1.5]}
      shadows={false}
      style={{ background: '#1a1a1f' }}
      onPointerMissed={() => setSelectedIds([])}
    >
      <color attach="background" args={['#1a1a1f']} />
      <Suspense fallback={<LoadingFallback />}>
        <SceneLighting />
        <SceneGrid />
        <SceneObjects />
        <SceneControls />
        {/* Subtle floor shadow for depth perception */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.25}
          scale={20}
          blur={2}
          far={4}
          color="#000000"
        />
      </Suspense>
    </Canvas>
  )
}

/* ─── Lighting (brighter, matching Three.js editor default) ─── */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight
        position={[5, 10, 7.5]}
        intensity={1}
        color="#ffffff"
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#c4d9ff"
      />
      <hemisphereLight
        color="#ffffff"
        groundColor="#444444"
        intensity={0.5}
      />
    </>
  )
}

/* ─── Grid (brighter, matching Three.js editor) ─── */
function SceneGrid() {
  return (
    <Grid
      position={[0, -0.01, 0]}
      args={[30, 30]}
      cellSize={1}
      cellThickness={0.6}
      cellColor="#333340"
      sectionSize={5}
      sectionThickness={1.2}
      sectionColor="#555566"
      fadeDistance={35}
      fadeStrength={1}
      infiniteGrid
    />
  )
}

/* ─── Controls & Helpers ─── */
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
        <GizmoViewport
          axisColors={['#ff4060', '#40ff60', '#4060ff']}
          labelColor="white"
        />
      </GizmoHelper>
    </>
  )
}
