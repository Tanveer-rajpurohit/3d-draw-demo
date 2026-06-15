import React from 'react'
import useStore from '../store/store'

export default function ViewportInfo() {
  const sceneObjects = useStore((s) => s.sceneObjects)
  const materialMode = useStore((s) => s.materialMode)

  const vertEst = sceneObjects.reduce((acc, o) => {
    if (o.type === 'csg_result' && o.geometry) return acc + (o.geometry.attributes?.position?.count || 0)
    if (o.type === 'gltf') return acc + 2000
    const t = o.type
    if (t === 'sphere') return acc + 528
    if (t === 'cylinder' || t === 'cone') return acc + 66
    if (t === 'torus') return acc + 1600
    if (t === 'torusknot') return acc + 512
    return acc + 24
  }, 0)

  const triEst = Math.round(vertEst * 0.67)

  return (
    <div style={{
      position: 'absolute', bottom: '36px', left: '12px',
      fontSize: '10px', fontFamily: 'var(--mono-font)', color: 'var(--text-muted)',
      lineHeight: 1.6, pointerEvents: 'none', zIndex: 15, userSelect: 'none',
    }}>
      <div>{sceneObjects.length} objects {vertEst} vertices {triEst} triangles</div>
      <div>0.5ms | {materialMode} mode</div>
    </div>
  )
}
