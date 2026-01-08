import { useMemo } from 'react'

// =====================================================
// MOUNTAIN - Single majestic mountain with snowy peak
// =====================================================

export default function Mountain() {
    // Mountain positioned far from airport
    const mountainPosition: [number, number, number] = [2000, 0, -1500]

    return (
        <group position={mountainPosition}>
            {/* Main mountain body (rocky base - 4/5 of height) */}
            <mesh position={[0, 150, 0]} castShadow receiveShadow>
                <coneGeometry args={[400, 400, 8]} />
                <meshStandardMaterial
                    color="#5a5a5a"
                    roughness={0.95}
                    flatShading
                />
            </mesh>

            {/* Rocky texture layer */}
            <mesh position={[50, 120, 30]} rotation={[0, 0.5, 0]} castShadow>
                <coneGeometry args={[350, 340, 6]} />
                <meshStandardMaterial
                    color="#4a4a4a"
                    roughness={0.9}
                    flatShading
                />
            </mesh>

            {/* Secondary peak */}
            <mesh position={[-120, 80, 60]} castShadow>
                <coneGeometry args={[200, 220, 6]} />
                <meshStandardMaterial
                    color="#555555"
                    roughness={0.95}
                    flatShading
                />
            </mesh>

            {/* Snowy peak (top 1/5 of height) */}
            <mesh position={[0, 320, 0]} castShadow>
                <coneGeometry args={[120, 100, 8]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.6}
                    metalness={0.1}
                />
            </mesh>

            {/* Snow cap details */}
            <mesh position={[20, 300, 15]} rotation={[0.1, 0.3, 0]}>
                <coneGeometry args={[100, 80, 6]} />
                <meshStandardMaterial
                    color="#f8f8ff"
                    roughness={0.5}
                />
            </mesh>

            {/* Snow patches on sides (irregular) */}
            {[
                { pos: [60, 250, 40], scale: 0.8, rot: 0.2 },
                { pos: [-50, 260, 50], scale: 0.7, rot: -0.3 },
                { pos: [30, 240, -60], scale: 0.6, rot: 0.4 },
                { pos: [-80, 220, -30], scale: 0.5, rot: -0.1 },
            ].map((patch, i) => (
                <mesh
                    key={i}
                    position={patch.pos as [number, number, number]}
                    rotation={[patch.rot, patch.rot * 2, 0]}
                >
                    <coneGeometry args={[60 * patch.scale, 50 * patch.scale, 5]} />
                    <meshStandardMaterial color="#eeeeff" roughness={0.7} />
                </mesh>
            ))}

            {/* Base foothills */}
            {[
                { pos: [250, 20, 100], size: 150 },
                { pos: [-200, 15, 150], size: 120 },
                { pos: [180, 18, -180], size: 140 },
                { pos: [-150, 12, -120], size: 100 },
            ].map((hill, i) => (
                <mesh
                    key={i}
                    position={[hill.pos[0], hill.pos[1], hill.pos[2]]}
                    castShadow
                >
                    <coneGeometry args={[hill.size, hill.size * 0.6, 6]} />
                    <meshStandardMaterial
                        color="#4d5a4d"
                        roughness={0.9}
                        flatShading
                    />
                </mesh>
            ))}

            {/* MT. DORP Hollywood-style sign */}
            <HollywoodSign />

            {/* Trees at base of mountain */}
            <MountainTrees />
        </group>
    )
}

// Small forest at the base of the mountain
function MountainTrees() {
    const treePositions = useMemo(() => {
        const positions: [number, number, number][] = []
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2
            const distance = 300 + Math.random() * 200
            positions.push([
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            ])
        }
        return positions
    }, [])

    return (
        <group>
            {treePositions.map((pos, i) => {
                const scale = 2 + Math.random() * 3
                return (
                    <group key={i} position={pos}>
                        {/* Trunk */}
                        <mesh position={[0, scale * 2, 0]} castShadow>
                            <cylinderGeometry args={[0.3 * scale, 0.5 * scale, scale * 4, 6]} />
                            <meshStandardMaterial color="#3d2817" roughness={0.95} />
                        </mesh>
                        {/* Foliage */}
                        <mesh position={[0, scale * 5, 0]} castShadow>
                            <coneGeometry args={[scale * 2, scale * 6, 6]} />
                            <meshStandardMaterial color="#1a3a1a" roughness={0.85} />
                        </mesh>
                    </group>
                )
            })}
        </group>
    )
}

// Hollywood-style "MT. DORP" sign
function HollywoodSign() {
    const letters = ['M', 'T', '.', 'D', 'O', 'R', 'P']
    const letterSpacing = 25
    const startX = -((letters.length - 1) * letterSpacing) / 2

    return (
        <group position={[0, 120, 280]} rotation={[0, Math.PI, 0]}>
            {letters.map((letter, i) => (
                <group key={i} position={[startX + i * letterSpacing, 0, 0]}>
                    {/* Letter support post */}
                    <mesh position={[0, -15, 0]} castShadow>
                        <boxGeometry args={[2, 30, 2]} />
                        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
                    </mesh>

                    {/* The letter itself */}
                    <mesh castShadow>
                        <boxGeometry args={[18, 25, 3]} />
                        <meshStandardMaterial
                            color="#ffffff"
                            roughness={0.3}
                            metalness={0.1}
                        />
                    </mesh>

                    {/* Letter face (painted) */}
                    <mesh position={[0, 0, 1.6]}>
                        <planeGeometry args={[16, 22]} />
                        <meshStandardMaterial
                            color="#ffffff"
                            emissive="#ffffff"
                            emissiveIntensity={0.1}
                        />
                    </mesh>

                    {/* Letter text (simple representation with boxes) */}
                    <LetterShape letter={letter} />
                </group>
            ))}
        </group>
    )
}

// Simple 3D letter shapes
function LetterShape({ letter }: { letter: string }) {
    const color = "#1a1a1a"

    switch (letter) {
        case 'M':
            return (
                <group position={[0, 0, 2]}>
                    <mesh position={[-5, 0, 0]}><boxGeometry args={[3, 20, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[5, 0, 0]}><boxGeometry args={[3, 20, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[-2.5, 5, 0]} rotation={[0, 0, 0.4]}><boxGeometry args={[2, 12, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[2.5, 5, 0]} rotation={[0, 0, -0.4]}><boxGeometry args={[2, 12, 1]} /><meshStandardMaterial color={color} /></mesh>
                </group>
            )
        case 'T':
            return (
                <group position={[0, 0, 2]}>
                    <mesh position={[0, 8, 0]}><boxGeometry args={[14, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, -2, 0]}><boxGeometry args={[3, 16, 1]} /><meshStandardMaterial color={color} /></mesh>
                </group>
            )
        case '.':
            return (
                <group position={[0, -8, 2]}>
                    <mesh><boxGeometry args={[4, 4, 1]} /><meshStandardMaterial color={color} /></mesh>
                </group>
            )
        case 'D':
            return (
                <group position={[0, 0, 2]}>
                    <mesh position={[-4, 0, 0]}><boxGeometry args={[3, 20, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, 8, 0]}><boxGeometry args={[8, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, -8, 0]}><boxGeometry args={[8, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[4, 0, 0]}><boxGeometry args={[3, 14, 1]} /><meshStandardMaterial color={color} /></mesh>
                </group>
            )
        case 'O':
            return (
                <group position={[0, 0, 2]}>
                    <mesh position={[-5, 0, 0]}><boxGeometry args={[3, 20, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[5, 0, 0]}><boxGeometry args={[3, 20, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, 8, 0]}><boxGeometry args={[8, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, -8, 0]}><boxGeometry args={[8, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                </group>
            )
        case 'R':
            return (
                <group position={[0, 0, 2]}>
                    <mesh position={[-4, 0, 0]}><boxGeometry args={[3, 20, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, 8, 0]}><boxGeometry args={[8, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, 1, 0]}><boxGeometry args={[8, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[4, 5, 0]}><boxGeometry args={[3, 8, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[3, -5, 0]} rotation={[0, 0, -0.5]}><boxGeometry args={[2, 12, 1]} /><meshStandardMaterial color={color} /></mesh>
                </group>
            )
        case 'P':
            return (
                <group position={[0, 0, 2]}>
                    <mesh position={[-4, 0, 0]}><boxGeometry args={[3, 20, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, 8, 0]}><boxGeometry args={[8, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0, 1, 0]}><boxGeometry args={[8, 3, 1]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[4, 5, 0]}><boxGeometry args={[3, 8, 1]} /><meshStandardMaterial color={color} /></mesh>
                </group>
            )
        default:
            return null
    }
}
