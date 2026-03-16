import { useMemo } from 'react'
import * as THREE from 'three'
import { ROAD_NETWORK } from '../../config/worldLocations'

// =====================================================
// ROADS - Unified Road System
// Renders the road network defined in worldLocations.ts
// Supports arbitrary angles and diagonal roads
// =====================================================

export default function Roads() {
    return (
        <group name="road-network">
            {ROAD_NETWORK.map((road, i) => (
                <RoadSegment
                    key={`road-${i}`}
                    start={road.start}
                    end={road.end}
                    width={road.width || 8}
                />
            ))}
        </group>
    )
}

function RoadSegment({ start, end, width }: { start: number[], end: number[], width: number }) {
    // Calculate geometry
    const startVec = new THREE.Vector3(start[0], 0, start[2])
    const endVec = new THREE.Vector3(end[0], 0, end[2])

    // Vector from start to end
    const direction = new THREE.Vector3().subVectors(endVec, startVec)
    const length = direction.length()

    // Midpoint for placement
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)

    // Angle rotation (around Y axis)
    // Math.atan2(z, x) gives angle from positive X axis
    // In ThreeJS, plane is created along X axis by default
    const angle = Math.atan2(direction.z, direction.x)

    const texture = useRoadTexture(length, width)

    return (
        <mesh
            position={[midPoint.x, 0.08, midPoint.z]}
            rotation={[-Math.PI / 2, 0, -angle]} // Rotate flat on ground, then align with direction
            receiveShadow
        >
            <planeGeometry args={[length, width]} />
            <meshStandardMaterial map={texture} roughness={0.9} />
        </mesh>
    )
}

// Shared road texture hook
function useRoadTexture(length: number, width: number) {
    return useMemo(() => {
        const canvas = document.createElement('canvas')
        const w = 512 // Length resolution
        const h = 64  // Width resolution

        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!

        // Asphalt base
        ctx.fillStyle = '#3d3d3d'
        ctx.fillRect(0, 0, w, h)

        // Noise texture (worn asphalt)
        for (let i = 0; i < 400; i++) {
            const brightness = 25 + Math.random() * 30
            ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.2)`
            ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
        }

        // White edge lines
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 2, w, 2)
        ctx.fillRect(0, h - 4, w, 2)

        // Yellow center dashes
        ctx.fillStyle = '#ddaa00'

        // Calculate dash frequency based on road length to keep scale consistent
        // We want repeats to look natural regardless of segment length
        const dashCount = 8
        const dashWidth = w / (dashCount * 2)

        for (let i = 0; i < dashCount; i++) {
            ctx.fillRect(i * 2 * dashWidth + (dashWidth / 2), (h / 2) - 2, dashWidth, 4)
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping

        // Adjust repeat to match world units
        // Length repeat: 1 repeat per ~40 units
        texture.repeat.set(length / 40, 1)

        return texture
    }, [length, width])
}
