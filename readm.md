# SkyForge AI - Technical Web Prototype

## Overview
SkyForge AI is a browser-based aerospace engineering design studio. It replicates a dark, professional "Blender-style" workspace while integrating cutting-edge Generative AI APIs for rapid iteration.

## Features Required in the MVP
1. **The Dark Canvas:** A Three.js viewport utilizing `@react-three/fiber` with a dark matte background and a highly technical infinite blueprint grid floor.
2. **AI Generation Sidebars:**
   - **Text-to-Model Panel:** A mocked UI sidebar where users type a prompt (e.g., "Stealth Jet") to spawn a 3D model.
   - **Image-to-Model Panel:** A mocked UI where users upload a 2D sketch to be converted into 3D.
3. **Manual Kitbashing (CSG):** The ability to drop basic primitive shapes (Boxes, Cylinders) into the scene, scale/move them manually using 3D arrows (`TransformControls`), and fuse them together into a watertight mesh.
4. **Mesh Fusion & Breakdown:** Utilizing `@react-three/csg` to perform boolean additions (welding wings to a fuselage) and subtractions (slicing meshes).

## Tech Stack & Dependencies
The frontend MUST be built using React and the following specific Three.js libraries:
* `three`
* `@react-three/fiber` (Core WebGL React wrapper)
* `@react-three/drei` (Helpers: Grid, OrbitControls, TransformControls)
* `@react-three/csg` (Constructive Solid Geometry for Mesh Fusing)
* `tailwindcss` (For sleek, modern dashboard UI)

## Mesh Fusing Architecture (@react-three/csg)
Do not write complex raycasting or vertex math. Use the CSG wrapper. The architecture for fusing a custom wing to a fuselage looks like this:
```jsx
import { Geometry, Base, Addition, Subtraction } from '@react-three/csg'

<mesh>
  <meshStandardMaterial color="#555555" />
  <Geometry>
    
    <Base 1, 5]} scale="{[1,">
      <cylinderGeometry />
    </Base>
    
    <Addition 0, 0.2, 0]} 2]} position="{[2," scale="{[4,">
      <boxGeometry />
    </Addition>
  </Geometry>
</mesh>