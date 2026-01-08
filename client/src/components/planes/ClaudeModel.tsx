import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlaneColors, ControlInputs } from './types'
import { ControlSurface, BlinkingLight } from './shared'

// =====================================================
// CLAUDE / ANTHROPIC PLANE MODEL
// Inspired by Claude Opus 4.5 - Thoughtful, Safe, Helpful
// 
// Design Philosophy:
// - Clean, elegant futuristic design
// - Coral/salmon Anthropic colors with cream accents
// - "Thinking" animated elements (neural glow, thought orbs)
// - Smooth, flowing lines representing helpfulness
// - Safety emphasis (extra stabilizers, redundant systems look)
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

// Animated thinking orb component
function ThinkingOrb({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame(({ clock }) => {
        if (meshRef.current) {
            const t = clock.getElapsedTime() + delay
            // Gentle floating animation
            meshRef.current.position.y = position[1] + Math.sin(t * 2) * 0.03
            // Pulsing glow
            const scale = 1 + Math.sin(t * 3) * 0.15
            meshRef.current.scale.setScalar(scale)
        }
    })

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
                color="#D97757"
                emissive="#D97757"
                emissiveIntensity={0.6}
                transparent
                opacity={0.8}
            />
        </mesh>
    )
}

// Neural network connection lines - using a simple mesh approach
function NeuralConnection({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    // Calculate midpoint and direction
    const midX = (start[0] + end[0]) / 2
    const midY = (start[1] + end[1]) / 2
    const midZ = (start[2] + end[2]) / 2

    const dx = end[0] - start[0]
    const dy = end[1] - start[1]
    const dz = end[2] - start[2]
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Calculate rotation to point from start to end
    const rotY = Math.atan2(dx, dz)
    const rotX = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))

    return (
        <mesh position={[midX, midY, midZ]} rotation={[rotX, rotY, 0]}>
            <cylinderGeometry args={[0.008, 0.008, length, 4]} />
            <meshStandardMaterial
                color="#D97757"
                transparent
                opacity={0.5}
                emissive="#D97757"
                emissiveIntensity={0.2}
            />
        </mesh>
    )
}

export function ClaudeModel({ colors: _colors, inputs }: ModelProps) {
    const brainGlowRef = useRef<THREE.Mesh>(null)

    // Anthropic brand colors (overriding passed colors for authenticity)
    const claudeColors = {
        primary: '#1a1a2e',      // Deep navy/black
        secondary: '#D97757',    // Anthropic coral
        accent: '#f5e6d3',       // Cream
        glow: '#D97757'          // Coral glow
    }

    // Animated brain glow based on "thinking" (throttle = thinking intensity)
    useFrame(({ clock }) => {
        if (brainGlowRef.current) {
            const t = clock.getElapsedTime()
            const thinkingIntensity = 0.3 + inputs.throttle * 0.7
            const pulse = Math.sin(t * 4) * 0.2 + 0.8
            brainGlowRef.current.scale.setScalar(pulse * thinkingIntensity)
        }
    })

    return (
        <group>
            {/* === MAIN FUSELAGE - Sleek, flowing design === */}
            {/* Central body - smooth capsule shape */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.35, 2.8, 12, 24]} />
                <meshStandardMaterial
                    color={claudeColors.primary}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Coral accent stripe running along fuselage */}
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.12, 2.6, 8, 16]} />
                <meshStandardMaterial
                    color={claudeColors.secondary}
                    metalness={0.6}
                    roughness={0.3}
                    emissive={claudeColors.secondary}
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* === "BRAIN" COCKPIT - The thinking center === */}
            <group position={[0, 0.2, -1.0]}>
                {/* Main dome - transparent thinking chamber */}
                <mesh>
                    <sphereGeometry args={[0.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                    <meshStandardMaterial
                        color="#88ccff"
                        transparent
                        opacity={0.4}
                        metalness={0.9}
                        roughness={0.1}
                    />
                </mesh>

                {/* Inner "brain" glow - pulses with throttle */}
                <mesh ref={brainGlowRef} position={[0, 0.1, 0]}>
                    <sphereGeometry args={[0.25, 16, 12]} />
                    <meshStandardMaterial
                        color={claudeColors.secondary}
                        emissive={claudeColors.secondary}
                        emissiveIntensity={0.8 + inputs.throttle * 0.4}
                        transparent
                        opacity={0.6}
                    />
                </mesh>

                {/* Floating thought orbs - more active with higher throttle */}
                <ThinkingOrb position={[-0.15, 0.2, -0.1]} delay={0} />
                <ThinkingOrb position={[0.15, 0.25, -0.05]} delay={0.5} />
                <ThinkingOrb position={[0, 0.3, 0.1]} delay={1.0} />

                {/* Neural connections (simplified) */}
                <NeuralConnection start={[-0.15, 0.2, -0.1]} end={[0, 0.1, 0]} />
                <NeuralConnection start={[0.15, 0.25, -0.05]} end={[0, 0.1, 0]} />
                <NeuralConnection start={[0, 0.3, 0.1]} end={[0, 0.1, 0]} />
            </group>

            {/* === FORWARD NOSE - Sleek sensor array === */}
            <mesh position={[0, 0.05, -1.7]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.25, 0.5, 12]} />
                <meshStandardMaterial
                    color={claudeColors.accent}
                    metalness={0.7}
                    roughness={0.3}
                />
            </mesh>

            {/* Sensor ring */}
            <mesh position={[0, 0.05, -1.45]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.2, 0.03, 8, 24]} />
                <meshStandardMaterial
                    color={claudeColors.secondary}
                    emissive={claudeColors.secondary}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* === WINGS - Elegant swept design with safety redundancy === */}
            <group position={[0, -0.05, 0.2]}>
                {/* Left main wing */}
                <mesh position={[-1.4, 0, 0.1]} rotation={[0, 0.15, -0.04]}>
                    <boxGeometry args={[2.5, 0.06, 0.8]} />
                    <meshStandardMaterial
                        color={claudeColors.primary}
                        metalness={0.75}
                        roughness={0.25}
                    />
                </mesh>

                {/* Left wing coral accent */}
                <mesh position={[-1.4, 0.04, 0.1]} rotation={[0, 0.15, -0.04]}>
                    <boxGeometry args={[2.3, 0.02, 0.5]} />
                    <meshStandardMaterial
                        color={claudeColors.secondary}
                        emissive={claudeColors.secondary}
                        emissiveIntensity={0.1}
                    />
                </mesh>

                {/* Right main wing */}
                <mesh position={[1.4, 0, 0.1]} rotation={[0, -0.15, 0.04]}>
                    <boxGeometry args={[2.5, 0.06, 0.8]} />
                    <meshStandardMaterial
                        color={claudeColors.primary}
                        metalness={0.75}
                        roughness={0.25}
                    />
                </mesh>

                {/* Right wing coral accent */}
                <mesh position={[1.4, 0.04, 0.1]} rotation={[0, -0.15, 0.04]}>
                    <boxGeometry args={[2.3, 0.02, 0.5]} />
                    <meshStandardMaterial
                        color={claudeColors.secondary}
                        emissive={claudeColors.secondary}
                        emissiveIntensity={0.1}
                    />
                </mesh>

                {/* Canard wings (forward - for safety/stability emphasis) */}
                <mesh position={[-0.5, 0.1, -0.9]} rotation={[0, 0.1, 0]}>
                    <boxGeometry args={[0.8, 0.04, 0.25]} />
                    <meshStandardMaterial color={claudeColors.accent} metalness={0.6} />
                </mesh>
                <mesh position={[0.5, 0.1, -0.9]} rotation={[0, -0.1, 0]}>
                    <boxGeometry args={[0.8, 0.04, 0.25]} />
                    <meshStandardMaterial color={claudeColors.accent} metalness={0.6} />
                </mesh>

                {/* Winglets (safety emphasis - extra stability) */}
                <mesh position={[-2.6, 0.2, 0.15]} rotation={[0.1, 0, -0.4]}>
                    <boxGeometry args={[0.06, 0.4, 0.25]} />
                    <meshStandardMaterial color={claudeColors.secondary} />
                </mesh>
                <mesh position={[2.6, 0.2, 0.15]} rotation={[0.1, 0, 0.4]}>
                    <boxGeometry args={[0.06, 0.4, 0.25]} />
                    <meshStandardMaterial color={claudeColors.secondary} />
                </mesh>

                {/* Ailerons */}
                <ControlSurface
                    position={[-2.0, -0.02, 0.35]}
                    size={[0.7, 0.04, 0.18]}
                    color={claudeColors.accent}
                    deflection={inputs.roll}
                    axis="x"
                />
                <ControlSurface
                    position={[2.0, -0.02, 0.35]}
                    size={[0.7, 0.04, 0.18]}
                    color={claudeColors.accent}
                    deflection={-inputs.roll}
                    axis="x"
                />

                {/* Wing tip lights - coral themed */}
                <BlinkingLight position={[-2.7, 0, 0.1]} color="#D97757" size={0.05} blinkRate={1.2} />
                <BlinkingLight position={[2.7, 0, 0.1]} color="#D97757" size={0.05} blinkRate={1.2} />
            </group>

            {/* === TAIL SECTION - Twin vertical stabilizers for safety === */}
            <group position={[0, 0, 1.5]}>
                {/* Horizontal stabilizer */}
                <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[1.8, 0.05, 0.4]} />
                    <meshStandardMaterial color={claudeColors.primary} metalness={0.7} />
                </mesh>

                {/* Elevators */}
                <ControlSurface
                    position={[-0.6, 0.1, 0.18]}
                    size={[0.5, 0.04, 0.12]}
                    color={claudeColors.accent}
                    deflection={inputs.pitch}
                    axis="x"
                />
                <ControlSurface
                    position={[0.6, 0.1, 0.18]}
                    size={[0.5, 0.04, 0.12]}
                    color={claudeColors.accent}
                    deflection={inputs.pitch}
                    axis="x"
                />

                {/* Twin vertical stabilizers (safety redundancy visual) */}
                <mesh position={[-0.35, 0.4, -0.05]} rotation={[0.08, 0, -0.1]}>
                    <boxGeometry args={[0.04, 0.6, 0.35]} />
                    <meshStandardMaterial color={claudeColors.primary} metalness={0.7} />
                </mesh>
                <mesh position={[0.35, 0.4, -0.05]} rotation={[0.08, 0, 0.1]}>
                    <boxGeometry args={[0.04, 0.6, 0.35]} />
                    <meshStandardMaterial color={claudeColors.primary} metalness={0.7} />
                </mesh>

                {/* Coral accent on tails */}
                <mesh position={[-0.38, 0.55, 0]}>
                    <boxGeometry args={[0.02, 0.25, 0.2]} />
                    <meshStandardMaterial
                        color={claudeColors.secondary}
                        emissive={claudeColors.secondary}
                        emissiveIntensity={0.2}
                    />
                </mesh>
                <mesh position={[0.38, 0.55, 0]}>
                    <boxGeometry args={[0.02, 0.25, 0.2]} />
                    <meshStandardMaterial
                        color={claudeColors.secondary}
                        emissive={claudeColors.secondary}
                        emissiveIntensity={0.2}
                    />
                </mesh>

                {/* Rudders */}
                <ControlSurface
                    position={[-0.35, 0.4, 0.12]}
                    size={[0.03, 0.4, 0.08]}
                    color={claudeColors.accent}
                    deflection={inputs.yaw}
                    axis="y"
                />
                <ControlSurface
                    position={[0.35, 0.4, 0.12]}
                    size={[0.03, 0.4, 0.08]}
                    color={claudeColors.accent}
                    deflection={inputs.yaw}
                    axis="y"
                />

                {/* Tail light */}
                <BlinkingLight position={[0, 0.75, 0.1]} color="#ffffff" size={0.04} blinkRate={0.8} />
            </group>

            {/* === ENGINE SECTION - Clean, efficient dual engines === */}
            <group position={[0, -0.15, 1.2]}>
                {/* Left engine nacelle */}
                <mesh position={[-0.25, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.12, 0.15, 0.5, 12]} />
                    <meshStandardMaterial color={claudeColors.primary} metalness={0.85} />
                </mesh>

                {/* Left engine glow */}
                <mesh position={[-0.25, 0, 0.3]}>
                    <circleGeometry args={[0.1, 12]} />
                    <meshStandardMaterial
                        color={claudeColors.secondary}
                        emissive={claudeColors.secondary}
                        emissiveIntensity={inputs.throttle * 0.8}
                    />
                </mesh>

                {/* Right engine nacelle */}
                <mesh position={[0.25, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.12, 0.15, 0.5, 12]} />
                    <meshStandardMaterial color={claudeColors.primary} metalness={0.85} />
                </mesh>

                {/* Right engine glow */}
                <mesh position={[0.25, 0, 0.3]}>
                    <circleGeometry args={[0.1, 12]} />
                    <meshStandardMaterial
                        color={claudeColors.secondary}
                        emissive={claudeColors.secondary}
                        emissiveIntensity={inputs.throttle * 0.8}
                    />
                </mesh>

                {/* Thrust visualization at high throttle */}
                {inputs.throttle > 0.5 && (
                    <>
                        <mesh position={[-0.25, 0, 0.4 + inputs.throttle * 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <coneGeometry args={[0.08, 0.3 + inputs.throttle * 0.3, 8]} />
                            <meshBasicMaterial
                                color={claudeColors.secondary}
                                transparent
                                opacity={0.4 + inputs.throttle * 0.3}
                            />
                        </mesh>
                        <mesh position={[0.25, 0, 0.4 + inputs.throttle * 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <coneGeometry args={[0.08, 0.3 + inputs.throttle * 0.3, 8]} />
                            <meshBasicMaterial
                                color={claudeColors.secondary}
                                transparent
                                opacity={0.4 + inputs.throttle * 0.3}
                            />
                        </mesh>
                    </>
                )}
            </group>

            {/* === LANDING GEAR - Retractable style === */}
            <group position={[0, -0.4, 0]}>
                {/* Front gear */}
                <group position={[0, 0, -0.8]}>
                    <mesh position={[0, -0.1, 0]}>
                        <boxGeometry args={[0.03, 0.25, 0.03]} />
                        <meshStandardMaterial color={claudeColors.accent} metalness={0.6} />
                    </mesh>
                    <mesh position={[0, -0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                    </mesh>
                </group>

                {/* Rear gear */}
                {[-0.35, 0.35].map((x, i) => (
                    <group key={i} position={[x, 0, 0.3]}>
                        <mesh position={[0, -0.08, 0]}>
                            <boxGeometry args={[0.03, 0.2, 0.03]} />
                            <meshStandardMaterial color={claudeColors.accent} metalness={0.6} />
                        </mesh>
                        <mesh position={[0, -0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* === ANTHROPIC LOGO BADGE (simplified) === */}
            <mesh position={[0.36, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.12, 16]} />
                <meshStandardMaterial
                    color={claudeColors.secondary}
                    emissive={claudeColors.secondary}
                    emissiveIntensity={0.3}
                />
            </mesh>
            <mesh position={[-0.36, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <circleGeometry args={[0.12, 16]} />
                <meshStandardMaterial
                    color={claudeColors.secondary}
                    emissive={claudeColors.secondary}
                    emissiveIntensity={0.3}
                />
            </mesh>
        </group>
    )
}
