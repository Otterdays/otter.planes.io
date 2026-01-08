import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// =====================================================
// BLINKING LIGHT - Navigation light with configurable blink
// =====================================================

interface BlinkingLightProps {
    position: [number, number, number]
    color: string
    size?: number
    blinkRate?: number
}

export function BlinkingLight({
    position,
    color,
    size = 0.05,
    blinkRate = 1.5
}: BlinkingLightProps) {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null)

    useFrame(({ clock }) => {
        if (materialRef.current) {
            // Smooth sine wave blink with configurable rate
            const intensity = (Math.sin(clock.getElapsedTime() * blinkRate * Math.PI * 2) + 1) * 0.5
            materialRef.current.emissiveIntensity = 0.2 + intensity * 0.8
        }
    })

    return (
        <mesh position={position}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial
                ref={materialRef}
                color={color}
                emissive={color}
                emissiveIntensity={1}
            />
        </mesh>
    )
}
