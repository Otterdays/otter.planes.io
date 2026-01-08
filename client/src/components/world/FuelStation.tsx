// =====================================================
// FUEL STATION - Airport refueling facility
// =====================================================

export default function FuelStation() {
    return (
        <group position={[-50, 0, 15]}>
            {/* Canopy structure */}
            <mesh position={[0, 4, 0]} castShadow>
                <boxGeometry args={[12, 0.5, 8]} />
                <meshStandardMaterial color="#dd4444" roughness={0.6} />
            </mesh>

            {/* Canopy support pillars */}
            {[[-5, 0, -3], [-5, 0, 3], [5, 0, -3], [5, 0, 3]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 2, pos[2]]} castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
                    <meshStandardMaterial color="#cccccc" metalness={0.6} />
                </mesh>
            ))}

            {/* Fuel pumps */}
            {[-2, 2].map((x, i) => (
                <group key={i} position={[x, 0, 0]}>
                    {/* Pump body */}
                    <mesh position={[0, 0.8, 0]} castShadow>
                        <boxGeometry args={[0.8, 1.6, 0.5]} />
                        <meshStandardMaterial color="#ffcc00" roughness={0.5} />
                    </mesh>
                    {/* Pump display */}
                    <mesh position={[0, 1.2, 0.26]}>
                        <boxGeometry args={[0.5, 0.4, 0.05]} />
                        <meshStandardMaterial color="#111111" />
                    </mesh>
                    {/* Nozzle holder */}
                    <mesh position={[0.3, 0.8, 0.26]} castShadow>
                        <boxGeometry args={[0.15, 0.3, 0.1]} />
                        <meshStandardMaterial color="#333333" />
                    </mesh>
                </group>
            ))}

            {/* Small office building */}
            <group position={[0, 0, -6]}>
                <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[6, 3, 4]} />
                    <meshStandardMaterial color="#667788" roughness={0.7} />
                </mesh>
                {/* Window */}
                <mesh position={[0, 1.8, 2.01]}>
                    <boxGeometry args={[3, 1.5, 0.1]} />
                    <meshStandardMaterial
                        color="#88bbcc"
                        transparent
                        opacity={0.6}
                        metalness={0.8}
                    />
                </mesh>
                {/* Door */}
                <mesh position={[2, 1, 2.01]}>
                    <boxGeometry args={[1, 2, 0.1]} />
                    <meshStandardMaterial color="#554433" />
                </mesh>
            </group>

            {/* "OTTER FUEL" sign */}
            <mesh position={[0, 4.8, 0]} castShadow>
                <boxGeometry args={[8, 1.2, 0.3]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffff88"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Fuel truck */}
            <group position={[8, 0, 2]} rotation={[0, -0.3, 0]}>
                {/* Truck cabin */}
                <mesh position={[0, 1, 0]} castShadow>
                    <boxGeometry args={[2.5, 2, 2]} />
                    <meshStandardMaterial color="#dd6633" />
                </mesh>
                {/* Tank */}
                <mesh position={[-2.5, 1.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[1, 1, 4, 12]} />
                    <meshStandardMaterial color="#cccccc" metalness={0.7} />
                </mesh>
                {/* Wheels */}
                {[[0.8, 0], [-0.8, 0], [-3.5, 0]].map((pos, i) => (
                    <mesh key={i} position={[pos[0], 0.4, pos[1]]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.4, 0.4, 0.3, 12]} />
                        <meshStandardMaterial color="#222222" />
                    </mesh>
                ))}
            </group>

            {/* Ground pad */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[18, 14]} />
                <meshStandardMaterial color="#444444" roughness={0.95} />
            </mesh>
        </group>
    )
}
