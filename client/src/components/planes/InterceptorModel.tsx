import type { PlaneColors, ControlInputs } from './types'
import { ControlSurface, LandingGear } from './shared'

// =====================================================
// INTERCEPTOR MODEL (MiG-21 style delta wing)
// Dimensions: Length 17m, Wingspan 8.2m, Height 4.7m
// Fast, agile, single engine with prominent intake
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function InterceptorModel({ colors, inputs }: ModelProps) {
    const length = 3.5
    const wingspan = 1.7
    const fuselageRadius = 0.28

    return (
        <group>
            {/* Cylindrical fuselage - MiG style */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[fuselageRadius, fuselageRadius * 0.9, length * 0.6, 12]} />
                <meshStandardMaterial color={colors.primary} metalness={0.75} roughness={0.25} />
            </mesh>

            {/* Forward fuselage taper */}
            <mesh position={[0, 0, -length * 0.35]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[fuselageRadius * 0.85, fuselageRadius * 0.5, length * 0.25, 12]} />
                <meshStandardMaterial color={colors.primary} metalness={0.75} roughness={0.25} />
            </mesh>

            {/* Nose cone - pitot tube */}
            <mesh position={[0, 0, -length * 0.52]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[fuselageRadius * 0.45, 0.35, 10]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Pitot probe */}
            <mesh position={[0, 0, -length * 0.58]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
                <meshStandardMaterial color="#333333" metalness={0.9} />
            </mesh>

            {/* Cockpit canopy - teardrop */}
            <group position={[0, fuselageRadius * 0.7, -length * 0.15]}>
                <mesh rotation={[0.15, 0, 0]}>
                    <sphereGeometry args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                    <meshStandardMaterial color="#1a2535" transparent opacity={0.7} metalness={0.92} roughness={0.08} />
                </mesh>
            </group>

            {/* Prominent chin intake (MiG-21 style) */}
            <mesh position={[0, -fuselageRadius * 0.6, -length * 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.18, 0.22, 0.35, 12]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.8} />
            </mesh>
            {/* Intake cone (shock cone) */}
            <mesh position={[0, -fuselageRadius * 0.6, -length * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.08, 0.25, 8]} />
                <meshStandardMaterial color="#222222" metalness={0.95} />
            </mesh>

            {/* Delta wings - 57° sweep angle */}
            <group position={[0, -0.05, 0.15]}>
                {/* Left wing - thin delta profile */}
                <mesh position={[-wingspan * 0.4, 0, 0.15]} rotation={[0, 0.55, -0.02]}>
                    <boxGeometry args={[wingspan * 0.7, 0.045, 0.9]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Right wing */}
                <mesh position={[wingspan * 0.4, 0, 0.15]} rotation={[0, -0.55, 0.02]}>
                    <boxGeometry args={[wingspan * 0.7, 0.045, 0.9]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
                </mesh>

                {/* Ailerons */}
                <ControlSurface position={[-wingspan * 0.55, -0.02, 0.35]} size={[0.35, 0.025, 0.18]} color={colors.secondary} deflection={inputs.roll} axis="x" />
                <ControlSurface position={[wingspan * 0.55, -0.02, 0.35]} size={[0.35, 0.025, 0.18]} color={colors.secondary} deflection={-inputs.roll} axis="x" />

                {/* Wing pylons */}
                {[-0.5, 0.5].map((x, i) => (
                    <mesh key={i} position={[x, -0.06, 0.1]}>
                        <boxGeometry args={[0.03, 0.08, 0.2]} />
                        <meshStandardMaterial color={colors.secondary} metalness={0.8} />
                    </mesh>
                ))}

                {/* Nav lights */}
                <mesh position={[-wingspan * 0.72, 0, 0.25]}>
                    <sphereGeometry args={[0.035, 6, 6]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.85} />
                </mesh>
                <mesh position={[wingspan * 0.72, 0, 0.25]}>
                    <sphereGeometry args={[0.035, 6, 6]} />
                    <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.85} />
                </mesh>
            </group>

            {/* Single large vertical stabilizer */}
            <mesh position={[0, fuselageRadius + 0.25, length * 0.3]} rotation={[0.08, 0, 0]}>
                <boxGeometry args={[0.04, 0.55, 0.5]} />
                <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Rudder */}
            <ControlSurface position={[0, fuselageRadius + 0.25, length * 0.42]} size={[0.03, 0.35, 0.12]} color={colors.secondary} deflection={inputs.yaw} axis="y" />

            {/* Ventral fin */}
            <mesh position={[0, -fuselageRadius - 0.12, length * 0.28]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.03, 0.2, 0.35]} />
                <meshStandardMaterial color={colors.primary} metalness={0.7} />
            </mesh>

            {/* All-moving horizontal stabilizers (tailerons) */}
            <group position={[0, 0, length * 0.38]}>
                <mesh position={[-0.35, 0, 0]} rotation={[inputs.pitch * 0.25, 0.25, 0]}>
                    <boxGeometry args={[0.55, 0.03, 0.28]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
                </mesh>
                <mesh position={[0.35, 0, 0]} rotation={[inputs.pitch * 0.25, -0.25, 0]}>
                    <boxGeometry args={[0.55, 0.03, 0.28]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
                </mesh>
            </group>

            {/* Single engine exhaust - large */}
            <mesh position={[0, 0, length * 0.45]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.18, 0.22, 0.2, 14]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.95} emissive={colors.accent} emissiveIntensity={inputs.throttle * 0.9} />
            </mesh>
            {/* Afterburner ring */}
            <mesh position={[0, 0, length * 0.47]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.16, 0.02, 8, 16]} />
                <meshStandardMaterial color="#333333" metalness={0.9} />
            </mesh>
            {/* Afterburner flame */}
            {inputs.throttle > 0.6 && (
                <mesh position={[0, 0, length * 0.52 + inputs.throttle * 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.14, 0.6 + inputs.throttle * 0.6, 10]} />
                    <meshBasicMaterial color="#ff4400" transparent opacity={0.55 + inputs.throttle * 0.35} />
                </mesh>
            )}

            <LandingGear />
        </group>
    )
}
