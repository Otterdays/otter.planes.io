import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// =====================================================
// LAKE - Beautiful reflective lake with sandy beach
// =====================================================

export default function Lake() {
    const waterRef = useRef<THREE.Mesh>(null)
    const wavesRef = useRef(0)

    // Create water ripple effect
    useFrame((_, delta) => {
        wavesRef.current += delta * 0.5
        if (waterRef.current) {
            const material = waterRef.current.material as THREE.MeshStandardMaterial
            // Subtle shimmer effect
            material.emissiveIntensity = 0.05 + Math.sin(wavesRef.current * 2) * 0.02
        }
    })

    // Beach shape - slightly larger than lake for sand border
    const beachShape = useMemo(() => {
        const shape = new THREE.Shape()
        // Organic blob shape for natural look
        const points = 32
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2
            const radius = 250 + Math.sin(angle * 3) * 30 + Math.cos(angle * 5) * 20
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            if (i === 0) shape.moveTo(x, y)
            else shape.lineTo(x, y)
        }
        return shape
    }, [])

    // Lake shape - smaller than beach
    const lakeShape = useMemo(() => {
        const shape = new THREE.Shape()
        const points = 32
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2
            const radius = 200 + Math.sin(angle * 3) * 25 + Math.cos(angle * 5) * 15
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            if (i === 0) shape.moveTo(x, y)
            else shape.lineTo(x, y)
        }
        return shape
    }, [])

    return (
        <group position={[-2500, 0, 2500]}>
            {/* Sandy Beach */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} receiveShadow>
                <shapeGeometry args={[beachShape]} />
                <meshStandardMaterial
                    color="#e8d4a8"
                    roughness={0.95}
                    metalness={0}
                />
            </mesh>

            {/* Main Lake Water */}
            <mesh
                ref={waterRef}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.15, 0]}
                receiveShadow
            >
                <shapeGeometry args={[lakeShape]} />
                <meshStandardMaterial
                    color="#2288aa"
                    roughness={0.1}
                    metalness={0.8}
                    emissive="#1166aa"
                    emissiveIntensity={0.05}
                    envMapIntensity={1.5}
                />
            </mesh>

            {/* Shallow water edge - lighter blue ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
                <ringGeometry args={[180, 210, 32]} />
                <meshStandardMaterial
                    color="#44aacc"
                    roughness={0.2}
                    metalness={0.6}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Beach umbrellas */}
            {[
                { x: 220, z: 50, color: '#ff4444', rotation: 0.2 },
                { x: 200, z: -80, color: '#4444ff', rotation: -0.3 },
                { x: 240, z: -20, color: '#ffff44', rotation: 0.1 },
                { x: -180, z: 100, color: '#44ff44', rotation: 0.4 },
                { x: -200, z: -60, color: '#ff44ff', rotation: -0.2 },
            ].map((umbrella, i) => (
                <group key={i} position={[umbrella.x, 0, umbrella.z]} rotation={[0, umbrella.rotation, 0]}>
                    {/* Pole */}
                    <mesh position={[0, 2, 0]} castShadow>
                        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
                        <meshStandardMaterial color="#886633" />
                    </mesh>
                    {/* Umbrella top */}
                    <mesh position={[0, 4, 0]} castShadow>
                        <coneGeometry args={[3, 1.5, 8]} />
                        <meshStandardMaterial color={umbrella.color} />
                    </mesh>
                </group>
            ))}

            {/* Beach towels */}
            {[
                { x: 215, z: 55, color: '#ff6699', rotation: 0.5 },
                { x: 195, z: -75, color: '#66ccff', rotation: 1.2 },
                { x: -185, z: 95, color: '#99ff66', rotation: 2.1 },
            ].map((towel, i) => (
                <mesh
                    key={i}
                    position={[towel.x, 0.15, towel.z]}
                    rotation={[-Math.PI / 2, 0, towel.rotation]}
                >
                    <planeGeometry args={[4, 2]} />
                    <meshStandardMaterial color={towel.color} />
                </mesh>
            ))}

            {/* Dock / Pier */}
            <group position={[0, 0, -200]} rotation={[0, 0.3, 0]}>
                {/* Main deck */}
                <mesh position={[0, 1, -15]} castShadow receiveShadow>
                    <boxGeometry args={[6, 0.3, 35]} />
                    <meshStandardMaterial color="#8b6b4a" roughness={0.9} />
                </mesh>
                {/* Support posts */}
                {[-12, -5, 5, 15, 25].map((z, i) => (
                    <mesh key={i} position={[0, 0, -z]} castShadow>
                        <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
                        <meshStandardMaterial color="#5a4030" />
                    </mesh>
                ))}
                {/* Rope posts */}
                {[[-3, -30], [3, -30]].map(([x, z], i) => (
                    <mesh key={i} position={[x, 1.5, z]} castShadow>
                        <cylinderGeometry args={[0.15, 0.15, 1, 6]} />
                        <meshStandardMaterial color="#5a4030" />
                    </mesh>
                ))}
            </group>

            {/* Small boat at dock */}
            <group position={[8, 0.3, -225]} rotation={[0, 0.8, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[3, 1, 6]} />
                    <meshStandardMaterial color="#cc8844" />
                </mesh>
                {/* Boat interior */}
                <mesh position={[0, 0.3, 0]}>
                    <boxGeometry args={[2.2, 0.6, 5]} />
                    <meshStandardMaterial color="#aa7733" />
                </mesh>
            </group>

            {/* Palm trees around beach */}
            {[
                { x: 260, z: 30 },
                { x: 250, z: -100 },
                { x: -230, z: 80 },
                { x: -250, z: -40 },
                { x: 200, z: 150 },
            ].map((tree, i) => (
                <group key={i} position={[tree.x, 0, tree.z]}>
                    {/* Trunk - curved */}
                    <mesh position={[0, 5, 0]} rotation={[0.1, i * 0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.4, 0.6, 10, 8]} />
                        <meshStandardMaterial color="#8b6914" roughness={0.9} />
                    </mesh>
                    {/* Fronds */}
                    {Array.from({ length: 7 }, (_, j) => {
                        const angle = (j / 7) * Math.PI * 2
                        return (
                            <mesh
                                key={j}
                                position={[
                                    Math.cos(angle) * 2,
                                    10,
                                    Math.sin(angle) * 2
                                ]}
                                rotation={[0.6, angle, 0]}
                                castShadow
                            >
                                <coneGeometry args={[0.5, 5, 4]} />
                                <meshStandardMaterial color="#228822" flatShading />
                            </mesh>
                        )
                    })}
                </group>
            ))}

            {/* Beach sign */}
            <group position={[270, 0, 0]} rotation={[0, -0.5, 0]}>
                <mesh position={[0, 1.5, 0]} castShadow>
                    <cylinderGeometry args={[0.1, 0.1, 3, 6]} />
                    <meshStandardMaterial color="#8b6914" />
                </mesh>
                <mesh position={[0, 2.8, 0]} castShadow>
                    <boxGeometry args={[3, 0.8, 0.1]} />
                    <meshStandardMaterial color="#ddcc88" />
                </mesh>
            </group>

            {/* Lifeguard Tower */}
            <group position={[230, 0, 100]}>
                {/* Platform legs */}
                {[[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]].map(([x, z], i) => (
                    <mesh key={i} position={[x, 2, z]} castShadow>
                        <cylinderGeometry args={[0.15, 0.15, 4, 6]} />
                        <meshStandardMaterial color="#ddbb77" />
                    </mesh>
                ))}
                {/* Platform */}
                <mesh position={[0, 4, 0]} castShadow>
                    <boxGeometry args={[4, 0.3, 4]} />
                    <meshStandardMaterial color="#eedd99" />
                </mesh>
                {/* Cabin */}
                <mesh position={[0, 5.5, 0]} castShadow>
                    <boxGeometry args={[3.5, 2.5, 3.5]} />
                    <meshStandardMaterial color="#ff6633" />
                </mesh>
                {/* Roof */}
                <mesh position={[0, 7, 0]} castShadow>
                    <boxGeometry args={[4, 0.2, 4]} />
                    <meshStandardMaterial color="#dd5522" />
                </mesh>
                {/* Ladder */}
                <mesh position={[2.2, 2, 0]} castShadow>
                    <boxGeometry args={[0.3, 4, 0.8]} />
                    <meshStandardMaterial color="#bbaa66" />
                </mesh>
            </group>

            {/* Beach Chairs */}
            {[
                { x: 210, z: 45, rotation: 0.8 },
                { x: 205, z: 35, rotation: 0.7 },
                { x: -190, z: 85, rotation: -0.5 },
            ].map((chair, i) => (
                <group key={i} position={[chair.x, 0.1, chair.z]} rotation={[0, chair.rotation, 0]}>
                    <mesh rotation={[0.3, 0, 0]} castShadow>
                        <boxGeometry args={[1.5, 0.1, 3]} />
                        <meshStandardMaterial color={['#ff8844', '#44aaff', '#44ff88'][i]} />
                    </mesh>
                    {/* Legs */}
                    <mesh position={[-0.5, -0.3, 0.8]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.6, 4]} />
                        <meshStandardMaterial color="#666666" />
                    </mesh>
                    <mesh position={[0.5, -0.3, 0.8]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.6, 4]} />
                        <meshStandardMaterial color="#666666" />
                    </mesh>
                </group>
            ))}

            {/* Beach Volleyball Court */}
            <group position={[-150, 0, 150]}>
                {/* Sand court area (slightly raised) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]} receiveShadow>
                    <planeGeometry args={[20, 10]} />
                    <meshStandardMaterial color="#f5deb3" />
                </mesh>
                {/* Net poles */}
                <mesh position={[-10, 1.5, 0]} castShadow>
                    <cylinderGeometry args={[0.1, 0.1, 3, 6]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
                <mesh position={[10, 1.5, 0]} castShadow>
                    <cylinderGeometry args={[0.1, 0.1, 3, 6]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
                {/* Net */}
                <mesh position={[0, 2.5, 0]}>
                    <boxGeometry args={[19, 1, 0.05]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
                </mesh>
            </group>

            {/* Floating buoys in water */}
            {[
                { x: 50, z: 50 },
                { x: -80, z: 30 },
                { x: 30, z: -70 },
                { x: -50, z: -50 },
            ].map((buoy, i) => (
                <mesh key={i} position={[buoy.x, 0.5, buoy.z]}>
                    <sphereGeometry args={[2, 8, 8]} />
                    <meshStandardMaterial
                        color={i % 2 === 0 ? '#ff4444' : '#ffaa00'}
                        emissive={i % 2 === 0 ? '#ff0000' : '#ff8800'}
                        emissiveIntensity={0.2}
                    />
                </mesh>
            ))}
        </group>
    )
}
