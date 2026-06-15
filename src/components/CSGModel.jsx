import React, { useRef, useMemo, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import { Geometry, Base, Addition } from '@react-three/csg'
import useStore from '../store/store'

export default function CSGModel() {
  const wingPosition = useStore((s) => s.wingPosition)
  const wingRotation = useStore((s) => s.wingRotation)
  const setWingPosition = useStore((s) => s.setWingPosition)
  const setWingRotation = useStore((s) => s.setWingRotation)
  const transformMode = useStore((s) => s.transformMode)

  const wingRef = useRef()

  const handleTransformEnd = useCallback(() => {
    if (!wingRef.current) return
    const pos = wingRef.current.position
    const rot = wingRef.current.rotation
    setWingPosition([pos.x, pos.y, pos.z])
    setWingRotation([rot.x, rot.y, rot.z])
  }, [setWingPosition, setWingRotation])

  const fuselageArgs = useMemo(() => [0.45, 0.45, 4.5, 24], [])
  const wingArgs = useMemo(() => [4.5, 0.12, 1.2], [])

  return (
    <group position={[0, 1.2, 0]}>
      {/* CSG Fused Mesh */}
      <mesh>
        <meshStandardMaterial
          color="#cccccc"
          roughness={0.8}
          metalness={0.1}
        />
        <Geometry useGroups={false}>
          <Base rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
            <cylinderGeometry args={fuselageArgs} />
          </Base>
          <Addition position={wingPosition} rotation={wingRotation}>
            <boxGeometry args={wingArgs} />
          </Addition>
        </Geometry>
      </mesh>

      {/* Draggable wing control handle */}
      <TransformControls
        mode={transformMode}
        position={wingPosition}
        rotation={wingRotation}
        size={0.6}
        onMouseUp={handleTransformEnd}
      >
        <mesh ref={wingRef} visible={true}>
          <boxGeometry args={wingArgs} />
          <meshStandardMaterial
            color="#8DBCC7"
            roughness={0.6}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      </TransformControls>

      {/* Nose cone */}
      <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.45, 0.8, 24]} />
        <meshStandardMaterial color="#cccccc" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Tail cone */}
      <mesh position={[-2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.45, 1.2, 24]} />
        <meshStandardMaterial color="#cccccc" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}
