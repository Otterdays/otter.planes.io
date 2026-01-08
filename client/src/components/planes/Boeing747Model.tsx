import type { PlaneColors, ControlInputs } from './types'
import { ControlSurface, LandingGear } from './shared'

// =====================================================
// BOEING 747 MODEL (Jumbo Jet)
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function Boeing747Model({ colors, inputs }: ModelProps) {
    return (
        <group scale={[1.5, 1.5, 1.5]}>
            {/* Main fuselage - wide body */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.5, 6, 8, 16]} />
                <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Upper deck hump (747 signature) */}
            <mesh position={[0, 0.35, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.3, 2.5, 8, 16]} />
                <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Nose cone */}
            <mesh position={[0, 0, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.5, 1.5, 16]} />
                <meshStandardMaterial color={colors.primary} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Cockpit windows */}
            <mesh position={[0, 0.2, -3.8]} rotation={[-0.4, 0, 0]}>
                <boxGeometry args={[0.4, 0.15, 0.3]} />
                <meshStandardMaterial color="#1a1a2e" transparent opacity={0.8} metalness={0.9} />
            </mesh>

            {/* Blue belly stripe */}
            <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[1.02, 0.2, 6]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.6} />
            </mesh>

            {/* Main wings */}
            <group position={[0, -0.1, 0.5]}>
                {/* Left wing */}
                <mesh position={[-2.5, 0, 0.3]} rotation={[0, 0.1, -0.03]}>
                    <boxGeometry args={[4.5, 0.12, 1.2]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Right wing */}
                <mesh position={[2.5, 0, 0.3]} rotation={[0, -0.1, 0.03]}>
                    <boxGeometry args={[4.5, 0.12, 1.2]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.3} />
                </mesh>

                {/* Winglets */}
                <mesh position={[-4.6, 0.3, 0.5]} rotation={[0, 0, -0.3]}>
                    <boxGeometry args={[0.08, 0.6, 0.3]} />
                    <meshStandardMaterial color={colors.primary} />
                </mesh>
                <mesh position={[4.6, 0.3, 0.5]} rotation={[0, 0, 0.3]}>
                    <boxGeometry args={[0.08, 0.6, 0.3]} />
                    <meshStandardMaterial color={colors.primary} />
                </mesh>

                {/* Animated ailerons */}
                <ControlSurface position={[-3.5, -0.03, 0.7]} size={[1.2, 0.05, 0.25]} color={colors.secondary} deflection={inputs.roll} axis="x" />
                <ControlSurface position={[3.5, -0.03, 0.7]} size={[1.2, 0.05, 0.25]} color={colors.secondary} deflection={-inputs.roll} axis="x" />

                {/* Wing lights */}
                <mesh position={[-4.7, 0, 0.4]}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
                </mesh>
                <mesh position={[4.7, 0, 0.4]}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
                </mesh>
            </group>

            {/* 4 Engines (under wings) */}
            {[[-1.8, -0.4, 0.3], [-3.2, -0.35, 0.5], [1.8, -0.4, 0.3], [3.2, -0.35, 0.5]].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                    {/* Engine nacelle */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.25, 0.3, 0.9, 16]} />
                        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
                    </mesh>
                    {/* Engine intake */}
                    <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.28, 0.25, 0.2, 16]} />
                        <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
                    </mesh>
                    {/* Engine exhaust glow */}
                    <mesh position={[0, 0, 0.5]}>
                        <circleGeometry args={[0.2, 16]} />
                        <meshStandardMaterial
                            color="#ff6600"
                            emissive="#ff4400"
                            emissiveIntensity={inputs.throttle * 0.5}
                        />
                    </mesh>
                </group>
            ))}

            {/* Horizontal stabilizer */}
            <group position={[0, 0.1, 3]}>
                <mesh position={[-1.2, 0, 0]}>
                    <boxGeometry args={[2.2, 0.08, 0.6]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.6} />
                </mesh>
                <mesh position={[1.2, 0, 0]}>
                    <boxGeometry args={[2.2, 0.08, 0.6]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.6} />
                </mesh>
                {/* Elevators */}
                <ControlSurface position={[-1.2, 0, 0.25]} size={[1.5, 0.05, 0.15]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
                <ControlSurface position={[1.2, 0, 0.25]} size={[1.5, 0.05, 0.15]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
            </group>

            {/* Vertical stabilizer (tall) */}
            <mesh position={[0, 0.9, 2.8]}>
                <boxGeometry args={[0.1, 1.6, 1]} />
                <meshStandardMaterial color={colors.primary} metalness={0.6} />
            </mesh>
            {/* Red accent on tail */}
            <mesh position={[0.06, 1.2, 2.9]}>
                <boxGeometry args={[0.02, 0.8, 0.6]} />
                <meshStandardMaterial color={colors.accent} />
            </mesh>
            {/* Rudder */}
            <ControlSurface position={[0, 0.9, 3.25]} size={[0.06, 1.4, 0.2]} color={colors.secondary} deflection={inputs.yaw} axis="y" />

            {/* Tail cone */}
            <mesh position={[0, 0, 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.4, 1, 16]} />
                <meshStandardMaterial color={colors.primary} metalness={0.7} />
            </mesh>

            {/* Landing gear */}
            <LandingGear />

            {/* Cabin windows (row of dots) */}
            {Array.from({ length: 20 }, (_, i) => (
                <mesh key={i} position={[0, 0.15, -2.5 + i * 0.3]} rotation={[0, Math.PI / 2, 0]}>
                    <circleGeometry args={[0.06, 8]} />
                    <meshStandardMaterial color="#88aacc" emissive="#446688" emissiveIntensity={0.1} />
                </mesh>
            ))}
        </group>
    )
}
