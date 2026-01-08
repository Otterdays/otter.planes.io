// =====================================================
// CONTROL TOWER - Airport ATC tower with LOD support
// =====================================================

import { SimpleLOD, LODCylinder } from '../../systems/LOD'

// High-detail Control Tower (shown when close)
function ControlTowerHigh() {
    return (
        <group>
            {/* Base building (2-story) */}
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[8, 4, 6]} />
                <meshStandardMaterial color="#556677" roughness={0.7} />
            </mesh>

            {/* Windows on base */}
            {[-2, 0, 2].map((x, i) => (
                <mesh key={i} position={[x, 2.5, 3.01]} castShadow>
                    <boxGeometry args={[1.2, 1.5, 0.1]} />
                    <meshStandardMaterial
                        color="#88aacc"
                        metalness={0.9}
                        roughness={0.1}
                        emissive="#446688"
                        emissiveIntensity={0.2}
                    />
                </mesh>
            ))}

            {/* Tower shaft */}
            <mesh position={[0, 10, 0]} castShadow>
                <boxGeometry args={[4, 16, 4]} />
                <meshStandardMaterial color="#667788" roughness={0.6} />
            </mesh>

            {/* Observation deck platform */}
            <mesh position={[0, 19, 0]} castShadow>
                <boxGeometry args={[7, 1, 7]} />
                <meshStandardMaterial color="#445566" roughness={0.5} metalness={0.2} />
            </mesh>

            {/* Observation deck (glass) */}
            <mesh position={[0, 22, 0]} castShadow>
                <boxGeometry args={[6, 5, 6]} />
                <meshStandardMaterial
                    color="#88bbdd"
                    transparent
                    opacity={0.6}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Observation deck frame */}
            {[[-3, 22, 0], [3, 22, 0], [0, 22, -3], [0, 22, 3]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} castShadow>
                    <boxGeometry args={[0.3, 5, 0.3]} />
                    <meshStandardMaterial color="#334455" metalness={0.5} />
                </mesh>
            ))}

            {/* Roof */}
            <mesh position={[0, 25, 0]} castShadow>
                <boxGeometry args={[7, 0.5, 7]} />
                <meshStandardMaterial color="#334455" roughness={0.4} />
            </mesh>

            {/* Antenna mast */}
            <mesh position={[0, 30, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 10, 8]} />
                <meshStandardMaterial color="#ff3333" metalness={0.7} />
            </mesh>

            {/* Antenna top light */}
            <mesh position={[0, 35.5, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={1}
                />
            </mesh>

            {/* Radar dish */}
            <group position={[2, 26, 0]} rotation={[0, 0, -0.3]}>
                <mesh castShadow>
                    <cylinderGeometry args={[1.5, 1.5, 0.2, 16]} />
                    <meshStandardMaterial color="#aabbcc" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[0.2, 1, 0.2]} />
                    <meshStandardMaterial color="#667788" />
                </mesh>
            </group>
        </group>
    )
}

// Low-detail Control Tower (shown when far)
function ControlTowerLow() {
    return (
        <group>
            {/* Simple tower shape */}
            <mesh position={[0, 12.5, 0]}>
                <boxGeometry args={[5, 25, 5]} />
                <meshStandardMaterial color="#667788" />
            </mesh>
            {/* Observation deck simplified */}
            <mesh position={[0, 22, 0]}>
                <boxGeometry args={[6, 5, 6]} />
                <meshStandardMaterial color="#88bbdd" transparent opacity={0.5} />
            </mesh>
            {/* Antenna simplified */}
            <LODCylinder radius={0.15} height={12} color="#ff3333" />
            <mesh position={[0, 35.5, 0]}>
                <sphereGeometry args={[0.5, 6, 6]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
            </mesh>
        </group>
    )
}

// Main export with LOD wrapping
const TOWER_POSITION: [number, number, number] = [40, 0, -15]

export default function ControlTower() {
    return (
        <SimpleLOD
            position={TOWER_POSITION}
            threshold={200}
            highDetail={<ControlTowerHigh />}
            lowDetail={<ControlTowerLow />}
        />
    )
}
