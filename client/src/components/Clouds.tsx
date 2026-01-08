import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// =====================================================
// CLOUDS - Fluffy marshmallow clouds in the sky
// =====================================================

interface CloudPuff {
  offset: THREE.Vector3
  scale: number
}

interface Cloud {
  position: THREE.Vector3
  puffs: CloudPuff[]
  speed: number
  size: number // 1-3 scale for variety
}

function generateCloud(range: number): Cloud {
  const puffCount = 12 + Math.floor(Math.random() * 15) // 12-27 puffs
  const size = 1 + Math.random() * 2 // 1-3 size multiplier
  const puffs: CloudPuff[] = []

  // Create a fluffy, marshmallow-like cloud shape
  for (let i = 0; i < puffCount; i++) {
    // Core cluster of puffs
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 0.8
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    // Slight vertical variation, flatter on bottom
    const y = (Math.random() * 0.6) - 0.2

    puffs.push({
      offset: new THREE.Vector3(x, y, z),
      scale: 0.6 + Math.random() * 0.6,
    })
  }

  // Add some larger "pillowing" puffs on top
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 0.5
    puffs.push({
      offset: new THREE.Vector3(
        Math.cos(angle) * radius,
        0.3 + Math.random() * 0.4,
        Math.sin(angle) * radius
      ),
      scale: 0.8 + Math.random() * 0.4,
    })
  }

  return {
    position: new THREE.Vector3(
      (Math.random() - 0.5) * range,
      400 + Math.random() * 400, // Higher altitude: 400-800
      (Math.random() - 0.5) * range
    ),
    puffs,
    speed: 2 + Math.random() * 5,
    size,
  }
}

export default function Clouds() {
  const cloudCount = 80 // More clouds
  const range = 8000 // Larger range
  const maxPuffsPerCloud = 35
  const totalPuffs = cloudCount * maxPuffsPerCloud

  const meshRef = useRef<THREE.InstancedMesh>(null)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const frameCountRef = useRef(0)

  // Initialize clouds
  const cloudsRef = useRef<Cloud[]>(
    Array.from({ length: cloudCount }, () => generateCloud(range))
  )

  useFrame(({ camera, clock }) => {
    if (!meshRef.current) return

    const clouds = cloudsRef.current
    let instanceIndex = 0
    const time = clock.getElapsedTime()

    const camX = camera.position.x
    const camZ = camera.position.z

    clouds.forEach((cloud) => {
      // Slow drift
      cloud.position.x += cloud.speed * 0.005

      // Infinite wrapping
      const dx = cloud.position.x - camX
      const dz = cloud.position.z - camZ

      if (dx > range / 2) cloud.position.x -= range
      if (dx < -range / 2) cloud.position.x += range
      if (dz > range / 2) cloud.position.z -= range
      if (dz < -range / 2) cloud.position.z += range

      // Gentle bobbing
      const bob = Math.sin(time * 0.3 + cloud.position.x * 0.01) * 3

      // Base scale for this cloud
      const cloudScale = cloud.size * 40 // Much bigger clouds

      cloud.puffs.forEach((puff) => {
        if (instanceIndex >= totalPuffs) return

        tempObject.position.set(
          cloud.position.x + puff.offset.x * cloudScale,
          cloud.position.y + puff.offset.y * cloudScale + bob,
          cloud.position.z + puff.offset.z * cloudScale
        )

        const puffSize = puff.scale * cloudScale * 0.5
        tempObject.scale.set(puffSize, puffSize * 0.8, puffSize) // Slightly flattened

        tempObject.updateMatrix()
        meshRef.current!.setMatrixAt(instanceIndex, tempObject.matrix)
        instanceIndex++
      })

      // Hide unused instances
      while (instanceIndex % maxPuffsPerCloud !== 0 && instanceIndex < totalPuffs) {
        tempObject.scale.setScalar(0)
        tempObject.updateMatrix()
        meshRef.current!.setMatrixAt(instanceIndex, tempObject.matrix)
        instanceIndex++
      }
    })

    // Only update instance matrices every 3rd frame (clouds drift slowly)
    frameCountRef.current++
    if (frameCountRef.current % 3 === 0) {
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalPuffs]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.15}
        roughness={1}
        metalness={0}
        transparent
        opacity={0.95}
      />
    </instancedMesh>
  )
}
