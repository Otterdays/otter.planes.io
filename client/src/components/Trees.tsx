import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Trees() {
  const count = 400
  const range = 6000

  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const foliageRef = useRef<THREE.InstancedMesh>(null)
  const foliage2Ref = useRef<THREE.InstancedMesh>(null)
  const foliage3Ref = useRef<THREE.InstancedMesh>(null)

  const tempObject = useMemo(() => new THREE.Object3D(), [])

  // Generate stable positions - avoid certain areas
  const treeData = useMemo(() => {
    const data: { x: number, z: number, scale: number, rotation: number }[] = []

    // Exclusion zones (circular areas where trees shouldn't spawn)
    const exclusions = [
      { x: 3000, z: -3000, radius: 500 },   // Downtown
      { x: -2500, z: 2500, radius: 350 },   // Lake
      { x: 0, z: 0, radius: 400 },           // Airport area
      { x: 2000, z: -1500, radius: 600 },   // MT. DORP mountain
    ]

    // Mountain border radius - don't spawn trees too close to edge
    const WORLD_EDGE = 10000

    let attempts = 0
    while (data.length < count && attempts < count * 3) {
      attempts++
      const x = (Math.random() - 0.5) * range
      const z = (Math.random() - 0.5) * range

      // Check if too close to world edge (mountain border)
      const distToEdge = Math.max(Math.abs(x), Math.abs(z))
      if (distToEdge > WORLD_EDGE) continue

      // Check exclusion zones
      let inExclusion = false
      for (const zone of exclusions) {
        const dx = x - zone.x
        const dz = z - zone.z
        if (dx * dx + dz * dz < zone.radius * zone.radius) {
          inExclusion = true
          break
        }
      }
      if (inExclusion) continue

      data.push({
        x,
        z,
        scale: 1.5 + Math.random() * 2.5,
        rotation: Math.random() * Math.PI * 2,
      })
    }
    return data
  }, [])

  const currentPositions = useRef(treeData.map(d => ({ ...d })))

  // Initialize matrices on mount
  useEffect(() => {
    if (!trunkRef.current || !foliageRef.current || !foliage2Ref.current || !foliage3Ref.current) return

    currentPositions.current.forEach((pos, i) => {
      const baseHeight = pos.scale * 4
      const trunkWidth = pos.scale * 0.5

      // Trunk
      tempObject.position.set(pos.x, baseHeight / 2, pos.z)
      tempObject.rotation.y = pos.rotation
      tempObject.scale.set(trunkWidth, baseHeight, trunkWidth)
      tempObject.updateMatrix()
      trunkRef.current!.setMatrixAt(i, tempObject.matrix)

      // Foliage layers
      const foliageBaseY = baseHeight * 0.6

      tempObject.position.set(pos.x, foliageBaseY, pos.z)
      tempObject.scale.set(pos.scale * 2, pos.scale * 3, pos.scale * 2)
      tempObject.updateMatrix()
      foliageRef.current!.setMatrixAt(i, tempObject.matrix)

      tempObject.position.set(pos.x, foliageBaseY + pos.scale * 2, pos.z)
      tempObject.scale.set(pos.scale * 1.5, pos.scale * 2.5, pos.scale * 1.5)
      tempObject.updateMatrix()
      foliage2Ref.current!.setMatrixAt(i, tempObject.matrix)

      tempObject.position.set(pos.x, foliageBaseY + pos.scale * 4, pos.z)
      tempObject.scale.set(pos.scale * 0.8, pos.scale * 2, pos.scale * 0.8)
      tempObject.updateMatrix()
      foliage3Ref.current!.setMatrixAt(i, tempObject.matrix)
    })

    trunkRef.current.instanceMatrix.needsUpdate = true
    foliageRef.current.instanceMatrix.needsUpdate = true
    foliage2Ref.current.instanceMatrix.needsUpdate = true
    foliage3Ref.current.instanceMatrix.needsUpdate = true
  }, [tempObject])

  // Update positions each frame for infinite scrolling
  useFrame(({ camera }) => {
    if (!trunkRef.current || !foliageRef.current || !foliage2Ref.current || !foliage3Ref.current) return

    const camX = camera.position.x
    const camZ = camera.position.z
    let needsUpdate = false

    currentPositions.current.forEach((pos, i) => {
      const dx = pos.x - camX
      const dz = pos.z - camZ

      // Don't wrap trees if they would end up near the world edge
      const WORLD_EDGE = 10000

      // Only update if wrapped AND new position wouldn't be too close to edge
      if (dx > range / 2 || dx < -range / 2 || dz > range / 2 || dz < -range / 2) {
        let newX = pos.x
        let newZ = pos.z

        if (dx > range / 2) newX -= range
        if (dx < -range / 2) newX += range
        if (dz > range / 2) newZ -= range
        if (dz < -range / 2) newZ += range

        // Skip wrapping if new position would be too close to world edge
        if (Math.abs(newX) > WORLD_EDGE || Math.abs(newZ) > WORLD_EDGE) {
          return // Don't wrap this tree
        }

        pos.x = newX
        pos.z = newZ
        needsUpdate = true

        const baseHeight = pos.scale * 4
        const trunkWidth = pos.scale * 0.5
        const foliageBaseY = baseHeight * 0.6

        tempObject.position.set(pos.x, baseHeight / 2, pos.z)
        tempObject.rotation.y = pos.rotation
        tempObject.scale.set(trunkWidth, baseHeight, trunkWidth)
        tempObject.updateMatrix()
        trunkRef.current!.setMatrixAt(i, tempObject.matrix)

        tempObject.position.set(pos.x, foliageBaseY, pos.z)
        tempObject.scale.set(pos.scale * 2, pos.scale * 3, pos.scale * 2)
        tempObject.updateMatrix()
        foliageRef.current!.setMatrixAt(i, tempObject.matrix)

        tempObject.position.set(pos.x, foliageBaseY + pos.scale * 2, pos.z)
        tempObject.scale.set(pos.scale * 1.5, pos.scale * 2.5, pos.scale * 1.5)
        tempObject.updateMatrix()
        foliage2Ref.current!.setMatrixAt(i, tempObject.matrix)

        tempObject.position.set(pos.x, foliageBaseY + pos.scale * 4, pos.z)
        tempObject.scale.set(pos.scale * 0.8, pos.scale * 2, pos.scale * 0.8)
        tempObject.updateMatrix()
        foliage3Ref.current!.setMatrixAt(i, tempObject.matrix)
      }
    })

    if (needsUpdate) {
      trunkRef.current.instanceMatrix.needsUpdate = true
      foliageRef.current.instanceMatrix.needsUpdate = true
      foliage2Ref.current.instanceMatrix.needsUpdate = true
      foliage3Ref.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, count]} castShadow receiveShadow frustumCulled={false}>
        <cylinderGeometry args={[0.3, 0.5, 1, 8]} />
        <meshStandardMaterial color="#3d2817" roughness={0.95} />
      </instancedMesh>

      <instancedMesh ref={foliageRef} args={[undefined, undefined, count]} castShadow receiveShadow frustumCulled={false}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#1a4d1a" roughness={0.85} />
      </instancedMesh>

      <instancedMesh ref={foliage2Ref} args={[undefined, undefined, count]} castShadow receiveShadow frustumCulled={false}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.85} />
      </instancedMesh>

      <instancedMesh ref={foliage3Ref} args={[undefined, undefined, count]} castShadow receiveShadow frustumCulled={false}>
        <coneGeometry args={[1, 1, 6]} />
        <meshStandardMaterial color="#3d6b3d" roughness={0.85} />
      </instancedMesh>
    </group>
  )
}
