import { useMemo } from 'react'
import * as THREE from 'three'

// =====================================================
// HELIPAD - Helicopter landing pad with parked heli
// =====================================================

export default function Helipad() {
    const padTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')!

        // Gray concrete base
        ctx.fillStyle = '#555555'
        ctx.fillRect(0, 0, 256, 256)

        // Add texture noise
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 256
            const y = Math.random() * 256
            ctx.fillStyle = `rgba(${60 + Math.random() * 30}, ${60 + Math.random() * 30}, ${60 + Math.random() * 30}, 0.3)`
            ctx.fillRect(x, y, 2, 2)
        }

        // White circle outline
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 8
        ctx.beginPath()
        ctx.arc(128, 128, 100, 0, Math.PI * 2)
        ctx.stroke()

        // Big H in center
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 120px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('H', 128, 128)

        const texture = new THREE.CanvasTexture(canvas)
        return texture
    }, [])

    return (
        <group position={[80, 0, 40]}>
            {/* Helipad surface */}
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[12, 32]} />
                <meshStandardMaterial map={padTexture} roughness={0.9} />
            </mesh>

            {/* Edge lights */}
            {Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * Math.PI * 2
                return (
                    <mesh key={i} position={[Math.cos(angle) * 11, 0.15, Math.sin(angle) * 11]}>
                        <sphereGeometry args={[0.2, 8, 8]} />
                        <meshStandardMaterial
                            color="#ffff00"
                            emissive="#ffff00"
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                )
            })}

            {/* Parked helicopter */}
            <Helicopter position={[0, 0, 0]} />

            {/* Wind sock */}
            <group position={[15, 0, 0]}>
                <mesh position={[0, 3, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
                    <meshStandardMaterial color="#888888" />
                </mesh>
                <mesh position={[0.8, 5.5, 0]} rotation={[0, 0, Math.PI / 2 - 0.3]}>
                    <coneGeometry args={[0.4, 2, 8, 1, true]} />
                    <meshStandardMaterial
                        color="#ff6600"
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            </group>
        </group>
    )
}

function Helicopter({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Main body */}
            <mesh position={[0, 1.2, 0]} castShadow>
                <sphereGeometry args={[1.5, 12, 8]} />
                <meshStandardMaterial color="#cc4444" roughness={0.5} />
            </mesh>

            {/* Cockpit (glass) */}
            <mesh position={[0, 1.4, 1.2]}>
                <sphereGeometry args={[1, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color="#88ccff"
                    transparent
                    opacity={0.5}
                    metalness={0.9}
                />
            </mesh>

            {/* Tail boom */}
            <mesh position={[0, 1.2, -2.5]} castShadow>
                <boxGeometry args={[0.4, 0.5, 4]} />
                <meshStandardMaterial color="#cc4444" roughness={0.5} />
            </mesh>

            {/* Tail fin (vertical) */}
            <mesh position={[0, 1.8, -4.2]} castShadow>
                <boxGeometry args={[0.1, 1.2, 0.8]} />
                <meshStandardMaterial color="#cc4444" />
            </mesh>

            {/* Tail fin (horizontal) */}
            <mesh position={[0, 2.3, -4.2]} castShadow>
                <boxGeometry args={[1.5, 0.1, 0.6]} />
                <meshStandardMaterial color="#cc4444" />
            </mesh>

            {/* Tail rotor */}
            <mesh position={[0.2, 1.8, -4.4]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[1.2, 0.1, 0.05]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Main rotor hub */}
            <mesh position={[0, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.25, 0.4, 12]} />
                <meshStandardMaterial color="#333333" metalness={0.7} />
            </mesh>

            {/* Main rotor blades */}
            <mesh position={[0, 2.7, 0]} rotation={[0, 0.3, 0]}>
                <boxGeometry args={[8, 0.05, 0.4]} />
                <meshStandardMaterial color="#222222" />
            </mesh>
            <mesh position={[0, 2.7, 0]} rotation={[0, Math.PI / 2 + 0.3, 0]}>
                <boxGeometry args={[8, 0.05, 0.4]} />
                <meshStandardMaterial color="#222222" />
            </mesh>

            {/* Skids */}
            <mesh position={[-0.8, 0.15, 0]} rotation={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.1, 0.1, 3]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
            <mesh position={[0.8, 0.15, 0]} castShadow>
                <boxGeometry args={[0.1, 0.1, 3]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
            {/* Skid supports */}
            {[[-0.8, 0.5], [0.8, 0.5], [-0.8, -0.5], [0.8, -0.5]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.5, pos[1]]} castShadow>
                    <boxGeometry args={[0.08, 0.7, 0.08]} />
                    <meshStandardMaterial color="#333333" />
                </mesh>
            ))}
        </group>
    )
}
