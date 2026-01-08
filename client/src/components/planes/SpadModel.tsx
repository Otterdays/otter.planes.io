import type { PlaneColors, ControlInputs } from './types'
import { Propeller, ControlSurface, BlinkingLight } from './shared'

// =====================================================
// SPAD XIII MODEL (French WWI Fighter)
// Clean lines, powerful Hispano-Suiza engine
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function SpadModel({ colors, inputs }: ModelProps) {
    const propRPM = 12 + inputs.throttle * 50

    return (
        <group>
            {/* Fuselage - more streamlined than Sopwith */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.42, 0.45, 2.4]} />
                <meshStandardMaterial color={colors.primary} metalness={0.25} roughness={0.75} />
            </mesh>

            {/* Rounded fuselage top */}
            <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.3, 0.3, 2.2]} />
                <meshStandardMaterial color={colors.primary} metalness={0.25} roughness={0.75} />
            </mesh>

            {/* Hispano-Suiza engine cowling - distinctive */}
            <mesh position={[0, 0.02, -1.35]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.24, 0.26, 0.5, 12]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Radiator shutters on sides */}
            {[-0.26, 0.26].map((x, i) => (
                <mesh key={i} position={[x, 0, -1.2]}>
                    <boxGeometry args={[0.04, 0.25, 0.35]} />
                    <meshStandardMaterial color="#333333" metalness={0.7} />
                </mesh>
            ))}

            {/* Twin Vickers guns */}
            {[-0.1, 0.1].map((x, i) => (
                <mesh key={i} position={[x, 0.28, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.022, 0.022, 0.6, 8]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.15} />
                </mesh>
            ))}

            {/* Cockpit */}
            <mesh position={[0, 0.25, 0.35]}>
                <boxGeometry args={[0.34, 0.12, 0.5]} />
                <meshStandardMaterial color={colors.secondary} />
            </mesh>
            {/* Windscreen - small */}
            <mesh position={[0, 0.35, 0.08]} rotation={[0.35, 0, 0]}>
                <boxGeometry args={[0.22, 0.12, 0.02]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.35} metalness={0.85} />
            </mesh>

            {/* Upper wing - distinctive thin profile */}
            <group position={[0, 0.52, -0.15]}>
                {/* Main spar visible through fabric */}
                <mesh>
                    <boxGeometry args={[5.2, 0.055, 0.58]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Leading edge */}
                <mesh position={[0, 0.015, -0.26]}>
                    <boxGeometry args={[5.2, 0.03, 0.08]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.3} />
                </mesh>
                {/* Blinking lights */}
                <BlinkingLight position={[-2.65, 0.04, 0]} color="#ff0000" size={0.04} blinkRate={1.3} />
                <BlinkingLight position={[2.65, 0.04, 0]} color="#00ff00" size={0.04} blinkRate={1.3} />
            </group>

            {/* Lower wing - equal span */}
            <group position={[0, -0.12, 0]}>
                <mesh>
                    <boxGeometry args={[5.2, 0.055, 0.52]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Ailerons */}
                <ControlSurface position={[-2.1, -0.02, 0.2]} size={[0.6, 0.035, 0.12]} color={colors.primary} deflection={inputs.roll} axis="x" />
                <ControlSurface position={[2.1, -0.02, 0.2]} size={[0.6, 0.035, 0.12]} color={colors.primary} deflection={-inputs.roll} axis="x" />
                {/* Lower lights */}
                <BlinkingLight position={[-2.65, -0.02, 0]} color="#ff0000" size={0.035} blinkRate={1.3} />
                <BlinkingLight position={[2.65, -0.02, 0]} color="#00ff00" size={0.035} blinkRate={1.3} />
            </group>

            {/* Interplane struts - I-struts */}
            {[-1.5, -0.7, 0.7, 1.5].map((x, i) => (
                <mesh key={i} position={[x, 0.2, -0.05]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.035, 0.65, 0.035]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.4} />
                </mesh>
            ))}

            {/* Diagonal bracing wires */}
            {[-1.1, 1.1].map((x, i) => (
                <group key={i}>
                    <mesh position={[x, 0.2, 0]} rotation={[0.2, 0, x > 0 ? 0.5 : -0.5]}>
                        <cylinderGeometry args={[0.006, 0.006, 0.7, 4]} />
                        <meshStandardMaterial color="#555555" metalness={0.85} />
                    </mesh>
                    <mesh position={[x, 0.2, 0]} rotation={[-0.2, 0, x > 0 ? -0.5 : 0.5]}>
                        <cylinderGeometry args={[0.006, 0.006, 0.7, 4]} />
                        <meshStandardMaterial color="#555555" metalness={0.85} />
                    </mesh>
                </group>
            ))}

            {/* Tail - tapered elegantly */}
            <mesh position={[0, 0.08, 1.3]}>
                <boxGeometry args={[0.22, 0.24, 0.65]} />
                <meshStandardMaterial color={colors.primary} metalness={0.25} roughness={0.75} />
            </mesh>

            {/* Horizontal stabilizer - clean lines */}
            <mesh position={[0, 0.15, 1.65]}>
                <boxGeometry args={[1.5, 0.04, 0.4]} />
                <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
            </mesh>
            <ControlSurface position={[0, 0.15, 1.82]} size={[1.1, 0.03, 0.1]} color={colors.primary} deflection={inputs.pitch} axis="x" />

            {/* Vertical stabilizer - large, triangular */}
            <mesh position={[0, 0.38, 1.6]}>
                <boxGeometry args={[0.04, 0.48, 0.45]} />
                <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
            </mesh>
            <ControlSurface position={[0, 0.38, 1.8]} size={[0.03, 0.4, 0.12]} color={colors.primary} deflection={inputs.yaw} axis="y" />

            {/* Tail light */}
            <BlinkingLight position={[0, 0.62, 1.65]} color="#ffffff" size={0.032} blinkRate={0.9} />

            {/* National roundel on fuselage (simplified) */}
            <mesh position={[0.22, 0, 0.5]} rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.15, 16]} />
                <meshStandardMaterial color="#cc0000" />
            </mesh>
            <mesh position={[-0.22, 0, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
                <circleGeometry args={[0.15, 16]} />
                <meshStandardMaterial color="#cc0000" />
            </mesh>

            {/* Propeller */}
            <group position={[0, 0.02, -1.62]}>
                <Propeller rpm={propRPM} variant="biplane" />
            </group>

            {/* Landing gear - streamlined */}
            <group position={[0, -0.38, -0.15]}>
                {/* Main struts */}
                <mesh position={[-0.3, -0.1, 0]} rotation={[0.1, 0, 0.25]}>
                    <boxGeometry args={[0.05, 0.42, 0.05]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.4} />
                </mesh>
                <mesh position={[0.3, -0.1, 0]} rotation={[0.1, 0, -0.25]}>
                    <boxGeometry args={[0.05, 0.42, 0.05]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.4} />
                </mesh>
                {/* Axle fairing */}
                <mesh position={[0, -0.3, 0]}>
                    <boxGeometry args={[0.85, 0.06, 0.08]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.5} />
                </mesh>
                {/* Wheels */}
                {[-0.38, 0.38].map((x, i) => (
                    <group key={i} position={[x, -0.3, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.13, 0.13, 0.055, 16]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
                        </mesh>
                        {/* Hub */}
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.06, 0.06, 0.06, 8]} />
                            <meshStandardMaterial color="#666666" metalness={0.7} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Tail skid */}
            <mesh position={[0, -0.2, 1.45]} rotation={[0.25, 0, 0]}>
                <boxGeometry args={[0.035, 0.16, 0.1]} />
                <meshStandardMaterial color={colors.secondary} />
            </mesh>
        </group>
    )
}
