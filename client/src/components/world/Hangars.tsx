import { useMemo } from 'react'

// =====================================================
// HANGARS - Aircraft storage hangars
// =====================================================

export default function Hangars() {
    const hangars = useMemo(() => [
        { position: [60, 0, -30] as [number, number, number], rotation: 0 },
        { position: [80, 0, -30] as [number, number, number], rotation: 0 },
        { position: [100, 0, -30] as [number, number, number], rotation: 0 },
    ], [])

    return (
        <group>
            {hangars.map((h, i) => (
                <Hangar key={i} position={h.position} rotation={h.rotation} />
            ))}

            {/* Static parked planes */}
            <StaticPlane position={[65, 0.5, -15]} rotation={Math.PI} color="#3366aa" />
            <StaticPlane position={[85, 0.5, -15]} rotation={Math.PI} color="#aa3366" />
            <StaticPlane position={[105, 0.5, -15]} rotation={Math.PI * 0.9} color="#33aa66" />
        </group>
    )
}

function Hangar({ position, rotation }: { position: [number, number, number]; rotation: number }) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Main structure (curved roof hangar) */}
            <mesh position={[0, 6, 0]} castShadow receiveShadow>
                <boxGeometry args={[15, 12, 20]} />
                <meshStandardMaterial color="#667788" roughness={0.8} />
            </mesh>

            {/* Curved roof */}
            <mesh position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[8, 8, 20, 16, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#556677" metalness={0.5} roughness={0.5} />
            </mesh>

            {/* Large doors (front) */}
            <mesh position={[0, 5, 10.1]} castShadow>
                <boxGeometry args={[12, 10, 0.3]} />
                <meshStandardMaterial color="#445566" roughness={0.7} />
            </mesh>

            {/* Door frame */}
            <mesh position={[-6.3, 5, 10.2]} castShadow>
                <boxGeometry args={[0.5, 10, 0.2]} />
                <meshStandardMaterial color="#334455" />
            </mesh>
            <mesh position={[6.3, 5, 10.2]} castShadow>
                <boxGeometry args={[0.5, 10, 0.2]} />
                <meshStandardMaterial color="#334455" />
            </mesh>

            {/* Windows (side) */}
            {[-6, -2, 2, 6].map((z, i) => (
                <mesh key={i} position={[7.6, 8, z]} castShadow>
                    <boxGeometry args={[0.2, 2, 2]} />
                    <meshStandardMaterial
                        color="#88aacc"
                        transparent
                        opacity={0.5}
                        metalness={0.8}
                    />
                </mesh>
            ))}
        </group>
    )
}

function StaticPlane({ position, rotation, color }: {
    position: [number, number, number];
    rotation: number;
    color: string;
}) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Fuselage */}
            <mesh castShadow>
                <boxGeometry args={[0.5, 0.4, 2.5]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Wings */}
            <mesh position={[0, 0, 0.2]} castShadow>
                <boxGeometry args={[4, 0.1, 0.8]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Tail */}
            <mesh position={[0, 0.3, 1]} castShadow>
                <boxGeometry args={[0.1, 0.6, 0.4]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Horizontal stabilizer */}
            <mesh position={[0, 0, 1.1]} castShadow>
                <boxGeometry args={[1.2, 0.05, 0.3]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Nose */}
            <mesh position={[0, 0, -1.4]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                <coneGeometry args={[0.2, 0.5, 8]} />
                <meshStandardMaterial color="#cccccc" metalness={0.8} />
            </mesh>
        </group>
    )
}
