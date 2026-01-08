import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlaneColors, ControlInputs } from './types'
import { Propeller, ControlSurface, BlinkingLight } from './shared'

// =====================================================
// OTTER PLANE MODEL (Funky mascot plane!)
// A whimsical otter-shaped aircraft with webbed paws
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function OtterModel({ colors, inputs }: ModelProps) {
    const propRPM = 12 + inputs.throttle * 45
    const tailWagRef = useRef<THREE.Group>(null)

    // Animated tail wag based on speed
    useFrame(({ clock }) => {
        if (tailWagRef.current) {
            const wag = Math.sin(clock.getElapsedTime() * 3) * 0.15 * inputs.throttle
            tailWagRef.current.rotation.y = wag
        }
    })

    return (
        <group>
            {/* === OTTER HEAD (Nose) - Streamlined otter face === */}
            <group position={[0, 0.05, -1.6]}>
                {/* Main head - flatter, wider otter shape */}
                <mesh scale={[1.1, 0.85, 1]}>
                    <sphereGeometry args={[0.4, 16, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>

                {/* Forehead - slight bump */}
                <mesh position={[0, 0.15, -0.15]} scale={[1.2, 0.6, 0.8]}>
                    <sphereGeometry args={[0.25, 12, 10]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>

                {/* Snout/muzzle - LONG and flat like an otter */}
                <mesh position={[0, -0.08, -0.45]} scale={[0.9, 0.65, 1.3]}>
                    <sphereGeometry args={[0.22, 12, 10]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.1} roughness={0.9} />
                </mesh>

                {/* Snout bridge - elongated */}
                <mesh position={[0, 0, -0.35]} rotation={[-0.2, 0, 0]} scale={[0.7, 0.5, 1]}>
                    <capsuleGeometry args={[0.12, 0.25, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>

                {/* Whisker pads - puffy cheeks (otter signature!) */}
                <mesh position={[-0.15, -0.08, -0.5]}>
                    <sphereGeometry args={[0.1, 10, 10]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.1} roughness={0.9} />
                </mesh>
                <mesh position={[0.15, -0.08, -0.5]}>
                    <sphereGeometry args={[0.1, 10, 10]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.1} roughness={0.9} />
                </mesh>

                {/* Nose - wide and flat like otter */}
                <mesh position={[0, -0.02, -0.68]} scale={[1.2, 0.8, 1]}>
                    <sphereGeometry args={[0.07, 10, 10]} />
                    <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Eyes - smaller, more to the sides (otter-like) */}
                <mesh position={[-0.22, 0.08, -0.2]}>
                    <sphereGeometry args={[0.08, 10, 10]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0.22, 0.08, -0.2]}>
                    <sphereGeometry args={[0.08, 10, 10]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Eye shine */}
                <mesh position={[-0.24, 0.1, -0.25]}>
                    <sphereGeometry args={[0.025, 6, 6]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[0.2, 0.1, -0.25]}>
                    <sphereGeometry args={[0.025, 6, 6]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
                </mesh>

                {/* Ears - TINY and on the SIDES (otter signature - not on top like bear!) */}
                <mesh position={[-0.38, 0.1, 0.05]}>
                    <sphereGeometry args={[0.07, 8, 8]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                <mesh position={[0.38, 0.1, 0.05]}>
                    <sphereGeometry args={[0.07, 8, 8]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Inner ear - tiny pink */}
                <mesh position={[-0.4, 0.1, 0.02]}>
                    <sphereGeometry args={[0.035, 6, 6]} />
                    <meshStandardMaterial color="#cc9988" />
                </mesh>
                <mesh position={[0.4, 0.1, 0.02]}>
                    <sphereGeometry args={[0.035, 6, 6]} />
                    <meshStandardMaterial color="#cc9988" />
                </mesh>

                {/* Whiskers - coming from the puffy cheeks */}
                {[-1, 0, 1].map((y, i) => (
                    <group key={`whisker-${i}`}>
                        <mesh position={[-0.22, -0.06 + y * 0.04, -0.55]} rotation={[0, 0.4, y * 0.15]}>
                            <cylinderGeometry args={[0.004, 0.001, 0.3, 4]} />
                            <meshStandardMaterial color="#444444" />
                        </mesh>
                        <mesh position={[0.22, -0.06 + y * 0.04, -0.55]} rotation={[0, -0.4, -y * 0.15]}>
                            <cylinderGeometry args={[0.004, 0.001, 0.3, 4]} />
                            <meshStandardMaterial color="#444444" />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* === FUSELAGE (Otter Body) === */}
            <group>
                {/* Main body - plump and streamlined */}
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <capsuleGeometry args={[0.4, 2.2, 8, 16]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>

                {/* Belly - lighter colored */}
                <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <capsuleGeometry args={[0.32, 2.0, 8, 16]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
                </mesh>

                {/* Center mast/antenna */}
                <mesh position={[0, 0.25, 0.1]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Cockpit bubble on back */}
                <mesh position={[0, 0.38, 0]}>
                    <sphereGeometry args={[0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial
                        color="#88ccee"
                        transparent
                        opacity={0.6}
                        metalness={0.8}
                        roughness={0.1}
                    />
                </mesh>
            </group>

            {/* === WINGS (Webbed paw-shaped!) === */}
            <group position={[0, 0, 0.2]}>
                {/* Left wing - webbed paw shape */}
                <group position={[-1.5, -0.05, 0]}>
                    {/* Main wing surface */}
                    <mesh rotation={[0, 0, -0.08]}>
                        <boxGeometry args={[2.6, 0.08, 0.75]} />
                        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
                    </mesh>
                    {/* Paw pads (4 toes) */}
                    {[-0.25, 0, 0.25].map((z, i) => (
                        <mesh key={i} position={[-1.2, -0.02, z - 0.05]}>
                            <sphereGeometry args={[0.12, 8, 8]} />
                            <meshStandardMaterial color="#4a3520" metalness={0.3} roughness={0.8} />
                        </mesh>
                    ))}
                    {/* Webbing between toes */}
                    <mesh position={[-1.1, -0.03, 0]} rotation={[0, 0, -0.1]}>
                        <boxGeometry args={[0.3, 0.04, 0.5]} />
                        <meshStandardMaterial color="#6b5030" transparent opacity={0.7} />
                    </mesh>
                    {/* Fish decoration! */}
                    <group position={[-0.5, 0.08, 0]} rotation={[0, 0.3, 0]}>
                        <mesh>
                            <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
                            <meshStandardMaterial color="#88aacc" metalness={0.6} />
                        </mesh>
                        {/* Fish tail */}
                        <mesh position={[0, 0, 0.18]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.12, 0.02, 0.08]} />
                            <meshStandardMaterial color="#88aacc" metalness={0.6} />
                        </mesh>
                    </group>
                </group>

                {/* Right wing - webbed paw shape */}
                <group position={[1.5, -0.05, 0]}>
                    <mesh rotation={[0, 0, 0.08]}>
                        <boxGeometry args={[2.6, 0.08, 0.75]} />
                        <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
                    </mesh>
                    {/* Paw pads */}
                    {[-0.25, 0, 0.25].map((z, i) => (
                        <mesh key={i} position={[1.2, -0.02, z - 0.05]}>
                            <sphereGeometry args={[0.12, 8, 8]} />
                            <meshStandardMaterial color="#4a3520" metalness={0.3} roughness={0.8} />
                        </mesh>
                    ))}
                    {/* Webbing */}
                    <mesh position={[1.1, -0.03, 0]} rotation={[0, 0, 0.1]}>
                        <boxGeometry args={[0.3, 0.04, 0.5]} />
                        <meshStandardMaterial color="#6b5030" transparent opacity={0.7} />
                    </mesh>
                    {/* Fish decoration */}
                    <group position={[0.5, 0.08, 0]} rotation={[0, -0.3, 0]}>
                        <mesh>
                            <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
                            <meshStandardMaterial color="#cc8866" metalness={0.6} />
                        </mesh>
                        <mesh position={[0, 0, 0.18]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.12, 0.02, 0.08]} />
                            <meshStandardMaterial color="#cc8866" metalness={0.6} />
                        </mesh>
                    </group>
                </group>

                {/* Animated ailerons */}
                <ControlSurface position={[-2.2, -0.08, 0.25]} size={[0.6, 0.04, 0.15]} color={colors.secondary} deflection={inputs.roll} axis="x" />
                <ControlSurface position={[2.2, -0.08, 0.25]} size={[0.6, 0.04, 0.15]} color={colors.secondary} deflection={-inputs.roll} axis="x" />

                {/* Wing tip lights */}
                <BlinkingLight position={[-2.8, 0, 0]} color="#ff0000" size={0.05} blinkRate={1.5} />
                <BlinkingLight position={[2.8, 0, 0]} color="#00ff00" size={0.05} blinkRate={1.5} />
            </group>

            {/* === OTTER TAIL (Vertical & Horizontal Stabilizers) === */}
            <group ref={tailWagRef} position={[0, 0.05, 1.8]}>
                {/* Thick otter tail as vertical stabilizer */}
                <mesh position={[0, 0.2, 0]} rotation={[-0.1, 0, 0]}>
                    <capsuleGeometry args={[0.15, 0.7, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Tail tip - darker */}
                <mesh position={[0, 0.55, 0.1]}>
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.25} roughness={0.75} />
                </mesh>

                {/* Rudder integrated into tail */}
                <ControlSurface position={[0, 0.25, 0.25]} size={[0.04, 0.5, 0.12]} color={colors.secondary} deflection={inputs.yaw} axis="y" />

                {/* Tail light */}
                <BlinkingLight position={[0, 0.7, 0.15]} color="#ffffff" size={0.04} blinkRate={0.8} />
            </group>

            {/* Horizontal stabilizers (small flippers) */}
            <group position={[0, -0.05, 1.6]}>
                <mesh position={[-0.5, 0, 0]} rotation={[0, 0.1, 0]}>
                    <boxGeometry args={[0.8, 0.05, 0.35]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
                </mesh>
                <mesh position={[0.5, 0, 0]} rotation={[0, -0.1, 0]}>
                    <boxGeometry args={[0.8, 0.05, 0.35]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
                </mesh>
                {/* Elevators */}
                <ControlSurface position={[-0.5, 0, 0.15]} size={[0.5, 0.03, 0.1]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
                <ControlSurface position={[0.5, 0, 0.15]} size={[0.5, 0.03, 0.1]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
            </group>

            {/* === PROPELLER (with fish-shaped hub cap) === */}
            <group position={[0, 0, -2.1]}>
                <Propeller rpm={propRPM} variant="biplane" />
                {/* Fish-shaped spinner */}
                <mesh position={[0, 0, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.1, 0.25, 8]} />
                    <meshStandardMaterial color="#88aacc" metalness={0.7} roughness={0.3} />
                </mesh>
            </group>

            {/* === LANDING GEAR (Webbed feet!) === */}
            <group position={[0, -0.5, -0.3]}>
                {/* Front foot */}
                <group position={[0, 0, -0.4]}>
                    <mesh position={[0, -0.1, 0]}>
                        <boxGeometry args={[0.04, 0.25, 0.04]} />
                        <meshStandardMaterial color={colors.secondary} metalness={0.6} />
                    </mesh>
                    {/* Webbed foot pad */}
                    <mesh position={[0, -0.22, 0.05]}>
                        <boxGeometry args={[0.2, 0.04, 0.25]} />
                        <meshStandardMaterial color="#4a3520" metalness={0.3} roughness={0.8} />
                    </mesh>
                    {/* Toes */}
                    {[-0.06, 0, 0.06].map((x, i) => (
                        <mesh key={i} position={[x, -0.22, -0.08]}>
                            <sphereGeometry args={[0.04, 6, 6]} />
                            <meshStandardMaterial color="#4a3520" />
                        </mesh>
                    ))}
                </group>

                {/* Rear feet (main gear) */}
                {[-0.4, 0.4].map((x, i) => (
                    <group key={i} position={[x, 0, 0.4]}>
                        <mesh position={[0, -0.08, 0]}>
                            <boxGeometry args={[0.04, 0.2, 0.04]} />
                            <meshStandardMaterial color={colors.secondary} metalness={0.6} />
                        </mesh>
                        {/* Webbed foot */}
                        <mesh position={[0, -0.18, 0.05]}>
                            <boxGeometry args={[0.22, 0.04, 0.28]} />
                            <meshStandardMaterial color="#4a3520" metalness={0.3} roughness={0.8} />
                        </mesh>
                        {/* Toes */}
                        {[-0.07, 0, 0.07].map((dx, j) => (
                            <mesh key={j} position={[dx, -0.18, -0.1]}>
                                <sphereGeometry args={[0.045, 6, 6]} />
                                <meshStandardMaterial color="#4a3520" />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>

            {/* === SPLASH EFFECT (water droplets when at high throttle) === */}
            {inputs.throttle > 0.7 && (
                <group position={[0, 0, 2]}>
                    {[...Array(5)].map((_, i) => (
                        <mesh
                            key={i}
                            position={[
                                (Math.random() - 0.5) * 0.4,
                                (Math.random() - 0.5) * 0.3,
                                Math.random() * 0.3
                            ]}
                        >
                            <sphereGeometry args={[0.03 + Math.random() * 0.02, 6, 6]} />
                            <meshStandardMaterial
                                color="#aaddff"
                                transparent
                                opacity={0.4 + inputs.throttle * 0.3}
                            />
                        </mesh>
                    ))}
                </group>
            )}
        </group>
    )
}
