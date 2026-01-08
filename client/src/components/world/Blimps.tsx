import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// =====================================================
// BLIMPS - Floating advertising blimps
// =====================================================

interface BlimpData {
    position: THREE.Vector3
    orbitRadius: number
    orbitSpeed: number
    altitude: number
    color: string
    text: string
}

const BLIMPS: BlimpData[] = [
    {
        position: new THREE.Vector3(0, 0, 0),
        orbitRadius: 300,
        orbitSpeed: 0.02,
        altitude: 150,
        color: '#cc4444',
        text: 'OTTER'
    },
    {
        position: new THREE.Vector3(0, 0, 0),
        orbitRadius: 400,
        orbitSpeed: -0.015,
        altitude: 200,
        color: '#4444cc',
        text: 'PLANES'
    },
    {
        position: new THREE.Vector3(0, 0, 0),
        orbitRadius: 250,
        orbitSpeed: 0.025,
        altitude: 120,
        color: '#44aa44',
        text: 'FLY!'
    }
]

export default function Blimps() {
    return (
        <group>
            {BLIMPS.map((blimp, i) => (
                <Blimp key={i} data={blimp} startAngle={i * (Math.PI * 2 / 3)} />
            ))}
        </group>
    )
}

function Blimp({ data, startAngle }: { data: BlimpData; startAngle: number }) {
    const groupRef = useRef<THREE.Group>(null)
    const angleRef = useRef(startAngle)

    useFrame((_, delta) => {
        if (!groupRef.current) return

        angleRef.current += data.orbitSpeed * delta

        groupRef.current.position.x = Math.cos(angleRef.current) * data.orbitRadius
        groupRef.current.position.z = Math.sin(angleRef.current) * data.orbitRadius
        groupRef.current.position.y = data.altitude + Math.sin(angleRef.current * 2) * 5

        // Face direction of travel
        groupRef.current.rotation.y = -angleRef.current + Math.PI / 2
    })

    return (
        <group ref={groupRef}>
            {/* Main envelope (blimp body) */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <capsuleGeometry args={[8, 30, 8, 16]} />
                <meshStandardMaterial
                    color={data.color}
                    roughness={0.6}
                    metalness={0.2}
                />
            </mesh>

            {/* Top fin */}
            <mesh position={[12, 4, 0]} rotation={[0, 0, 0.3]} castShadow>
                <boxGeometry args={[8, 6, 0.5]} />
                <meshStandardMaterial color={data.color} />
            </mesh>

            {/* Bottom fin */}
            <mesh position={[12, -4, 0]} rotation={[0, 0, -0.3]} castShadow>
                <boxGeometry args={[8, 6, 0.5]} />
                <meshStandardMaterial color={data.color} />
            </mesh>

            {/* Side fins */}
            <mesh position={[12, 0, 4]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[8, 0.5, 6]} />
                <meshStandardMaterial color={data.color} />
            </mesh>
            <mesh position={[12, 0, -4]} rotation={[-0.3, 0, 0]} castShadow>
                <boxGeometry args={[8, 0.5, 6]} />
                <meshStandardMaterial color={data.color} />
            </mesh>

            {/* Gondola (passenger cabin) */}
            <mesh position={[0, -10, 0]} castShadow>
                <boxGeometry args={[12, 4, 4]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>

            {/* Gondola windows */}
            <mesh position={[0, -9, 2.1]}>
                <boxGeometry args={[10, 2, 0.1]} />
                <meshStandardMaterial
                    color="#88bbff"
                    transparent
                    opacity={0.6}
                    metalness={0.9}
                />
            </mesh>

            {/* Advertising panel (side) */}
            <mesh position={[0, 0, 8.5]}>
                <boxGeometry args={[20, 5, 0.2]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffff88"
                    emissiveIntensity={0.3}
                />
            </mesh>
            <mesh position={[0, 0, -8.5]}>
                <boxGeometry args={[20, 5, 0.2]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffff88"
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Navigation lights */}
            <mesh position={[-15, 0, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={1}
                />
            </mesh>
            <mesh position={[15, 0, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial
                    color="#00ff00"
                    emissive="#00ff00"
                    emissiveIntensity={1}
                />
            </mesh>
            <mesh position={[0, 8, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.8}
                />
            </mesh>
        </group>
    )
}
