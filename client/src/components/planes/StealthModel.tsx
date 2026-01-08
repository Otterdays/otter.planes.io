import type { PlaneColors, ControlInputs } from './types'
import { ControlSurface, LandingGear } from './shared'

// =====================================================
// STEALTH BOMBER MODEL (B-2 Spirit style flying wing)
// Dimensions: Length 21m, Wingspan 52m, Height 5.2m
// Scale: 1 unit ≈ 5m for gameplay
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function StealthModel({ colors, inputs }: ModelProps) {
    // B-2 has extreme wingspan - scaled for game: wingspan 6, length 2.5
    const wingspan = 5.5
    const length = 2.8

    // Flying wing angle calculations
    const sweepAngle = 33 * (Math.PI / 180) // 33° leading edge sweep
    const wingChord = 1.2

    return (
        <group>
            {/* Central body - blended wing body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.2, 0.25, length * 0.6]} />
                <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.4} flatShading />
            </mesh>

            {/* Forward nose - pointed */}
            <mesh position={[0, 0.02, -length * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.55, 0.6, 4]} />
                <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.4} flatShading />
            </mesh>

            {/* Left wing section - using sweep angle */}
            <group position={[-wingspan * 0.25, 0, Math.tan(sweepAngle) * wingspan * 0.25]}>
                <mesh rotation={[0, sweepAngle, -0.02]}>
                    <boxGeometry args={[wingspan * 0.45, 0.12, wingChord]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} flatShading />
                </mesh>
                {/* Outer wing taper */}
                <mesh position={[-wingspan * 0.22, 0, 0.25]} rotation={[0, sweepAngle + 0.3, -0.03]}>
                    <boxGeometry args={[wingspan * 0.15, 0.08, 0.6]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} flatShading />
                </mesh>
            </group>

            {/* Right wing section */}
            <group position={[wingspan * 0.25, 0, Math.tan(sweepAngle) * wingspan * 0.25]}>
                <mesh rotation={[0, -sweepAngle, 0.02]}>
                    <boxGeometry args={[wingspan * 0.45, 0.12, wingChord]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} flatShading />
                </mesh>
                <mesh position={[wingspan * 0.22, 0, 0.25]} rotation={[0, -sweepAngle - 0.3, 0.03]}>
                    <boxGeometry args={[wingspan * 0.15, 0.08, 0.6]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.55} roughness={0.45} flatShading />
                </mesh>
            </group>

            {/* Elevons (combined elevator/aileron) */}
            <ControlSurface position={[-wingspan * 0.35, -0.05, length * 0.15]} size={[0.8, 0.04, 0.2]} color={colors.secondary} deflection={inputs.roll + inputs.pitch * 0.5} axis="x" />
            <ControlSurface position={[wingspan * 0.35, -0.05, length * 0.15]} size={[0.8, 0.04, 0.2]} color={colors.secondary} deflection={-inputs.roll + inputs.pitch * 0.5} axis="x" />

            {/* Split drag rudders (yaw via differential) */}
            <mesh position={[-wingspan * 0.18, 0.08, length * 0.25]} rotation={[0.1 + inputs.yaw * 0.2, 0.15, 0]}>
                <boxGeometry args={[0.03, 0.15, 0.3]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.5} />
            </mesh>
            <mesh position={[wingspan * 0.18, 0.08, length * 0.25]} rotation={[0.1 - inputs.yaw * 0.2, -0.15, 0]}>
                <boxGeometry args={[0.03, 0.15, 0.3]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.5} />
            </mesh>

            {/* Cockpit windows - narrow slit */}
            <mesh position={[0, 0.14, -length * 0.15]}>
                <boxGeometry args={[0.6, 0.08, 0.3]} />
                <meshStandardMaterial color="#0a1520" transparent opacity={0.8} metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Engine intakes (top-mounted, hidden from below) */}
            {[-0.4, 0.4].map((x, i) => (
                <mesh key={i} position={[x, 0.08, -0.1]}>
                    <boxGeometry args={[0.25, 0.1, 0.4]} />
                    <meshStandardMaterial color={colors.secondary} metalness={0.7} />
                </mesh>
            ))}

            {/* Engine exhausts (buried in trailing edge) */}
            {[-0.35, 0.35].map((x, i) => (
                <group key={i} position={[x, -0.02, length * 0.3]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.1, 0.15, 8]} />
                        <meshStandardMaterial color="#1a1a1a" metalness={0.9} emissive="#332200" emissiveIntensity={inputs.throttle * 0.4} />
                    </mesh>
                </group>
            ))}

            {/* Nav lights (minimal) */}
            <mesh position={[-wingspan * 0.48, 0, length * 0.1]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[wingspan * 0.48, 0, length * 0.1]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.6} />
            </mesh>

            <LandingGear />
        </group>
    )
}
