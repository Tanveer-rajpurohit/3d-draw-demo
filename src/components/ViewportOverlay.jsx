import React from 'react'
import Inspector from './Inspector'
import MaterialBar from './MaterialBar'
import ViewportInfo from './ViewportInfo'

export default function ViewportOverlay() {
  return (
    <div style={{
      position:'absolute', inset:0,
      pointerEvents:'none',
      zIndex:10,
    }}>
      <div style={{ pointerEvents:'auto' }}>
        <Inspector />
      </div>
      <MaterialBar />
      <ViewportInfo />
    </div>
  )
}
