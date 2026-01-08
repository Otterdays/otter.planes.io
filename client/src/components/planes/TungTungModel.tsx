import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlaneColors, ControlInputs } from './types'
import { ControlSurface, BlinkingLight } from './shared'

// =====================================================
// TUNG TUNG AIR MODEL (Brain Rot Meme Plane!)
// Based on the Tung Tung Tung Sahur meme character
// A cylindrical wooden guy with arms, legs, and a bat
// =====================================================

interface ModelProps {
    colors: PlaneColors
    inputs: ControlInputs
}

export function TungTungModel({ colors, inputs }: ModelProps) {
    const batRef = useRef<THREE.Group>(null)
    const leftArmRef = useRef<THREE.Group>(null)
    const rightArmRef = useRef<THREE.Group>(null)
    const leftLegRef = useRef<THREE.Group>(null)
    const rightLegRef = useRef<THREE.Group>(null)

    // Animated limbs - walking/flailing motion
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()
        const speed = inputs.throttle

        // Bat spinning (propeller style!)
        if (batRef.current) {
            batRef.current.rotation.z += (10 + speed * 40) * 0.016
        }

        // Arm flapping based on throttle
        if (leftArmRef.current && rightArmRef.current) {
            const flap = Math.sin(t * 8) * 0.3 * speed
            leftArmRef.current.rotation.z = -0.3 + flap
            rightArmRef.current.rotation.z = 0.3 - flap
        }

        // Leg dangling animation
        if (leftLegRef.current && rightLegRef.current) {
            const swing = Math.sin(t * 4) * 0.2
            leftLegRef.current.rotation.x = swing
            rightLegRef.current.rotation.x = -swing
        }
    })

    return (
        <group>
            {/* === CYLINDRICAL BODY (The iconic log shape) === */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.5, 0.45, 3, 16]} />
                <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
            </mesh>

            {/* Body shading/texture lines */}
            {[-0.3, 0, 0.3].map((z, i) => (
                <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.48, 0.02, 8, 32]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
            ))}

            {/* === FACE (The derpy meme face) === */}
            <group position={[0, 0.15, -1.3]}>
                {/* Face plate - slightly lighter */}
                <mesh>
                    <sphereGeometry args={[0.42, 16, 12, 0, Math.PI]} />
                    <meshStandardMaterial color={colors.accent} metalness={0.1} roughness={0.9} />
                </mesh>

                {/* Big googly eyes */}
                <group position={[-0.15, 0.1, -0.25]}>
                    {/* Left eye white */}
                    <mesh>
                        <sphereGeometry args={[0.12, 12, 12]} />
                        <meshStandardMaterial color="#FFFFF0" />
                    </mesh>
                    {/* Left pupil - looking slightly derpy */}
                    <mesh position={[-0.02, -0.02, -0.08]}>
                        <sphereGeometry args={[0.06, 10, 10]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    {/* Eye shine */}
                    <mesh position={[-0.04, 0.02, -0.1]}>
                        <sphereGeometry args={[0.025, 6, 6]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
                    </mesh>
                </group>

                <group position={[0.15, 0.1, -0.25]}>
                    {/* Right eye white */}
                    <mesh>
                        <sphereGeometry args={[0.12, 12, 12]} />
                        <meshStandardMaterial color="#FFFFF0" />
                    </mesh>
                    {/* Right pupil */}
                    <mesh position={[0.02, -0.02, -0.08]}>
                        <sphereGeometry args={[0.06, 10, 10]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    {/* Eye shine */}
                    <mesh position={[0, 0.02, -0.1]}>
                        <sphereGeometry args={[0.025, 6, 6]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
                    </mesh>
                </group>

                {/* Eyebrows - expressive */}
                <mesh position={[-0.15, 0.22, -0.2]} rotation={[0, 0, 0.2]}>
                    <boxGeometry args={[0.15, 0.03, 0.04]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                <mesh position={[0.15, 0.22, -0.2]} rotation={[0, 0, -0.2]}>
                    <boxGeometry args={[0.15, 0.03, 0.04]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>

                {/* Nose - simple bump */}
                <mesh position={[0, -0.02, -0.35]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>

                {/* Mouth - slight smile */}
                <mesh position={[0, -0.15, -0.3]} rotation={[0.2, 0, 0]}>
                    <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
                    <meshStandardMaterial color="#4a3020" />
                </mesh>
            </group>

            {/* === ARMS (Wings!) === */}
            {/* Left Arm */}
            <group ref={leftArmRef} position={[-0.5, 0, -0.3]}>
                {/* Upper arm */}
                <mesh position={[-0.4, 0, 0]} rotation={[0, 0, -0.5]}>
                    <capsuleGeometry args={[0.1, 0.6, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Forearm */}
                <mesh position={[-0.9, -0.15, 0]} rotation={[0, 0, -0.8]}>
                    <capsuleGeometry args={[0.08, 0.5, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Hand */}
                <mesh position={[-1.25, -0.35, 0]}>
                    <sphereGeometry args={[0.12, 10, 10]} />
                    <meshStandardMaterial color={colors.accent} />
                </mesh>
                {/* Wing membrane (for actual lift!) */}
                <mesh position={[-0.7, 0.1, 0.3]} rotation={[0, 0, -0.3]}>
                    <boxGeometry args={[1.2, 0.03, 0.8]} />
                    <meshStandardMaterial color={colors.secondary} transparent opacity={0.7} />
                </mesh>
            </group>

            {/* Right Arm (holding the bat!) */}
            <group ref={rightArmRef} position={[0.5, 0, -0.3]}>
                {/* Upper arm */}
                <mesh position={[0.4, 0, 0]} rotation={[0, 0, 0.5]}>
                    <capsuleGeometry args={[0.1, 0.6, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Forearm - raised to hold bat */}
                <mesh position={[0.85, 0.1, -0.2]} rotation={[0.5, 0, 0.3]}>
                    <capsuleGeometry args={[0.08, 0.5, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Hand gripping bat */}
                <mesh position={[1.1, 0.35, -0.4]}>
                    <sphereGeometry args={[0.12, 10, 10]} />
                    <meshStandardMaterial color={colors.accent} />
                </mesh>
                {/* Wing membrane */}
                <mesh position={[0.7, 0.1, 0.3]} rotation={[0, 0, 0.3]}>
                    <boxGeometry args={[1.2, 0.03, 0.8]} />
                    <meshStandardMaterial color={colors.secondary} transparent opacity={0.7} />
                </mesh>
            </group>

            {/* === THE ICONIC BAT (Propeller!) === */}
            <group ref={batRef} position={[0, 0, -1.8]}>
                {/* Bat handle */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
                    <meshStandardMaterial color="#5C4033" metalness={0.3} roughness={0.7} />
                </mesh>
                {/* Bat head - thicker end */}
                <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.08, 0.06, 0.5, 8]} />
                    <meshStandardMaterial color="#8B6914" metalness={0.3} roughness={0.6} />
                </mesh>
                {/* Second bat blade (for propeller effect) */}
                <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
                    <meshStandardMaterial color="#8B6914" metalness={0.3} roughness={0.6} />
                </mesh>
            </group>

            {/* === LEGS (Hanging down like landing gear) === */}
            {/* Left Leg */}
            <group ref={leftLegRef} position={[-0.2, -0.35, 0.8]}>
                {/* Thigh */}
                <mesh position={[0, -0.3, 0]} rotation={[0.2, 0, 0]}>
                    <capsuleGeometry args={[0.1, 0.5, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Shin */}
                <mesh position={[0, -0.75, 0.1]} rotation={[-0.1, 0, 0]}>
                    <capsuleGeometry args={[0.08, 0.45, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -1.05, 0.2]}>
                    <boxGeometry args={[0.15, 0.06, 0.25]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                {/* Toes */}
                {[-0.04, 0, 0.04].map((x, i) => (
                    <mesh key={i} position={[x, -1.05, 0.05]}>
                        <sphereGeometry args={[0.03, 6, 6]} />
                        <meshStandardMaterial color={colors.secondary} />
                    </mesh>
                ))}
            </group>

            {/* Right Leg */}
            <group ref={rightLegRef} position={[0.2, -0.35, 0.8]}>
                {/* Thigh */}
                <mesh position={[0, -0.3, 0]} rotation={[0.2, 0, 0]}>
                    <capsuleGeometry args={[0.1, 0.5, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Shin */}
                <mesh position={[0, -0.75, 0.1]} rotation={[-0.1, 0, 0]}>
                    <capsuleGeometry args={[0.08, 0.45, 8, 12]} />
                    <meshStandardMaterial color={colors.primary} metalness={0.2} roughness={0.8} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -1.05, 0.2]}>
                    <boxGeometry args={[0.15, 0.06, 0.25]} />
                    <meshStandardMaterial color={colors.secondary} />
                </mesh>
                {/* Toes */}
                {[-0.04, 0, 0.04].map((x, i) => (
                    <mesh key={i} position={[x, -1.05, 0.05]}>
                        <sphereGeometry args={[0.03, 6, 6]} />
                        <meshStandardMaterial color={colors.secondary} />
                    </mesh>
                ))}
            </group>

            {/* === TAIL (Small stabilizer at the back) === */}
            <group position={[0, 0.2, 1.4]}>
                {/* Vertical tail fin */}
                <mesh>
                    <boxGeometry args={[0.05, 0.4, 0.3]} />
                    <meshStandardMaterial color={colors.primary} />
                </mesh>
                {/* Horizontal stabilizers */}
                <mesh position={[0, -0.15, 0]}>
                    <boxGeometry args={[0.8, 0.04, 0.25]} />
                    <meshStandardMaterial color={colors.primary} />
                </mesh>
                {/* Rudder */}
                <ControlSurface position={[0, 0, 0.15]} size={[0.04, 0.35, 0.1]} color={colors.secondary} deflection={inputs.yaw} axis="y" />
                {/* Elevators */}
                <ControlSurface position={[-0.3, -0.15, 0.1]} size={[0.3, 0.03, 0.08]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
                <ControlSurface position={[0.3, -0.15, 0.1]} size={[0.3, 0.03, 0.08]} color={colors.secondary} deflection={inputs.pitch} axis="x" />
            </group>

            {/* === NAV LIGHTS === */}
            <BlinkingLight position={[-1.3, 0, 0]} color="#ff0000" size={0.04} blinkRate={2} />
            <BlinkingLight position={[1.3, 0, 0]} color="#00ff00" size={0.04} blinkRate={2} />
            <BlinkingLight position={[0, 0.4, 1.5]} color="#ffffff" size={0.035} blinkRate={1} />

            {/* === "TUNG TUNG AIR" badge on sides === */}
            <mesh position={[0.51, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.15, 16]} />
                <meshStandardMaterial color="#FFD700" metalness={0.7} />
            </mesh>
            <mesh position={[-0.51, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <circleGeometry args={[0.15, 16]} />
                <meshStandardMaterial color="#FFD700" metalness={0.7} />
            </mesh>
        </group>
    )
}
