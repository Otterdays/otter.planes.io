import type { PlaneColors, ControlInputs } from './types'
import { Propeller, ControlSurface, BlinkingLight } from './shared'

// =====================================================
// BIPLANE MODEL (Fokker Dr.I Triplane style - Red Baron)
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function BiplaneModel({ colors, inputs }: ModelProps) {
    const propRPM = 8 + inputs.throttle * 40

    return (
        <group>
            {/* Fuselage - rounded box style */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.4, 0.4, 2.2]} />
                <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
            </mesh>

            {/* Nose/engine block */}
            <mesh position={[0, 0, -1.2]}>
                <boxGeometry args={[0.35, 0.35, 0.4]} />
                <meshStandardMaterial color={colors.secondary} metalness={0.4} roughness={0.6} />
            </mesh>

            {/* Open cockpit */}
            <mesh position={[0, 0.25, 0.2]}>
                <boxGeometry args={[0.35, 0.15, 0.5]} />
                <meshStandardMaterial color={colors.secondary} />
            </mesh>

            {/* Upper wing */}
            <group position={[0, 0.5, 0]}>
                <mesh>
                    <boxGeometry args={[4, 0.08, 0.7]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Wing struts */}
                <mesh position={[-1, -0.25, 0]} rotation={[0, 0, 0.1]}>
                    <boxGeometry args={[0.05, 0.5, 0.05]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                <mesh position={[1, -0.25, 0]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.05, 0.5, 0.05]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                {/* Blinking wingtip lights */}
                <BlinkingLight position={[-2.05, 0.05, 0]} color="#ff0000" size={0.04} blinkRate={1.2} />
                <BlinkingLight position={[2.05, 0.05, 0]} color="#00ff00" size={0.04} blinkRate={1.2} />
            </group>

            {/* Lower wing */}
            <group position={[0, -0.1, 0]}>
                <mesh>
                    <boxGeometry args={[4, 0.08, 0.7]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Animated ailerons */}
                <ControlSurface
                    position={[-1.7, -0.02, 0.3]}
                    size={[0.5, 0.04, 0.15]}
                    color={colors.primary}
                    deflection={inputs.roll}
                    axis="x"
                />
                <ControlSurface
                    position={[1.7, -0.02, 0.3]}
                    size={[0.5, 0.04, 0.15]}
                    color={colors.primary}
                    deflection={-inputs.roll}
                    axis="x"
                />
                {/* Lower wing blinking lights */}
                <BlinkingLight position={[-2.05, -0.02, 0]} color="#ff0000" size={0.04} blinkRate={1.2} />
                <BlinkingLight position={[2.05, -0.02, 0]} color="#00ff00" size={0.04} blinkRate={1.2} />
            </group>

            {/* Tail section */}
            <mesh position={[0, 0, 1.3]}>
                <boxGeometry args={[0.25, 0.25, 0.5]} />
                <meshStandardMaterial color={colors.primary} metalness={0.3} roughness={0.7} />
            </mesh>

            {/* Horizontal stabilizer */}
            <mesh position={[0, 0.05, 1.5]}>
                <boxGeometry args={[1.2, 0.05, 0.4]} />
                <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
            </mesh>
            {/* Elevator */}
            <ControlSurface
                position={[0, 0.05, 1.68]}
                size={[0.8, 0.04, 0.12]}
                color={colors.primary}
                deflection={inputs.pitch}
                axis="x"
            />

            {/* Vertical stabilizer */}
            <mesh position={[0, 0.25, 1.5]}>
                <boxGeometry args={[0.05, 0.5, 0.35]} />
                <meshStandardMaterial color={colors.accent} metalness={0.2} roughness={0.8} />
            </mesh>
            {/* Rudder */}
            <ControlSurface
                position={[0, 0.25, 1.65]}
                size={[0.04, 0.4, 0.1]}
                color={colors.primary}
                deflection={inputs.yaw}
                axis="y"
            />

            {/* Tail light - blinking white */}
            <BlinkingLight position={[0, 0.5, 1.6]} color="#ffffff" size={0.035} blinkRate={0.8} />

            {/* Propeller */}
            <group position={[0, 0, -1.45]}>
                <Propeller rpm={propRPM} variant="biplane" />
            </group>

            {/* Fixed landing gear with wheels */}
            <group position={[0, -0.35, -0.3]}>
                {/* Struts */}
                <mesh position={[-0.4, -0.15, 0]} rotation={[0, 0, 0.2]}>
                    <boxGeometry args={[0.04, 0.4, 0.04]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                <mesh position={[0.4, -0.15, 0]} rotation={[0, 0, -0.2]}>
                    <boxGeometry args={[0.04, 0.4, 0.04]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                {/* Axle */}
                <mesh position={[0, -0.35, 0]}>
                    <boxGeometry args={[1, 0.03, 0.03]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                {/* Wheels */}
                <mesh position={[-0.45, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
                </mesh>
                <mesh position={[0.45, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
                </mesh>
            </group>

            {/* Tail skid */}
            <mesh position={[0, -0.25, 1.4]}>
                <boxGeometry args={[0.03, 0.15, 0.1]} />
                <meshStandardMaterial color={colors.secondary} />
            </mesh>
        </group>
    )
}
