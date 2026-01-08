import { useMemo } from 'react'
import * as THREE from 'three'

// =====================================================
// ROADS - Grid-based road system
// Only uses horizontal (X) and vertical (Z) roads
// All roads meet at clean 90° intersections
// =====================================================

// Road definitions: purely axis-aligned for clean connections
// Format: [x1, z1] to [x2, z2] - all Y = 0
const HORIZONTAL_ROADS: Array<{ z: number, xStart: number, xEnd: number, width: number }> = [
    // === AIRPORT AREA ===
    // Main perimeter
    { z: 200, xStart: -250, xEnd: 300, width: 12 },   // South edge
    { z: -180, xStart: -250, xEnd: 300, width: 12 },  // North edge
    { z: 0, xStart: -250, xEnd: 300, width: 10 },     // Center crossroad

    // === OUTER ROADS ===
    // Far south (toward landmarks)
    { z: 600, xStart: -600, xEnd: 700, width: 8 },
    { z: 1000, xStart: -900, xEnd: 1000, width: 7 },

    // Far north
    { z: -500, xStart: -600, xEnd: 700, width: 8 },
    { z: -900, xStart: -400, xEnd: 800, width: 6 },
]

const VERTICAL_ROADS: Array<{ x: number, zStart: number, zEnd: number, width: number }> = [
    // === AIRPORT AREA ===
    // Main perimeter
    { x: -250, zStart: -180, zEnd: 200, width: 12 },  // West edge
    { x: 300, zStart: -180, zEnd: 200, width: 12 },   // East edge
    { x: 0, zStart: -180, zEnd: 200, width: 10 },     // Center N-S

    // === ROADS TO LANDMARKS ===
    // West side (toward Lighthouse)
    { x: -250, zStart: 200, zEnd: 600, width: 10 },
    { x: -600, zStart: 0, zEnd: 1000, width: 8 },
    { x: -900, zStart: 600, zEnd: 1000, width: 7 },

    // East side (toward Wind Farm)  
    { x: 300, zStart: 200, zEnd: 600, width: 10 },
    { x: 700, zStart: 0, zEnd: 1000, width: 8 },
    { x: 1000, zStart: 600, zEnd: 1000, width: 7 },

    // North roads (toward Mountain and Radio Towers)
    { x: 0, zStart: -500, zEnd: -180, width: 9 },
    { x: -250, zStart: -500, zEnd: -180, width: 8 },
    { x: 300, zStart: -500, zEnd: -180, width: 8 },
    { x: -600, zStart: -500, zEnd: 0, width: 7 },
    { x: 700, zStart: -900, zEnd: 0, width: 7 },

    // Far landmarks
    { x: -400, zStart: -900, zEnd: -500, width: 6 },
    { x: 800, zStart: -900, zEnd: -500, width: 6 },
]

export default function Roads() {
    return (
        <group name="road-network">
            {/* Horizontal roads (along X axis) */}
            {HORIZONTAL_ROADS.map((road, i) => (
                <HorizontalRoad key={`h-${i}`} {...road} />
            ))}

            {/* Vertical roads (along Z axis) */}
            {VERTICAL_ROADS.map((road, i) => (
                <VerticalRoad key={`v-${i}`} {...road} />
            ))}

            {/* Intersections - renders at all crossing points */}
            <Intersections />
        </group>
    )
}

function HorizontalRoad({ z, xStart, xEnd, width }: { z: number, xStart: number, xEnd: number, width: number }) {
    const length = Math.abs(xEnd - xStart)
    const centerX = (xStart + xEnd) / 2

    const texture = useRoadTexture(length)

    return (
        <mesh position={[centerX, 0.06, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[length, width]} />
            <meshStandardMaterial map={texture} roughness={0.88} />
        </mesh>
    )
}

function VerticalRoad({ x, zStart, zEnd, width }: { x: number, zStart: number, zEnd: number, width: number }) {
    const length = Math.abs(zEnd - zStart)
    const centerZ = (zStart + zEnd) / 2

    const texture = useRoadTexture(length)

    return (
        <mesh position={[x, 0.06, centerZ]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
            <planeGeometry args={[length, width]} />
            <meshStandardMaterial map={texture} roughness={0.88} />
        </mesh>
    )
}

function Intersections() {
    // Calculate all intersection points where roads cross
    const intersections = useMemo(() => {
        const points: Array<{ x: number, z: number, size: number }> = []

        HORIZONTAL_ROADS.forEach(hRoad => {
            VERTICAL_ROADS.forEach(vRoad => {
                // Check if they actually intersect
                if (vRoad.x >= hRoad.xStart && vRoad.x <= hRoad.xEnd &&
                    hRoad.z >= vRoad.zStart && hRoad.z <= vRoad.zEnd) {
                    // Calculate intersection size based on road widths
                    const size = Math.max(hRoad.width, vRoad.width) * 0.8
                    points.push({ x: vRoad.x, z: hRoad.z, size })
                }
            })
        })

        return points
    }, [])

    return (
        <group>
            {intersections.map((int, i) => (
                <mesh
                    key={i}
                    position={[int.x, 0.065, int.z]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[int.size * 2, int.size * 2]} />
                    <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
                </mesh>
            ))}
        </group>
    )
}

// Shared road texture hook
function useRoadTexture(length: number) {
    return useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 64
        const ctx = canvas.getContext('2d')!

        // Asphalt base
        ctx.fillStyle = '#3d3d3d'
        ctx.fillRect(0, 0, 256, 64)

        // Noise texture
        for (let i = 0; i < 200; i++) {
            const brightness = 25 + Math.random() * 30
            ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.2)`
            ctx.fillRect(Math.random() * 256, Math.random() * 64, 2, 2)
        }

        // White edge lines
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 2, 256, 2)
        ctx.fillRect(0, 60, 256, 2)

        // Yellow center dashes
        ctx.fillStyle = '#ddaa00'
        for (let x = 0; x < 256; x += 40) {
            ctx.fillRect(x, 30, 25, 4)
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.repeat.set(length / 30, 1)
        return texture
    }, [length])
}
