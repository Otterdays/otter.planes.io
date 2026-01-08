// =====================================================
// LANDING GEAR - Reusable landing gear assembly
// =====================================================

export function LandingGear() {
    return (
        <group>
            {/* Main gear (left and right) */}
            {[-0.6, 0.6].map((x, i) => (
                <group key={i} position={[x, -0.35, 0]}>
                    {/* Strut */}
                    <mesh position={[0, -0.15, 0]}>
                        <boxGeometry args={[0.04, 0.3, 0.04]} />
                        <meshStandardMaterial color="#444444" metalness={0.8} />
                    </mesh>
                    {/* Wheel */}
                    <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                    </mesh>
                </group>
            ))}

            {/* Tail/nose wheel */}
            <group position={[0, -0.25, 1.2]}>
                <mesh position={[0, -0.1, 0]}>
                    <boxGeometry args={[0.03, 0.2, 0.03]} />
                    <meshStandardMaterial color="#444444" metalness={0.8} />
                </mesh>
                <mesh position={[0, -0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                </mesh>
            </group>
        </group>
    )
}
