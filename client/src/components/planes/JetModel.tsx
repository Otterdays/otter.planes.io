import type { PlaneColors, ControlInputs } from './types'
import { ControlSurface, LandingGear } from './shared'

// =====================================================
// JET FIGHTER MODEL (F-22 Raptor style)
// Dimensions: Length 19m, Wingspan 13.6m, Height 5m
// Scale: 1 unit = 1m, scaled to ~4 units length
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function JetModel({ colors, inputs }: ModelProps) {
    // F-22 proportions: L:W:H = 19:13.6:5 → scaled to 4:2.86:1.05
    const length = 4
    const wingspan = 2.86
    const height = 1.05

    return (
        <group>
            {/* Main fuselage - tapered box with proper aspect ratio */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.5, 0.4, length * 0.7]} />
                <meshStandardMaterial color={colors.primary} metalness={0.85} roughness={0.15} />
            </mesh>

            {/* Forward fuselage - narrower */}
            <mesh position={[0, 0.02, -length * 0.35]}>
                <boxGeometry args={[0.4, 0.35, length * 0.35]} />
                <meshStandardMaterial color={colors.primary} metalness={0.85} roughness={0.15} />
            </mesh>

            {/* Nose cone - radome */}
            <mesh position={[0, 0, -length * 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.18, 0.5, 6]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Cockpit canopy - bubble style */}
            <group position={[0, 0.22, -length * 0.15]}>
                <mesh>
                    <sphereGeometry args={[0.28, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                    <meshStandardMaterial color="#1a2a3a" transparent opacity={0.65} metalness={0.95} roughness={0.05} />
                </mesh>
                {/* Canopy frame */}
                <mesh position={[0, 0.05, 0.15]} rotation={[0.2, 0, 0]}>
                    <boxGeometry args={[0.02, 0.2, 0.3]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.8} />
                </mesh>
            </group>

            {/* Main wings - trapezoidal with 42° sweep */}
            <group position={[0, -0.08, 0.2]}>
                {/* Left wing */}
                <mesh position={[-wingspan * 0.35, 0, 0.3]} rotation={[0, 0.42, -0.03]}>
                    <boxGeometry args={[wingspan * 0.55, 0.05, 1.1]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Wing tip - swept back */}
                <mesh position={[-wingspan * 0.48, 0.01, 0.55]} rotation={[0, 0.7, -0.05]}>
                    <boxGeometry args={[wingspan * 0.15, 0.04, 0.4]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Right wing */}
                <mesh position={[wingspan * 0.35, 0, 0.3]} rotation={[0, -0.42, 0.03]}>
                    <boxGeometry args={[wingspan * 0.55, 0.05, 1.1]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[wingspan * 0.48, 0.01, 0.55]} rotation={[0, -0.7, 0.05]}>
                    <boxGeometry args={[wingspan * 0.15, 0.04, 0.4]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Ailerons */}
                <ControlSurface position={[-wingspan * 0.42, -0.02, 0.7]} size={[0.5, 0.03, 0.25]} color={colors.secondary} deflection={inputs.roll} axis="x" />
                <ControlSurface position={[wingspan * 0.42, -0.02, 0.7]} size={[0.5, 0.03, 0.25]} color={colors.secondary} deflection={-inputs.roll} axis="x" />

                {/* Nav lights */}
                <mesh position={[-wingspan * 0.52, 0, 0.5]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.9} />
                </mesh>
                <mesh position={[wingspan * 0.52, 0, 0.5]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.9} />
                </mesh>
            </group>

            {/* Twin vertical stabilizers - canted outward 27° */}
            <mesh position={[-0.25, height * 0.35, length * 0.35]} rotation={[0.1, 0, -0.47]}>
                <boxGeometry args={[0.04, height * 0.5, 0.45]} />
                <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.25, height * 0.35, length * 0.35]} rotation={[0.1, 0, 0.47]}>
                <boxGeometry args={[0.04, height * 0.5, 0.45]} />
                <meshStandardMaterial color={colors.primary} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Horizontal stabilizers with elevators */}
            <group position={[0, -0.02, length * 0.4]}>
                <mesh position={[-0.45, 0, 0]} rotation={[0, 0.3, 0]}>
                    <boxGeometry args={[0.7, 0.035, 0.35]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.75} roughness={0.25} />
                </mesh>
                <mesh position={[0.45, 0, 0]} rotation={[0, -0.3, 0]}>
                    <boxGeometry args={[0.7, 0.035, 0.35]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.75} roughness={0.25} />
                </mesh>
                <ControlSurface position={[-0.5, 0, 0.15]} size={[0.4, 0.025, 0.12]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
                <ControlSurface position={[0.5, 0, 0.15]} size={[0.4, 0.025, 0.12]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
            </group>

            {/* Twin engine exhausts */}
            {[-0.18, 0.18].map((x, i) => (
                <group key={i} position={[x, -0.05, length * 0.45]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.12, 0.14, 0.25, 12]} />
                        <meshStandardMaterial color="#1a1a1a" metalness={0.95} emissive={colors.accent} emissiveIntensity={inputs.throttle * 0.7} />
                    </mesh>
                    {/* Afterburner */}
                    {inputs.throttle > 0.65 && (
                        <mesh position={[0, 0, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <coneGeometry args={[0.1, 0.4 + inputs.throttle * 0.4, 8]} />
                            <meshBasicMaterial color="#ff5500" transparent opacity={0.5 + inputs.throttle * 0.4} />
                        </mesh>
                    )}
                </group>
            ))}

            <LandingGear />
        </group>
    )
}
