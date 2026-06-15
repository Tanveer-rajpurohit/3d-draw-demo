import React from 'react'
import useStore from '../store/store'

export default function ViewportInfo() {
  const sceneObjects = useStore((s) => s.sceneObjects)
  const materialMode = useStore((s) => s.materialMode)

  const totalObjects = sceneObjects.length
  const vertexEstimates = {
    box: 24, sphere: 1056, cylinder: 192, cone: 192, torus: 576,
    plane: 4, capsule: 320, circle: 96, dodecahedron: 60,
    icosahedron: 42, octahedron: 24, tetrahedron: 12, ring: 128,
    torusknot: 1536, lathe: 144, tube: 1040, gltf: 500,
  }

  let totalVertices = 0
  let totalTriangles = 0
  sceneObjects.forEach((obj) => {
    const v = vertexEstimates[obj.type] || 24
    totalVertices += v
    totalTriangles += Math.floor(v / 3) * 2
  })

  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      left: '12px',
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      fontSize: '10px',
      color: 'var(--text-muted)',
      lineHeight: 1.6,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 15,
    }}>
      <div>{totalObjects} objects  {totalVertices} vertices  {totalTriangles} triangles</div>
      <div>0.5ms  |  {materialMode} mode</div>
    </div>
  )
}
