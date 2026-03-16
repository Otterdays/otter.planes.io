import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import PlaneModel, { PlaneVariant } from './PlaneModel'

interface Player {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  velocity: [number, number, number]
  timestamp: number
}

interface OtherPlaneProps {
  player: Player
}

// Assign a consistent color based on player ID hash
function getPlayerColor(playerId: string): { primary: string; secondary: string; accent: string } {
  // Generate a hash from the player ID
  let hash = 0
  for (let i = 0; i < playerId.length; i++) {
    hash = ((hash << 5) - hash) + playerId.charCodeAt(i)
    hash = hash & hash
  }

  // Use the hash to pick a hue
  const hue = Math.abs(hash) % 360

  return {
    primary: `hsl(${hue}, 70%, 35%)`,
    secondary: `hsl(${hue}, 70%, 25%)`,
    accent: `hsl(${(hue + 40) % 360}, 80%, 60%)`,
  }
}

// Randomly assign a variant based on player ID
function getPlayerVariant(playerId: string): PlaneVariant {
  let hash = 0
  for (let i = 0; i < playerId.length; i++) {
    hash = ((hash << 5) - hash) + playerId.charCodeAt(i)
    hash = hash & hash
  }

  const variants: PlaneVariant[] = ['ww2', 'jet', 'biplane']
  return variants[Math.abs(hash) % variants.length]
}

export default function OtherPlane({ player }: OtherPlaneProps) {
  const meshRef = useRef<THREE.Group>(null)
  const targetPositionRef = useRef(new THREE.Vector3(...player.position))
  const targetRotationRef = useRef(new THREE.Euler(...player.rotation))

  // Stable variant and color based on player ID
  const variant = getPlayerVariant(player.id)
  const colors = getPlayerColor(player.id)

  // Estimate velocity for propeller speed
  const velocityRef = useRef(new THREE.Vector3(...player.velocity))

  useEffect(() => {
    targetPositionRef.current.set(...player.position)
    targetRotationRef.current.set(...player.rotation)
    velocityRef.current.set(...player.velocity)
  }, [player.position, player.rotation, player.velocity])

  useFrame(() => {
    if (!meshRef.current) return

    // Smooth interpolation for position
    meshRef.current.position.lerp(targetPositionRef.current, 0.15)

    // Smooth interpolation for rotation
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotationRef.current.x,
      0.15
    )
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotationRef.current.y,
      0.15
    )
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      targetRotationRef.current.z,
      0.15
    )
  })

  // Estimate throttle from velocity for propeller animation
  const speed = velocityRef.current.length()
  const estimatedThrottle = Math.min(1, speed / 100)

  return (
    <group ref={meshRef} position={player.position}>
      <PlaneModel
        variant={variant}
        colors={colors}
        controlInputs={{
          pitch: 0,
          roll: 0,
          yaw: 0,
          throttle: estimatedThrottle,
        }}
      />
    </group>
  )
}
