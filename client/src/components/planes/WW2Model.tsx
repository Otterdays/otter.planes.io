import type { PlaneColors, ControlInputs } from './types'
import { Propeller, ControlSurface, LandingGear } from './shared'

// =====================================================
// WW2 FIGHTER MODEL (P-51 Mustang style)
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function WW2Model({ colors, inputs }: ModelProps) {
    const propRPM = 10 + inputs.throttle * 50

    return (
        <group>
            {/* Main Fuselage */}
            <group>
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.5, 0.45, 2.5]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.18, 0]}>
                    <boxGeometry args={[0.35, 0.12, 2.2]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.6} roughness={0.3} />
                </mesh>
                <mesh position={[0, -0.2, 0]}>
                    <boxGeometry args={[0.4, 0.08, 2.3]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.5} roughness={0.4} />
                </mesh>
                {/* Nose section */}
                <mesh position={[0, 0, -1.4]}>
                    <boxGeometry args={[0.4, 0.38, 0.6]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Engine cowling */}
                <mesh position={[0, 0, -1.65]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.22, 0.28, 0.3, 12]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.7} roughness={0.2} />
                </mesh>
            </group>

            {/* Nose cone (spinner) */}
            <mesh position={[0, 0, -1.85]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.22, 0.4, 12]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
            </mesh>

            {/* Cockpit canopy */}
            <mesh position={[0, 0.22, 0.2]}>
                <sphereGeometry args={[0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color="#87CEEB"
                    transparent
                    opacity={0.5}
                    metalness={0.8}
                    roughness={0.1}
                />
            </mesh>

            {/* Main Wings with animated ailerons */}
            <group position={[0, -0.08, 0.15]}>
                {/* Left wing */}
                <mesh position={[-1.2, 0, 0]} rotation={[0, 0, -0.05]}>
                    <boxGeometry args={[2.2, 0.1, 0.8]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
                </mesh>
                <mesh position={[-2.5, 0.02, 0.05]} rotation={[0, 0.15, -0.08]}>
                    <boxGeometry args={[0.8, 0.08, 0.5]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
                </mesh>
                {/* Right wing */}
                <mesh position={[1.2, 0, 0]} rotation={[0, 0, 0.05]}>
                    <boxGeometry args={[2.2, 0.1, 0.8]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
                </mesh>
                <mesh position={[2.5, 0.02, 0.05]} rotation={[0, -0.15, 0.08]}>
                    <boxGeometry args={[0.8, 0.08, 0.5]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
                </mesh>

                {/* Animated Ailerons */}
                <ControlSurface
                    position={[-2.2, -0.03, 0.25]}
                    size={[0.7, 0.04, 0.2]}
                    color={colors.secondary}
                    deflection={inputs.roll}
                    axis="x"
                />
                <ControlSurface
                    position={[2.2, -0.03, 0.25]}
                    size={[0.7, 0.04, 0.2]}
                    color={colors.secondary}
                    deflection={-inputs.roll}
                    axis="x"
                />

                {/* Navigation Lights */}
                <mesh position={[-2.85, 0.02, 0.1]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
                </mesh>
                <mesh position={[2.85, 0.02, 0.1]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
                </mesh>
            </group>

            {/* Tail section */}
            <mesh position={[0, 0, 1.4]}>
                <boxGeometry args={[0.35, 0.3, 0.7]} />
                <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Horizontal stabilizers with animated elevator */}
            <group position={[0, 0, 1.8]}>
                <mesh position={[-0.5, 0, 0]}>
                    <boxGeometry args={[0.9, 0.04, 0.4]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
                </mesh>
                <mesh position={[0.5, 0, 0]}>
                    <boxGeometry args={[0.9, 0.04, 0.4]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
                </mesh>
                {/* Animated Elevators */}
                <ControlSurface
                    position={[-0.5, 0, 0.18]}
                    size={[0.5, 0.03, 0.1]}
                    color={colors.secondary}
                    deflection={inputs.pitch}
                    axis="x"
                />
                <ControlSurface
                    position={[0.5, 0, 0.18]}
                    size={[0.5, 0.03, 0.1]}
                    color={colors.secondary}
                    deflection={inputs.pitch}
                    axis="x"
                />
            </group>

            {/* Vertical stabilizer with animated rudder */}
            <mesh position={[0, 0.35, 1.75]}>
                <boxGeometry args={[0.06, 0.7, 0.5]} />
                <meshStandardMaterial color={colors.primary} metalness={0.5} roughness={0.4} />
            </mesh>
            <ControlSurface
                position={[0, 0.35, 1.95]}
                size={[0.04, 0.6, 0.15]}
                color={colors.secondary}
                deflection={inputs.yaw}
                axis="y"
            />

            {/* Tail light */}
            <mesh position={[0, 0.65, 1.85]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
            </mesh>

            {/* Propeller */}
            <group position={[0, 0, -2.05]}>
                <Propeller rpm={propRPM} variant="ww2" />
            </group>

            {/* Landing gear */}
            <LandingGear />

            {/* Exhaust pipes */}
            {[-0.28, 0.28].map((x, i) => (
                <group key={i} position={[x, -0.1, -0.8]}>
                    {[0, 0.12, 0.24].map((z, j) => (
                        <mesh key={j} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.025, 0.03, 0.08, 6]} />
                            <meshStandardMaterial
                                color="#2a2a2a"
                                metalness={0.9}
                                emissive="#ff4400"
                                emissiveIntensity={0.2 + inputs.throttle * 0.3}
                            />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    )
}
