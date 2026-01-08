import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

export default function MeadowAccessories() {
  const flowerCount = 1200
  const weedCount = 2000
  const range = 6000

  const redFlowerRef = useRef<THREE.InstancedMesh>(null)
  const yellowFlowerRef = useRef<THREE.InstancedMesh>(null)
  const blueFlowerRef = useRef<THREE.InstancedMesh>(null)
  const whiteFlowerRef = useRef<THREE.InstancedMesh>(null)
  const weedRef = useRef<THREE.InstancedMesh>(null)

  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const flowerPerType = Math.floor(flowerCount / 4)

  // Generate stable data
  const flowerData = useMemo(() => {
    const generate = (count: number) => Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * range,
      z: (Math.random() - 0.5) * range,
      scale: 0.4 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI * 2,
      height: 0.3 + Math.random() * 0.5,
    }))
    return {
      red: generate(flowerPerType),
      yellow: generate(flowerPerType),
      blue: generate(flowerPerType),
      white: generate(flowerPerType),
    }
  }, [flowerPerType])

  const weedData = useMemo(() => {
    return Array.from({ length: weedCount }, () => ({
      x: (Math.random() - 0.5) * range,
      z: (Math.random() - 0.5) * range,
      scaleX: 0.5 + Math.random() * 0.5,
      scaleY: 1.5 + Math.random() * 1.5,
      scaleZ: 0.5 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
    }))
  }, [])

  const currentFlowers = useRef({
    red: flowerData.red.map(d => ({ ...d })),
    yellow: flowerData.yellow.map(d => ({ ...d })),
    blue: flowerData.blue.map(d => ({ ...d })),
    white: flowerData.white.map(d => ({ ...d })),
  })
  const currentWeeds = useRef(weedData.map(d => ({ ...d })))

  // Initialize matrices
  useEffect(() => {
    const initFlowers = (ref: THREE.InstancedMesh | null, data: typeof flowerData.red) => {
      if (!ref) return
      data.forEach((item, i) => {
        tempObject.position.set(item.x, item.height + 0.15, item.z)
        tempObject.rotation.y = item.rotation
        tempObject.scale.setScalar(item.scale)
        tempObject.updateMatrix()
        ref.setMatrixAt(i, tempObject.matrix)
      })
      ref.instanceMatrix.needsUpdate = true
    }

    initFlowers(redFlowerRef.current, currentFlowers.current.red)
    initFlowers(yellowFlowerRef.current, currentFlowers.current.yellow)
    initFlowers(blueFlowerRef.current, currentFlowers.current.blue)
    initFlowers(whiteFlowerRef.current, currentFlowers.current.white)

    if (weedRef.current) {
      currentWeeds.current.forEach((item, i) => {
        tempObject.position.set(item.x, item.scaleY * 0.3, item.z)
        tempObject.rotation.set(0, item.rotation, 0)
        tempObject.scale.set(item.scaleX, item.scaleY, item.scaleZ)
        tempObject.updateMatrix()
        weedRef.current!.setMatrixAt(i, tempObject.matrix)
      })
      weedRef.current.instanceMatrix.needsUpdate = true
    }
  }, [tempObject])

  useFrame(({ camera }) => {
    const camX = camera.position.x
    const camZ = camera.position.z

    const updateFlowers = (ref: THREE.InstancedMesh | null, data: typeof currentFlowers.current.red) => {
      if (!ref) return
      let needsUpdate = false

      data.forEach((item, i) => {
        const dx = item.x - camX
        const dz = item.z - camZ

        if (dx > range / 2 || dx < -range / 2 || dz > range / 2 || dz < -range / 2) {
          if (dx > range / 2) item.x -= range
          if (dx < -range / 2) item.x += range
          if (dz > range / 2) item.z -= range
          if (dz < -range / 2) item.z += range
          needsUpdate = true

          tempObject.position.set(item.x, item.height + 0.15, item.z)
          tempObject.rotation.y = item.rotation
          tempObject.scale.setScalar(item.scale)
          tempObject.updateMatrix()
          ref.setMatrixAt(i, tempObject.matrix)
        }
      })

      if (needsUpdate) ref.instanceMatrix.needsUpdate = true
    }

    updateFlowers(redFlowerRef.current, currentFlowers.current.red)
    updateFlowers(yellowFlowerRef.current, currentFlowers.current.yellow)
    updateFlowers(blueFlowerRef.current, currentFlowers.current.blue)
    updateFlowers(whiteFlowerRef.current, currentFlowers.current.white)

    // Update weeds
    if (weedRef.current) {
      let needsUpdate = false
      currentWeeds.current.forEach((item, i) => {
        const dx = item.x - camX
        const dz = item.z - camZ

        if (dx > range / 2 || dx < -range / 2 || dz > range / 2 || dz < -range / 2) {
          if (dx > range / 2) item.x -= range
          if (dx < -range / 2) item.x += range
          if (dz > range / 2) item.z -= range
          if (dz < -range / 2) item.z += range
          needsUpdate = true

          tempObject.position.set(item.x, item.scaleY * 0.3, item.z)
          tempObject.rotation.set(0, item.rotation, 0)
          tempObject.scale.set(item.scaleX, item.scaleY, item.scaleZ)
          tempObject.updateMatrix()
          weedRef.current!.setMatrixAt(i, tempObject.matrix)
        }
      })
      if (needsUpdate) weedRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      <instancedMesh ref={redFlowerRef} args={[undefined, undefined, flowerPerType]} frustumCulled={false}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#cc2222" roughness={0.7} />
      </instancedMesh>

      <instancedMesh ref={yellowFlowerRef} args={[undefined, undefined, flowerPerType]} frustumCulled={false}>
        <dodecahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.6} />
      </instancedMesh>

      <instancedMesh ref={blueFlowerRef} args={[undefined, undefined, flowerPerType]} frustumCulled={false}>
        <coneGeometry args={[0.08, 0.2, 6]} />
        <meshStandardMaterial color="#4466cc" roughness={0.7} />
      </instancedMesh>

      <instancedMesh ref={whiteFlowerRef} args={[undefined, undefined, flowerPerType]} frustumCulled={false}>
        <sphereGeometry args={[0.1, 6, 4]} />
        <meshStandardMaterial color="#ffffee" roughness={0.8} />
      </instancedMesh>

      <instancedMesh ref={weedRef} args={[undefined, undefined, weedCount]} frustumCulled={false}>
        <coneGeometry args={[0.06, 1, 4]} />
        <meshStandardMaterial color="#3a5a2a" roughness={1} />
      </instancedMesh>
    </group>
  )
}
