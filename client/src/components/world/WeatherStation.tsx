// =====================================================
// WEATHER STATION - Observatory with instruments
// =====================================================

export default function WeatherStation() {
    return (
        <group position={[150, 0, -100]}>
            {/* Main building */}
            <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[12, 6, 10]} />
                <meshStandardMaterial color="#667788" roughness={0.7} />
            </mesh>

            {/* Observatory dome */}
            <mesh position={[0, 8, 0]} castShadow>
                <sphereGeometry args={[5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#aabbcc" metalness={0.5} roughness={0.3} />
            </mesh>

            {/* Dome slit (observation opening) */}
            <mesh position={[0, 8, 4]} rotation={[-0.3, 0, 0]}>
                <boxGeometry args={[2, 0.2, 4]} />
                <meshStandardMaterial color="#222222" />
            </mesh>

            {/* Antenna mast */}
            <mesh position={[-5, 10, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 12, 8]} />
                <meshStandardMaterial color="#888888" metalness={0.7} />
            </mesh>

            {/* Weather sensors on mast */}
            <group position={[-5, 16, 0]}>
                {/* Anemometer cups */}
                <group>
                    {[0, 1, 2, 3].map((i) => {
                        const angle = (i * Math.PI) / 2
                        return (
                            <mesh
                                key={i}
                                position={[Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6]}
                                rotation={[0, angle, 0]}
                            >
                                <sphereGeometry args={[0.2, 8, 6, 0, Math.PI]} />
                                <meshStandardMaterial color="#cccccc" />
                            </mesh>
                        )
                    })}
                </group>

                {/* Wind vane */}
                <mesh position={[0, 1, 0]} rotation={[0, 0.5, 0]}>
                    <boxGeometry args={[0.05, 0.3, 1]} />
                    <meshStandardMaterial color="#ff6600" />
                </mesh>
            </group>

            {/* Radar sphere */}
            <group position={[5, 12, 0]}>
                <mesh castShadow>
                    <sphereGeometry args={[2, 16, 12]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.3} />
                </mesh>
                {/* Support post */}
                <mesh position={[0, -4, 0]} castShadow>
                    <cylinderGeometry args={[0.4, 0.5, 6, 8]} />
                    <meshStandardMaterial color="#555555" />
                </mesh>
            </group>

            {/* Windows */}
            {[[-4, 3, 5.1], [0, 3, 5.1], [4, 3, 5.1]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                    <boxGeometry args={[2, 2, 0.1]} />
                    <meshStandardMaterial
                        color="#88aacc"
                        transparent
                        opacity={0.6}
                        metalness={0.8}
                    />
                </mesh>
            ))}

            {/* Door */}
            <mesh position={[0, 1.5, 5.1]}>
                <boxGeometry args={[2, 3, 0.1]} />
                <meshStandardMaterial color="#554433" />
            </mesh>

            {/* Rain gauge */}
            <mesh position={[8, 1, 3]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 2, 12]} />
                <meshStandardMaterial color="#aaaaaa" metalness={0.6} />
            </mesh>

            {/* Solar panels on roof */}
            <mesh position={[-4, 6.5, -3]} rotation={[-0.3, 0, 0]} castShadow>
                <boxGeometry args={[4, 0.1, 2]} />
                <meshStandardMaterial color="#222244" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[4, 6.5, -3]} rotation={[-0.3, 0, 0]} castShadow>
                <boxGeometry args={[4, 0.1, 2]} />
                <meshStandardMaterial color="#222244" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Ground pad */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 16]} />
                <meshStandardMaterial color="#555555" roughness={0.9} />
            </mesh>
        </group>
    )
}
