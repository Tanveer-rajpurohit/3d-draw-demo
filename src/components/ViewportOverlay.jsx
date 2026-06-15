import React from 'react'
import MaterialBar from './MaterialBar'
import Inspector from './Inspector'
import ViewportInfo from './ViewportInfo'

export default function ViewportOverlay() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      {/* Inspector (top-right) */}
      <Inspector />

      {/* Material Bar (bottom center) */}
      <div style={{ pointerEvents: 'auto' }}>
        <MaterialBar />
      </div>

      {/* Viewport Info (bottom-left) */}
      <ViewportInfo />
    </div>
  )
}
