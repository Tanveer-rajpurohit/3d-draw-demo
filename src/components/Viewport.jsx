import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import * as THREE from 'three'
import SceneObjects from './SceneObjects'
import useStore from '../store/store'

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#4a9eff" wireframe />
    </mesh>
  )
}

export default function Viewport() {
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
      style={{ background: '#0a0a0f' }}
      onPointerMissed={() => setSelectedIds([])}
    >
      <color attach="background" args={['#0a0a0f']} />
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

/* ─── Lighting: Sci-Fi blue-tinted setup with slow rotation ─── */
function SceneLighting() {
  const lightRef = useRef()

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime() * 0.15
      lightRef.current.position.x = Math.cos(t) * 8
      lightRef.current.position.z = Math.sin(t) * 8
    }
  })

  return (
    <>
      <ambientLight intensity={0.3} color="#334466" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        color="#aaccff"
      />
      <directionalLight
        position={[-5, -2, -8]}
        intensity={0.2}
        color="#334488"
      />
      <pointLight
        ref={lightRef}
        position={[0, 5, 0]}
        intensity={0.5}
        color="#4488ff"
        distance={20}
      />
      <hemisphereLight
        color="#334466"
        groundColor="#111122"
        intensity={0.4}
      />
    </>
  )
}

/* ─── Two-layer Grid ─── */
function SceneGrid() {
  return (
    <Grid
      position={[0, -0.01, 0]}
      args={[40, 40]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#1a1a28"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#252535"
      fadeDistance={40}
      fadeStrength={1.2}
      infiniteGrid
    />
  )
}

/* ─── Floor Plane — subtle dark reflection feel ─── */
function FloorPlane() {
  return (
    <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#0d0d14"
        transparent
        opacity={0.6}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
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
