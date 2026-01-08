import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// =====================================================
// WIND FARM - Array of rotating wind turbines with LOD
// =====================================================

const TURBINE_POSITIONS: [number, number, number][] = [
    [0, 0, 0],
    [150, 0, 80],
    [-120, 0, 100],
    [80, 0, -100],
    [-80, 0, -60],
    [200, 0, -40],
    [-180, 0, 30],
]

const WIND_FARM_CENTER: [number, number, number] = [1000, 0, 1500]

export default function WindFarm() {
    return (
        <group position={WIND_FARM_CENTER}>
            {TURBINE_POSITIONS.map((pos, i) => (
                <WindTurbineWithLOD
                    key={i}
                    position={pos}
                    rotationSpeed={0.8 + Math.random() * 0.4}
                    phase={Math.random() * Math.PI * 2}
                />
            ))}

            {/* Small maintenance building */}
            <mesh position={[0, 2, 150]} castShadow receiveShadow>
                <boxGeometry args={[10, 4, 8]} />
                <meshStandardMaterial color="#778899" roughness={0.7} />
            </mesh>
            <mesh position={[0, 4.5, 150]} castShadow>
                <boxGeometry args={[12, 1, 10]} />
                <meshStandardMaterial color="#556677" roughness={0.6} />
            </mesh>
        </group>
    )
}

function WindTurbineWithLOD({
    position,
    rotationSpeed,
    phase
}: {
    position: [number, number, number]
    rotationSpeed: number
    phase: number
}) {
    const { camera } = useThree()
    const groupRef = useRef<THREE.Group>(null)
    const currentLOD = useRef<'high' | 'low'>('high')
    const frameCount = useRef(0)

    // World position calculation (wind farm center + local position)
    const worldPos = useMemo(() => new THREE.Vector3(
        WIND_FARM_CENTER[0] + position[0],
        WIND_FARM_CENTER[1] + position[1],
        WIND_FARM_CENTER[2] + position[2]
    ), [position])

    useFrame(() => {
        frameCount.current++

        // Check LOD every 10 frames for performance
        if (frameCount.current % 10 === 0 && groupRef.current) {
            const distance = worldPos.distanceTo(camera.position)
            const newLOD = distance < 400 ? 'high' : 'low'

            if (newLOD !== currentLOD.current) {
                currentLOD.current = newLOD
                // Update visibility
                const children = groupRef.current.children
                if (children.length >= 2) {
                    children[0].visible = newLOD === 'high'
                    children[1].visible = newLOD === 'low'
                }
            }
        }
    })

    return (
        <group ref={groupRef} position={position}>
            {/* High detail version */}
            <group visible={true}>
                <WindTurbineHigh
                    rotationSpeed={rotationSpeed}
                    phase={phase}
                />
            </group>

            {/* Low detail version */}
            <group visible={false}>
                <WindTurbineLow />
            </group>
        </group>
    )
}

function WindTurbineHigh({
    rotationSpeed,
    phase
}: {
    rotationSpeed: number
    phase: number
}) {
    const bladesRef = useRef<THREE.Group>(null)
    const towerHeight = 70

    useFrame((_, delta) => {
        if (bladesRef.current) {
            bladesRef.current.rotation.z += delta * rotationSpeed
        }
    })

    return (
        <group>
            {/* Foundation */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[6, 8, 2, 12]} />
                <meshStandardMaterial color="#666666" roughness={0.9} />
            </mesh>

            {/* Tower - tapered cylinder */}
            <mesh position={[0, towerHeight / 2 + 2, 0]} castShadow>
                <cylinderGeometry args={[2, 3.5, towerHeight, 12]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
            </mesh>

            {/* Nacelle (housing) */}
            <mesh position={[0, towerHeight + 2, 2]} castShadow>
                <boxGeometry args={[4, 3, 8]} />
                <meshStandardMaterial color="#eeeeee" roughness={0.5} />
            </mesh>

            {/* Nacelle rounded front */}
            <mesh position={[0, towerHeight + 2, 6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <sphereGeometry args={[2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#eeeeee" roughness={0.5} />
            </mesh>

            {/* Hub */}
            <mesh position={[0, towerHeight + 2, 8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[1.5, 2, 2, 12]} />
                <meshStandardMaterial color="#dddddd" roughness={0.4} />
            </mesh>

            {/* Rotating blades */}
            <group ref={bladesRef} position={[0, towerHeight + 2, 9]} rotation={[Math.PI / 2, phase, 0]}>
                {[0, 1, 2].map((i) => (
                    <TurbineBlade key={i} angle={(i * Math.PI * 2) / 3} />
                ))}
            </group>

            {/* Access door */}
            <mesh position={[0, 3, 3.6]} castShadow>
                <boxGeometry args={[1.5, 2, 0.2]} />
                <meshStandardMaterial color="#444444" />
            </mesh>

            {/* Warning lights */}
            <mesh position={[0, towerHeight + 5, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.8}
                />
            </mesh>
        </group>
    )
}

// Simplified turbine for far distances
function WindTurbineLow() {
    const towerHeight = 70

    return (
        <group>
            {/* Simple tower */}
            <mesh position={[0, towerHeight / 2, 0]}>
                <cylinderGeometry args={[2.5, 3.5, towerHeight, 6]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            {/* Simple nacelle */}
            <mesh position={[0, towerHeight + 2, 2]}>
                <boxGeometry args={[4, 3, 8]} />
                <meshStandardMaterial color="#eeeeee" />
            </mesh>

            {/* Static blade representation (just a disk) */}
            <mesh position={[0, towerHeight + 2, 9]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[35, 3]} />
                <meshStandardMaterial
                    color="#f8f8f8"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Warning light (always visible) */}
            <mesh position={[0, towerHeight + 5, 0]}>
                <sphereGeometry args={[0.5, 6, 6]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.6}
                />
            </mesh>
        </group>
    )
}

function TurbineBlade({ angle }: { angle: number }) {
    const bladeLength = 35

    return (
        <group rotation={[0, 0, angle]}>
            {/* Blade */}
            <mesh position={[0, bladeLength / 2 + 1, 0]} castShadow>
                <boxGeometry args={[2, bladeLength, 0.5]} />
                <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
            </mesh>
            {/* Blade tip (tapered) */}
            <mesh position={[0, bladeLength + 2, 0]} castShadow>
                <boxGeometry args={[1.2, 4, 0.4]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
            </mesh>
        </group>
    )
}
