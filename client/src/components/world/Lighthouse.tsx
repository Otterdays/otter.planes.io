import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// =====================================================
// LIGHTHOUSE - Tall beacon tower with rotating light
// =====================================================

export default function Lighthouse() {
    const lightRef = useRef<THREE.Group>(null)
    const beamRef = useRef<THREE.Mesh>(null)

    useFrame((_, delta) => {
        if (lightRef.current) {
            lightRef.current.rotation.y += delta * 0.5
        }
        if (beamRef.current) {
            // Pulse the light beam
            const intensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.3
            const material = beamRef.current.material as THREE.MeshStandardMaterial
            material.emissiveIntensity = intensity
        }
    })

    return (
        <group position={[-1500, 0, 1500]}>
            {/* Base rock foundation */}
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[10, 12, 4, 8]} />
                <meshStandardMaterial color="#555555" roughness={0.95} flatShading />
            </mesh>

            {/* Main tower - red and white stripes */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh key={i} position={[0, 6 + i * 8, 0]} castShadow>
                    <cylinderGeometry args={[4.5 - i * 0.4, 5 - i * 0.4, 8, 16]} />
                    <meshStandardMaterial
                        color={i % 2 === 0 ? '#cc3333' : '#ffffff'}
                        roughness={0.6}
                    />
                </mesh>
            ))}

            {/* Observation deck platform */}
            <mesh position={[0, 52, 0]} castShadow>
                <cylinderGeometry args={[5, 4.5, 2, 12]} />
                <meshStandardMaterial color="#333333" metalness={0.3} />
            </mesh>

            {/* Railing */}
            {Array.from({ length: 12 }, (_, i) => {
                const angle = (i / 12) * Math.PI * 2
                const x = Math.cos(angle) * 5
                const z = Math.sin(angle) * 5
                return (
                    <mesh key={i} position={[x, 54, z]} castShadow>
                        <cylinderGeometry args={[0.1, 0.1, 2, 6]} />
                        <meshStandardMaterial color="#444444" />
                    </mesh>
                )
            })}

            {/* Light housing (glass dome) */}
            <mesh position={[0, 56, 0]} castShadow>
                <sphereGeometry args={[3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color="#aaddff"
                    transparent
                    opacity={0.4}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Rotating light mechanism */}
            <group ref={lightRef} position={[0, 55, 0]}>
                {/* Central light source */}
                <mesh>
                    <sphereGeometry args={[0.8, 8, 8]} />
                    <meshStandardMaterial
                        color="#ffff88"
                        emissive="#ffff00"
                        emissiveIntensity={2}
                    />
                </mesh>

                {/* Light beams (visual) */}
                <mesh ref={beamRef} position={[8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <coneGeometry args={[0.3, 15, 8]} />
                    <meshStandardMaterial
                        color="#ffff88"
                        emissive="#ffff44"
                        emissiveIntensity={0.8}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
                <mesh position={[-8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <coneGeometry args={[0.3, 15, 8]} />
                    <meshStandardMaterial
                        color="#ffff88"
                        emissive="#ffff44"
                        emissiveIntensity={0.8}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            </group>

            {/* Roof cap */}
            <mesh position={[0, 59, 0]} castShadow>
                <coneGeometry args={[2, 3, 8]} />
                <meshStandardMaterial color="#cc3333" />
            </mesh>

            {/* Door at base */}
            <mesh position={[5, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[1.5, 2.5, 0.2]} />
                <meshStandardMaterial color="#553322" />
            </mesh>

            {/* Windows spiraling up */}
            {[12, 24, 36, 48].map((y, i) => {
                const angle = i * 1.2
                const radius = 5 - i * 0.4
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
                        rotation={[0, -angle, 0]}
                    >
                        <boxGeometry args={[0.1, 1.5, 1]} />
                        <meshStandardMaterial
                            color="#ffeeaa"
                            emissive="#ffcc44"
                            emissiveIntensity={0.3}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}
