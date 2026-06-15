import React from 'react'
import useStore from '../store/store'

export default function ViewportInfo() {
  const sceneObjects = useStore((s) => s.sceneObjects)

  const totalObjects = sceneObjects.length + 1 // +1 for CSG
  // Rough vertex estimates
  const vertexEstimates = {
    box: 24, sphere: 1056, cylinder: 192, cone: 192, torus: 576,
    plane: 4, capsule: 320, circle: 96, dodecahedron: 60,
    icosahedron: 42, octahedron: 24, tetrahedron: 12, ring: 128,
    torusknot: 1536, lathe: 144, tube: 1040, generated: 252,
  }

  let totalVertices = 96 + 24 // CSG fuselage base
  let totalTriangles = 0
  sceneObjects.forEach((obj) => {
    const v = vertexEstimates[obj.type] || 24
    totalVertices += v
    totalTriangles += Math.floor(v / 3) * 2
  })

  return (
    <div className="absolute bottom-14 left-3 text-[11px] font-mono text-text-muted leading-relaxed pointer-events-none z-10 select-none">
      <div>{totalObjects} object{totalObjects !== 1 ? 's' : ''}</div>
      <div>{totalVertices} vertices</div>
      <div>{totalTriangles} triangles</div>
      <div>0.50 render time</div>
    </div>
  )
}
