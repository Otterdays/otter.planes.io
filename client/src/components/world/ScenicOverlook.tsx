// =====================================================
// SCENIC OVERLOOK - Hilltop viewpoint with telescope
// Position: -1200, 0, 1200 (between airport and lighthouse)
// =====================================================

export default function ScenicOverlook() {
    return (
        <group position={[-1200, 0, 1200]}>
            {/* Raised earth mound */}
            <mesh position={[0, 2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <cylinderGeometry args={[12, 18, 5, 16]} />
                <meshStandardMaterial color="#6b5344" roughness={0.9} metalness={0} />
            </mesh>

            {/* Wooden platform */}
            <mesh position={[0, 5.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <cylinderGeometry args={[8, 8, 0.25, 12]} />
                <meshStandardMaterial color="#8B6914" roughness={0.7} metalness={0.1} />
            </mesh>

            {/* Railing posts + rails */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i / 4) * Math.PI * 2
                const x = Math.cos(angle) * 7.5
                const z = Math.sin(angle) * 7.5
                return (
                    <group key={i}>
                        <mesh position={[x, 5.6, z]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
                            <meshStandardMaterial color="#5C4033" roughness={0.8} />
                        </mesh>
                    </group>
                )
            })}

            {/* Horizontal rail */}
            <mesh position={[0, 5.95, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 16, 8]} />
                <meshStandardMaterial color="#5C4033" roughness={0.8} />
            </mesh>

            {/* Bench */}
            <group position={[-1.5, 5.25, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh position={[0, 0.2, 0]}>
                    <boxGeometry args={[1.2, 0.1, 0.5]} />
                    <meshStandardMaterial color="#8B6914" roughness={0.75} />
                </mesh>
                <mesh position={[-0.5, -0.15, 0]}>
                    <boxGeometry args={[0.08, 0.4, 0.5]} />
                    <meshStandardMaterial color="#5C4033" roughness={0.8} />
                </mesh>
                <mesh position={[0.5, -0.15, 0]}>
                    <boxGeometry args={[0.08, 0.4, 0.5]} />
                    <meshStandardMaterial color="#5C4033" roughness={0.8} />
                </mesh>
            </group>

            {/* Telescope on pedestal */}
            <group position={[2, 5.25, 0]}>
                <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
                    <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 1.55, 0.6]} rotation={[-0.3, 0, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>

            {/* Sign */}
            <group position={[0, 5.5, 4]}>
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[0.08, 1, 0.08]} />
                    <meshStandardMaterial color="#5C4033" roughness={0.8} />
                </mesh>
                <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[1.5, 0.6, 0.04]} />
                    <meshStandardMaterial color="#f5e6c8" roughness={0.9} />
                </mesh>
            </group>
        </group>
    )
}
