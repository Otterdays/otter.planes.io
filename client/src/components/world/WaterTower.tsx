// =====================================================
// WATER TOWER - Classic spherical water tower
// =====================================================

export default function WaterTower() {
    return (
        <group position={[200, 0, 100]}>
            {/* Concrete base */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[4, 5, 2, 12]} />
                <meshStandardMaterial color="#666666" roughness={0.9} />
            </mesh>

            {/* Support legs (4) */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i * Math.PI) / 2 + Math.PI / 4
                const radius = 3
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * radius, 20, Math.sin(angle) * radius]}
                        castShadow
                    >
                        <cylinderGeometry args={[0.8, 1.2, 38, 8]} />
                        <meshStandardMaterial color="#556677" roughness={0.6} />
                    </mesh>
                )
            })}

            {/* Cross braces between legs */}
            {[10, 25].map((y, yi) => (
                [0, 1, 2, 3].map((i) => {
                    const angle1 = (i * Math.PI) / 2 + Math.PI / 4
                    const angle2 = ((i + 1) * Math.PI) / 2 + Math.PI / 4
                    const r = 3
                    const x1 = Math.cos(angle1) * r
                    const z1 = Math.sin(angle1) * r
                    const x2 = Math.cos(angle2) * r
                    const z2 = Math.sin(angle2) * r
                    const cx = (x1 + x2) / 2
                    const cz = (z1 + z2) / 2
                    const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)
                    const rot = Math.atan2(z2 - z1, x2 - x1)
                    return (
                        <mesh
                            key={`${yi}-${i}`}
                            position={[cx, y, cz]}
                            rotation={[0, -rot, 0]}
                            castShadow
                        >
                            <boxGeometry args={[len, 0.4, 0.4]} />
                            <meshStandardMaterial color="#445566" />
                        </mesh>
                    )
                })
            )).flat()}

            {/* Tank base (cone) */}
            <mesh position={[0, 38, 0]} castShadow>
                <coneGeometry args={[6, 4, 16]} />
                <meshStandardMaterial color="#88aacc" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Main water tank (sphere) */}
            <mesh position={[0, 44, 0]} castShadow>
                <sphereGeometry args={[8, 24, 16]} />
                <meshStandardMaterial color="#aaccdd" metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Tank cap */}
            <mesh position={[0, 52, 0]} castShadow>
                <cylinderGeometry args={[2, 3, 2, 12]} />
                <meshStandardMaterial color="#88aacc" metalness={0.6} />
            </mesh>

            {/* Antenna on top */}
            <mesh position={[0, 55, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 5, 6]} />
                <meshStandardMaterial color="#888888" metalness={0.7} />
            </mesh>

            {/* "OTTER CITY" text band (represented as colored stripe) */}
            <mesh position={[0, 44, 0]} rotation={[0, 0.5, 0]}>
                <torusGeometry args={[8.1, 1.5, 8, 24, Math.PI * 0.6]} />
                <meshStandardMaterial color="#3366aa" roughness={0.5} />
            </mesh>

            {/* Access ladder */}
            <group position={[3.5, 20, 0]}>
                {/* Ladder rails */}
                <mesh position={[-0.3, 0, 0]} castShadow>
                    <boxGeometry args={[0.1, 40, 0.1]} />
                    <meshStandardMaterial color="#555555" />
                </mesh>
                <mesh position={[0.3, 0, 0]} castShadow>
                    <boxGeometry args={[0.1, 40, 0.1]} />
                    <meshStandardMaterial color="#555555" />
                </mesh>
                {/* Ladder rungs */}
                {Array.from({ length: 20 }, (_, i) => (
                    <mesh key={i} position={[0, -18 + i * 2, 0]}>
                        <boxGeometry args={[0.6, 0.08, 0.08]} />
                        <meshStandardMaterial color="#555555" />
                    </mesh>
                ))}
            </group>

            {/* Warning light */}
            <mesh position={[0, 58, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.8}
                />
            </mesh>
        </group>
    )
}
