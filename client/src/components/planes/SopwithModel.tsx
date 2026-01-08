import type { PlaneColors, ControlInputs } from './types'
import { Propeller, ControlSurface, BlinkingLight } from './shared'

// =====================================================
// SOPWITH CAMEL MODEL (British WWI Fighter)
// Famous for its rotary engine and twin Vickers guns
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function SopwithModel({ colors, inputs }: ModelProps) {
    const propRPM = 10 + inputs.throttle * 45

    return (
        <group>
            {/* Fuselage - fabric-covered tubular frame look */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.38, 0.42, 2.0]} />
                <meshStandardMaterial color={colors.primary} metalness={0.15} roughness={0.85} />
            </mesh>

            {/* Distinctive hump (camel hump housing twin guns) */}
            <mesh position={[0, 0.28, -0.5]}>
                <boxGeometry args={[0.25, 0.14, 0.6]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.3} roughness={0.7} />
            </mesh>

            {/* Twin Vickers machine guns */}
            {[-0.08, 0.08].map((x, i) => (
                <mesh key={i} position={[x, 0.32, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
                </mesh>
            ))}

            {/* Rotary engine cowling (distinctive round nose) */}
            <mesh position={[0, 0, -1.1]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.3, 12]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Open cockpit with coaming */}
            <mesh position={[0, 0.22, 0.3]}>
                <boxGeometry args={[0.32, 0.08, 0.45]} />
                <meshStandardMaterial color={colors.secondary} />
            </mesh>
            {/* Windscreen */}
            <mesh position={[0, 0.32, 0.05]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.25, 0.15, 0.02]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.4} metalness={0.8} />
            </mesh>

            {/* Upper wing - slight dihedral */}
            <group position={[0, 0.55, -0.1]}>
                <mesh position={[-1.6, 0.05, 0]} rotation={[0, 0, -0.04]}>
                    <boxGeometry args={[3, 0.06, 0.65]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
                </mesh>
                <mesh position={[1.6, 0.05, 0]} rotation={[0, 0, 0.04]}>
                    <boxGeometry args={[3, 0.06, 0.65]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
                </mesh>
                {/* Center section cutout for visibility */}
                <mesh position={[0, 0.05, -0.15]}>
                    <boxGeometry args={[0.4, 0.06, 0.35]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
                </mesh>
                {/* Blinking wingtip lights */}
                <BlinkingLight position={[-3.1, 0.08, 0]} color="#ff0000" size={0.04} blinkRate={1.0} />
                <BlinkingLight position={[3.1, 0.08, 0]} color="#00ff00" size={0.04} blinkRate={1.0} />
            </group>

            {/* Lower wing - shorter span */}
            <group position={[0, -0.15, 0]}>
                <mesh>
                    <boxGeometry args={[3.2, 0.06, 0.55]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
                </mesh>
                {/* Ailerons on lower wing only */}
                <ControlSurface position={[-1.4, -0.02, 0.22]} size={[0.5, 0.04, 0.12]} color={colors.primary} deflection={inputs.roll} axis="x" />
                <ControlSurface position={[1.4, -0.02, 0.22]} size={[0.5, 0.04, 0.12]} color={colors.primary} deflection={-inputs.roll} axis="x" />
                {/* Lower wing lights */}
                <BlinkingLight position={[-1.65, -0.02, 0]} color="#ff0000" size={0.035} blinkRate={1.0} />
                <BlinkingLight position={[1.65, -0.02, 0]} color="#00ff00" size={0.035} blinkRate={1.0} />
            </group>

            {/* Interplane struts (N-struts) */}
            {[-1.2, 1.2].map((x, i) => (
                <group key={i} position={[x, 0.2, 0]}>
                    <mesh rotation={[0, 0, x > 0 ? -0.08 : 0.08]}>
                        <boxGeometry args={[0.04, 0.72, 0.04]} />
                        <meshStandardMaterial color={colors.secondary} />
                    </mesh>
                    {/* Diagonal bracing */}
                    <mesh position={[0, 0, 0.15]} rotation={[0.3, 0, x > 0 ? -0.08 : 0.08]}>
                        <boxGeometry args={[0.025, 0.75, 0.025]} />
                        <meshStandardMaterial color={colors.secondary} />
                    </mesh>
                </group>
            ))}

            {/* Flying wires (simplified) */}
            {[-0.6, 0.6].map((x, i) => (
                <mesh key={i} position={[x, 0.2, 0]} rotation={[0, 0, x > 0 ? 0.6 : -0.6]}>
                    <cylinderGeometry args={[0.008, 0.008, 0.8, 4]} />
                    <meshStandardMaterial color="#444444" metalness={0.8} />
                </mesh>
            ))}

            {/* Tail section - tapered */}
            <mesh position={[0, 0.05, 1.15]} rotation={[0.05, 0, 0]}>
                <boxGeometry args={[0.2, 0.22, 0.6]} />
                <meshStandardMaterial color={colors.primary} metalness={0.15} roughness={0.85} />
            </mesh>

            {/* Horizontal stabilizer */}
            <mesh position={[0, 0.12, 1.5]}>
                <boxGeometry args={[1.4, 0.04, 0.38]} />
                <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
            </mesh>
            <ControlSurface position={[0, 0.12, 1.68]} size={[1.0, 0.03, 0.12]} color={colors.primary} deflection={inputs.pitch} axis="x" />

            {/* Vertical stabilizer - distinctive shape */}
            <mesh position={[0, 0.32, 1.45]}>
                <boxGeometry args={[0.04, 0.42, 0.4]} />
                <meshStandardMaterial color={colors.accent} metalness={0.15} roughness={0.85} />
            </mesh>
            <ControlSurface position={[0, 0.32, 1.62]} size={[0.03, 0.36, 0.1]} color={colors.primary} deflection={inputs.yaw} axis="y" />

            {/* Tail light */}
            <BlinkingLight position={[0, 0.55, 1.5]} color="#ffffff" size={0.03} blinkRate={0.7} />

            {/* Propeller */}
            <group position={[0, 0, -1.28]}>
                <Propeller rpm={propRPM} variant="biplane" />
            </group>

            {/* Landing gear - V-strut style */}
            <group position={[0, -0.35, -0.2]}>
                {/* V-struts */}
                <mesh position={[-0.25, -0.12, 0]} rotation={[0, 0, 0.35]}>
                    <boxGeometry args={[0.04, 0.45, 0.04]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                <mesh position={[0.25, -0.12, 0]} rotation={[0, 0, -0.35]}>
                    <boxGeometry args={[0.04, 0.45, 0.04]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                {/* Axle with bungee wrap look */}
                <mesh position={[0, -0.32, 0]}>
                    <boxGeometry args={[0.9, 0.05, 0.05]} />
                    <meshStandardMaterial color="#554433" roughness={0.9} />
                </mesh>
                {/* Wheels - spoked look */}
                {[-0.4, 0.4].map((x, i) => (
                    <group key={i} position={[x, -0.32, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.14, 0.14, 0.05, 16]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
                        </mesh>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.08, 0.08, 0.06, 8]} />
                            <meshStandardMaterial color="#8B4513" roughness={0.8} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Tail skid */}
            <mesh position={[0, -0.22, 1.35]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.03, 0.18, 0.08]} />
                <meshStandardMaterial color={colors.secondary} />
            </mesh>
        </group>
    )
}
