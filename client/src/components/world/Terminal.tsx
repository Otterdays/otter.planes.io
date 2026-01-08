// =====================================================
// TERMINAL - Airport passenger terminal with LOD support
// =====================================================

import { SimpleLOD } from '../../systems/LOD'

// High-detail Terminal (shown when close)
function TerminalHigh() {
    return (
        <group>
            {/* Main terminal building */}
            <mesh position={[0, 4, 0]} castShadow receiveShadow>
                <boxGeometry args={[40, 8, 15]} />
                <meshStandardMaterial color="#667788" roughness={0.6} />
            </mesh>

            {/* Curved roof */}
            <mesh position={[0, 9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[3, 3, 42, 16, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#445566" metalness={0.3} roughness={0.4} />
            </mesh>

            {/* Glass facade (front) */}
            <mesh position={[0, 4, 7.6]} castShadow>
                <boxGeometry args={[38, 6, 0.2]} />
                <meshStandardMaterial
                    color="#88aacc"
                    transparent
                    opacity={0.5}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Glass facade frames */}
            {Array.from({ length: 10 }, (_, i) => (
                <mesh key={i} position={[-17 + i * 4, 4, 7.7]} castShadow>
                    <boxGeometry args={[0.2, 6, 0.1]} />
                    <meshStandardMaterial color="#334455" />
                </mesh>
            ))}

            {/* Jetways (3 gates) */}
            {[-12, 0, 12].map((x, i) => (
                <group key={i} position={[x, 3, -10]}>
                    {/* Jetway tunnel */}
                    <mesh castShadow>
                        <boxGeometry args={[3, 2.5, 6]} />
                        <meshStandardMaterial color="#778899" roughness={0.7} />
                    </mesh>
                    {/* Jetway windows */}
                    <mesh position={[1.6, 0, 0]}>
                        <boxGeometry args={[0.1, 1.5, 5]} />
                        <meshStandardMaterial color="#88aacc" transparent opacity={0.6} />
                    </mesh>
                </group>
            ))}

            {/* Entrance canopy */}
            <mesh position={[0, 6, 12]} castShadow>
                <boxGeometry args={[20, 0.5, 8]} />
                <meshStandardMaterial color="#556677" metalness={0.4} />
            </mesh>

            {/* Canopy supports */}
            {[-8, 8].map((x, i) => (
                <mesh key={i} position={[x, 3, 14]} castShadow>
                    <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
                    <meshStandardMaterial color="#334455" metalness={0.6} />
                </mesh>
            ))}

            {/* Parking area */}
            <mesh position={[0, 0.01, 25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 20]} />
                <meshStandardMaterial color="#333333" roughness={0.9} />
            </mesh>

            {/* Parking space lines */}
            {Array.from({ length: 12 }, (_, i) => (
                <mesh key={i} position={[-22 + i * 4, 0.02, 25]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.2, 6]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
            ))}

            {/* Parked cars (simple boxes) */}
            {[[-18, 25], [-10, 25], [2, 25], [14, 25]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.7, pos[1]]} castShadow>
                    <boxGeometry args={[2, 1.4, 4]} />
                    <meshStandardMaterial color={['#cc3333', '#3366cc', '#33aa33', '#888888'][i]} />
                </mesh>
            ))}
        </group>
    )
}

// Low-detail Terminal (shown when far)
function TerminalLow() {
    return (
        <group>
            {/* Simplified main building */}
            <mesh position={[0, 5, 0]}>
                <boxGeometry args={[40, 10, 15]} />
                <meshStandardMaterial color="#667788" />
            </mesh>
            {/* Simplified roof */}
            <mesh position={[0, 10.5, 0]}>
                <boxGeometry args={[42, 1, 16]} />
                <meshStandardMaterial color="#445566" />
            </mesh>
            {/* Simplified parking */}
            <mesh position={[0, 0.01, 25]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[50, 20]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
        </group>
    )
}

// Main export with LOD wrapping
const TERMINAL_POSITION: [number, number, number] = [40, 0, 20]

export default function Terminal() {
    return (
        <SimpleLOD
            position={TERMINAL_POSITION}
            threshold={250}
            highDetail={<TerminalHigh />}
            lowDetail={<TerminalLow />}
        />
    )
}
