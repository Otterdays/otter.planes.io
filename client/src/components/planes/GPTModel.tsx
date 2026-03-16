import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlaneColors, ControlInputs } from './types'
import { BlinkingLight, ControlSurface } from './shared'

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

function TokenRing({
    position,
    throttle,
    color,
}: {
    position: [number, number, number]
    throttle: number
    color: string
}) {
    const ringRef = useRef<THREE.Group>(null)

    useFrame(({ clock }, delta) => {
        if (!ringRef.current) return
        ringRef.current.rotation.y += delta * (0.8 + throttle * 1.8)
        ringRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.08
    })

    return (
        <group ref={ringRef} position={position}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.32, 0.035, 10, 24]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.4 + throttle * 0.5}
                />
            </mesh>
            {Array.from({ length: 6 }, (_, index) => {
                const angle = (Math.PI * 2 * index) / 6
                return (
                    <mesh
                        key={index}
                        position={[Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0]}
                    >
                        <boxGeometry args={[0.07, 0.07, 0.07]} />
                        <meshStandardMaterial
                            color="#d7fff5"
                            emissive={color}
                            emissiveIntensity={0.3 + throttle * 0.4}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}

function EngineGlow({
    position,
    throttle,
    color,
}: {
    position: [number, number, number]
    throttle: number
    color: string
}) {
    return (
        <group position={position}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.14, 0.42, 12]} />
                <meshStandardMaterial color="#0a0f10" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0, 0.22]}>
                <circleGeometry args={[0.1, 12]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5 + throttle * 0.9}
                />
            </mesh>
            {throttle > 0.55 && (
                <mesh
                    position={[0, 0, 0.42 + throttle * 0.15]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <coneGeometry args={[0.08, 0.35 + throttle * 0.35, 8]} />
                    <meshBasicMaterial color={color} transparent opacity={0.35 + throttle * 0.3} />
                </mesh>
            )}
        </group>
    )
}

export function GPTModel({ colors: _colors, inputs }: ModelProps) {
    const haloRef = useRef<THREE.Group>(null)

    const gptColors = {
        primary: '#111817',
        secondary: '#10a37f',
        accent: '#d7fff5',
        glow: '#25d9a8',
    }

    useFrame(({ clock }) => {
        if (!haloRef.current) return
        const pulse = 1 + Math.sin(clock.getElapsedTime() * 5) * (0.04 + inputs.throttle * 0.04)
        haloRef.current.scale.setScalar(pulse)
    })

    return (
        <group>
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.34, 2.9, 12, 24]} />
                <meshStandardMaterial
                    color={gptColors.primary}
                    metalness={0.82}
                    roughness={0.18}
                />
            </mesh>

            <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.1, 2.4, 10, 18]} />
                <meshStandardMaterial
                    color={gptColors.secondary}
                    emissive={gptColors.secondary}
                    emissiveIntensity={0.2 + inputs.throttle * 0.3}
                    metalness={0.6}
                    roughness={0.3}
                />
            </mesh>

            <mesh position={[0, -0.12, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.22, 2.0, 8, 12]} />
                <meshStandardMaterial color="#1b2423" metalness={0.45} roughness={0.4} />
            </mesh>

            <group position={[0, 0.23, -0.75]}>
                <mesh>
                    <sphereGeometry args={[0.34, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                    <meshStandardMaterial
                        color="#85f7dd"
                        transparent
                        opacity={0.35}
                        metalness={0.9}
                        roughness={0.08}
                    />
                </mesh>
                <group ref={haloRef}>
                    <TokenRing
                        position={[0, 0.05, 0.02]}
                        throttle={inputs.throttle}
                        color={gptColors.glow}
                    />
                </group>
            </group>

            <mesh position={[0, 0.03, -1.72]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.22, 0.48, 12]} />
                <meshStandardMaterial
                    color={gptColors.accent}
                    metalness={0.7}
                    roughness={0.22}
                />
            </mesh>

            <mesh position={[0, 0.03, -1.48]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.17, 0.025, 8, 20]} />
                <meshStandardMaterial
                    color={gptColors.secondary}
                    emissive={gptColors.secondary}
                    emissiveIntensity={0.35}
                />
            </mesh>

            <group position={[0, -0.05, 0.1]}>
                <mesh position={[-1.45, 0, 0.15]} rotation={[0, 0.2, -0.04]}>
                    <boxGeometry args={[2.5, 0.06, 0.85]} />
                    <meshStandardMaterial
                        color={gptColors.primary}
                        metalness={0.75}
                        roughness={0.24}
                    />
                </mesh>
                <mesh position={[1.45, 0, 0.15]} rotation={[0, -0.2, 0.04]}>
                    <boxGeometry args={[2.5, 0.06, 0.85]} />
                    <meshStandardMaterial
                        color={gptColors.primary}
                        metalness={0.75}
                        roughness={0.24}
                    />
                </mesh>

                <mesh position={[-1.45, 0.035, 0.18]} rotation={[0, 0.2, -0.04]}>
                    <boxGeometry args={[2.2, 0.02, 0.45]} />
                    <meshStandardMaterial
                        color={gptColors.secondary}
                        emissive={gptColors.secondary}
                        emissiveIntensity={0.15 + inputs.throttle * 0.2}
                    />
                </mesh>
                <mesh position={[1.45, 0.035, 0.18]} rotation={[0, -0.2, 0.04]}>
                    <boxGeometry args={[2.2, 0.02, 0.45]} />
                    <meshStandardMaterial
                        color={gptColors.secondary}
                        emissive={gptColors.secondary}
                        emissiveIntensity={0.15 + inputs.throttle * 0.2}
                    />
                </mesh>

                <mesh position={[-0.55, 0.08, -0.75]} rotation={[0, 0.18, 0]}>
                    <boxGeometry args={[0.75, 0.04, 0.24]} />
                    <meshStandardMaterial color={gptColors.accent} metalness={0.55} />
                </mesh>
                <mesh position={[0.55, 0.08, -0.75]} rotation={[0, -0.18, 0]}>
                    <boxGeometry args={[0.75, 0.04, 0.24]} />
                    <meshStandardMaterial color={gptColors.accent} metalness={0.55} />
                </mesh>

                <ControlSurface
                    position={[-2.0, -0.02, 0.38]}
                    size={[0.7, 0.04, 0.18]}
                    color={gptColors.accent}
                    deflection={inputs.roll}
                    axis="x"
                />
                <ControlSurface
                    position={[2.0, -0.02, 0.38]}
                    size={[0.7, 0.04, 0.18]}
                    color={gptColors.accent}
                    deflection={-inputs.roll}
                    axis="x"
                />

                <BlinkingLight position={[-2.7, 0, 0.15]} color="#10a37f" size={0.05} blinkRate={1.4} />
                <BlinkingLight position={[2.7, 0, 0.15]} color="#d7fff5" size={0.05} blinkRate={1.4} />
            </group>

            <group position={[0, 0.02, 1.48]}>
                <mesh position={[0, 0.08, 0]}>
                    <boxGeometry args={[1.75, 0.05, 0.42]} />
                    <meshStandardMaterial color={gptColors.primary} metalness={0.72} />
                </mesh>

                <ControlSurface
                    position={[-0.58, 0.08, 0.18]}
                    size={[0.48, 0.035, 0.12]}
                    color={gptColors.accent}
                    deflection={inputs.pitch}
                    axis="x"
                />
                <ControlSurface
                    position={[0.58, 0.08, 0.18]}
                    size={[0.48, 0.035, 0.12]}
                    color={gptColors.accent}
                    deflection={inputs.pitch}
                    axis="x"
                />

                <mesh position={[-0.34, 0.4, -0.04]} rotation={[0.08, 0, -0.12]}>
                    <boxGeometry args={[0.04, 0.62, 0.34]} />
                    <meshStandardMaterial color={gptColors.primary} metalness={0.72} />
                </mesh>
                <mesh position={[0.34, 0.4, -0.04]} rotation={[0.08, 0, 0.12]}>
                    <boxGeometry args={[0.04, 0.62, 0.34]} />
                    <meshStandardMaterial color={gptColors.primary} metalness={0.72} />
                </mesh>

                <ControlSurface
                    position={[-0.34, 0.4, 0.11]}
                    size={[0.03, 0.4, 0.08]}
                    color={gptColors.secondary}
                    deflection={inputs.yaw}
                    axis="y"
                />
                <ControlSurface
                    position={[0.34, 0.4, 0.11]}
                    size={[0.03, 0.4, 0.08]}
                    color={gptColors.secondary}
                    deflection={inputs.yaw}
                    axis="y"
                />

                <BlinkingLight position={[0, 0.74, 0.06]} color="#ffffff" size={0.035} blinkRate={0.9} />
            </group>

            <group position={[0, -0.14, 1.05]}>
                <EngineGlow
                    position={[-0.24, 0, 0]}
                    throttle={inputs.throttle}
                    color={gptColors.glow}
                />
                <EngineGlow
                    position={[0.24, 0, 0]}
                    throttle={inputs.throttle}
                    color={gptColors.glow}
                />
            </group>

            <group position={[0, -0.4, 0]}>
                <group position={[0, 0, -0.75]}>
                    <mesh position={[0, -0.1, 0]}>
                        <boxGeometry args={[0.03, 0.24, 0.03]} />
                        <meshStandardMaterial color={gptColors.accent} metalness={0.65} />
                    </mesh>
                    <mesh position={[0, -0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
                        <meshStandardMaterial color="#111111" roughness={0.9} />
                    </mesh>
                </group>

                {[-0.35, 0.35].map((x) => (
                    <group key={x} position={[x, 0, 0.28]}>
                        <mesh position={[0, -0.08, 0]}>
                            <boxGeometry args={[0.03, 0.2, 0.03]} />
                            <meshStandardMaterial color={gptColors.accent} metalness={0.65} />
                        </mesh>
                        <mesh position={[0, -0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
                            <meshStandardMaterial color="#111111" roughness={0.9} />
                        </mesh>
                    </group>
                ))}
            </group>

            <mesh position={[0.36, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.12, 16]} />
                <meshStandardMaterial
                    color={gptColors.secondary}
                    emissive={gptColors.secondary}
                    emissiveIntensity={0.3}
                />
            </mesh>
            <mesh position={[-0.36, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <circleGeometry args={[0.12, 16]} />
                <meshStandardMaterial
                    color={gptColors.secondary}
                    emissive={gptColors.secondary}
                    emissiveIntensity={0.3}
                />
            </mesh>
        </group>
    )
}
