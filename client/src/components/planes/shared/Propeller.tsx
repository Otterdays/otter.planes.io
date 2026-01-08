import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlaneVariant } from '../types'

// =====================================================
// PROPELLER - Spinning propeller with configurable blades
// =====================================================

interface PropellerProps {
    rpm?: number
    variant?: PlaneVariant
    bladeCount?: number
}

export function Propeller({ rpm = 30, variant = 'ww2', bladeCount }: PropellerProps) {
    const propRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (propRef.current) {
            propRef.current.rotation.z += delta * rpm
        }
    })

    const actualBladeCount = bladeCount ?? (variant === 'biplane' ? 2 : 3)
    const bladeAngles = Array.from({ length: actualBladeCount }, (_, i) => (360 / actualBladeCount) * i)

    return (
        <group ref={propRef}>
            {/* Hub */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.15, 12]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Blades */}
            {bladeAngles.map((angle, i) => (
                <mesh
                    key={i}
                    position={[
                        Math.cos((angle * Math.PI) / 180) * 0.05,
                        Math.sin((angle * Math.PI) / 180) * 0.05,
                        0,
                    ]}
                    rotation={[0, 0, (angle * Math.PI) / 180]}
                >
                    <boxGeometry args={[0.08, 1.2, 0.02]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.2} />
                </mesh>
            ))}
        </group>
    )
}
