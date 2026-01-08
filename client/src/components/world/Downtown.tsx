import { useMemo } from 'react'

// =====================================================
// DOWNTOWN - City skyline with skyscrapers
// =====================================================

interface Building {
    x: number
    z: number
    width: number
    depth: number
    height: number
    color: string
    hasAntenna: boolean
    windowColor: string
}

function generateBuildings(): Building[] {
    const buildings: Building[] = []
    const gridSize = 8
    const spacing = 80

    for (let gx = 0; gx < gridSize; gx++) {
        for (let gz = 0; gz < gridSize; gz++) {
            // Skip some spots for variety
            if (Math.random() < 0.15) continue

            const x = (gx - gridSize / 2) * spacing + (Math.random() - 0.5) * 20
            const z = (gz - gridSize / 2) * spacing + (Math.random() - 0.5) * 20

            // Taller in center
            const distFromCenter = Math.sqrt(
                Math.pow(gx - gridSize / 2, 2) + Math.pow(gz - gridSize / 2, 2)
            )
            const maxHeight = 250 - distFromCenter * 25
            const height = 40 + Math.random() * Math.max(50, maxHeight)

            // Building colors - glass and steel
            const colorOptions = [
                '#445566', '#556677', '#334455', '#4a5a6a',
                '#667788', '#3a4a5a', '#5a6a7a', '#2a3a4a'
            ]
            const windowColors = ['#aaccff', '#88aadd', '#99bbee', '#77aacc']

            buildings.push({
                x,
                z,
                width: 25 + Math.random() * 25,
                depth: 25 + Math.random() * 25,
                height,
                color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
                hasAntenna: height > 150 && Math.random() > 0.5,
                windowColor: windowColors[Math.floor(Math.random() * windowColors.length)]
            })
        }
    }

    return buildings
}

export default function Downtown() {
    const buildings = useMemo(() => generateBuildings(), [])

    return (
        <group position={[3000, 0, -3000]}>
            {/* Ground base for city - raised to prevent z-fighting with terrain */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} receiveShadow>
                <planeGeometry args={[800, 800]} />
                <meshStandardMaterial color="#333333" roughness={0.9} />
            </mesh>

            {/* Buildings */}
            {buildings.map((building, i) => (
                <group key={i} position={[building.x, 0, building.z]}>
                    {/* Main structure */}
                    <mesh
                        position={[0, building.height / 2, 0]}
                        castShadow
                        receiveShadow
                    >
                        <boxGeometry args={[building.width, building.height, building.depth]} />
                        <meshStandardMaterial
                            color={building.color}
                            roughness={0.3}
                            metalness={0.6}
                        />
                    </mesh>

                    {/* Window grid pattern - front */}
                    <mesh position={[0, building.height / 2, building.depth / 2 + 0.1]}>
                        <planeGeometry args={[building.width * 0.9, building.height * 0.9]} />
                        <meshStandardMaterial
                            color={building.windowColor}
                            emissive={building.windowColor}
                            emissiveIntensity={0.15}
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </mesh>

                    {/* Window grid pattern - back */}
                    <mesh
                        position={[0, building.height / 2, -building.depth / 2 - 0.1]}
                        rotation={[0, Math.PI, 0]}
                    >
                        <planeGeometry args={[building.width * 0.9, building.height * 0.9]} />
                        <meshStandardMaterial
                            color={building.windowColor}
                            emissive={building.windowColor}
                            emissiveIntensity={0.15}
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </mesh>

                    {/* Roof details */}
                    <mesh position={[0, building.height + 1, 0]} castShadow>
                        <boxGeometry args={[building.width * 0.8, 2, building.depth * 0.8]} />
                        <meshStandardMaterial color="#222222" />
                    </mesh>

                    {/* AC units on roof */}
                    {building.height > 60 && (
                        <>
                            <mesh position={[building.width * 0.2, building.height + 3, 0]} castShadow>
                                <boxGeometry args={[4, 3, 4]} />
                                <meshStandardMaterial color="#666666" />
                            </mesh>
                            <mesh position={[-building.width * 0.2, building.height + 3, 0]} castShadow>
                                <boxGeometry args={[4, 3, 4]} />
                                <meshStandardMaterial color="#666666" />
                            </mesh>
                        </>
                    )}

                    {/* Antenna for tall buildings */}
                    {building.hasAntenna && (
                        <group position={[0, building.height, 0]}>
                            <mesh position={[0, 15, 0]} castShadow>
                                <cylinderGeometry args={[0.3, 0.5, 30, 6]} />
                                <meshStandardMaterial color="#888888" metalness={0.8} />
                            </mesh>
                            {/* Blinking light */}
                            <mesh position={[0, 30, 0]}>
                                <sphereGeometry args={[0.8, 8, 8]} />
                                <meshStandardMaterial
                                    color="#ff0000"
                                    emissive="#ff0000"
                                    emissiveIntensity={0.8}
                                />
                            </mesh>
                        </group>
                    )}
                </group>
            ))}

            {/* Central plaza / park */}
            <group position={[0, 0, 0]}>
                {/* Grass area */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} receiveShadow>
                    <circleGeometry args={[60, 32]} />
                    <meshStandardMaterial color="#3a5a3a" />
                </mesh>

                {/* Fountain */}
                <mesh position={[0, 2, 0]} castShadow>
                    <cylinderGeometry args={[8, 10, 4, 16]} />
                    <meshStandardMaterial color="#888899" />
                </mesh>
                <mesh position={[0, 1.5, 0]}>
                    <cylinderGeometry args={[7, 7, 1.5, 16]} />
                    <meshStandardMaterial
                        color="#44aacc"
                        roughness={0.1}
                        metalness={0.5}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
                {/* Fountain spray (visual representation) */}
                <mesh position={[0, 6, 0]}>
                    <coneGeometry args={[2, 6, 8]} />
                    <meshStandardMaterial
                        color="#aaddff"
                        transparent
                        opacity={0.3}
                    />
                </mesh>

                {/* Trees around plaza */}
                {Array.from({ length: 8 }, (_, i) => {
                    const angle = (i / 8) * Math.PI * 2
                    const x = Math.cos(angle) * 50
                    const z = Math.sin(angle) * 50
                    return (
                        <group key={i} position={[x, 0, z]}>
                            <mesh position={[0, 5, 0]} castShadow>
                                <cylinderGeometry args={[0.5, 0.7, 10, 8]} />
                                <meshStandardMaterial color="#5a4030" />
                            </mesh>
                            <mesh position={[0, 12, 0]} castShadow>
                                <sphereGeometry args={[6, 8, 8]} />
                                <meshStandardMaterial color="#2a5a2a" flatShading />
                            </mesh>
                        </group>
                    )
                })}
            </group>

            {/* Main street grid */}
            {[-160, 0, 160].map((offset, i) => (
                <group key={`street-${i}`}>
                    {/* NS streets */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.06, 0]}>
                        <planeGeometry args={[20, 700]} />
                        <meshStandardMaterial color="#222222" />
                    </mesh>
                    {/* EW streets */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, offset]}>
                        <planeGeometry args={[700, 20]} />
                        <meshStandardMaterial color="#222222" />
                    </mesh>
                </group>
            ))}

            {/* Street lights along main roads */}
            {[-200, -120, -40, 40, 120, 200].map((pos, i) => (
                <group key={`light-${i}`}>
                    {/* East side */}
                    <group position={[175, 0, pos]}>
                        <mesh position={[0, 6, 0]} castShadow>
                            <cylinderGeometry args={[0.2, 0.25, 12, 8]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                        <mesh position={[0, 12, 0]}>
                            <sphereGeometry args={[0.8, 8, 8]} />
                            <meshStandardMaterial
                                color="#ffee99"
                                emissive="#ffcc44"
                                emissiveIntensity={0.5}
                            />
                        </mesh>
                    </group>
                    {/* West side */}
                    <group position={[-175, 0, pos]}>
                        <mesh position={[0, 6, 0]} castShadow>
                            <cylinderGeometry args={[0.2, 0.25, 12, 8]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                        <mesh position={[0, 12, 0]}>
                            <sphereGeometry args={[0.8, 8, 8]} />
                            <meshStandardMaterial
                                color="#ffee99"
                                emissive="#ffcc44"
                                emissiveIntensity={0.5}
                            />
                        </mesh>
                    </group>
                </group>
            ))}

            {/* ICONIC TOWER - Otter City Tower (tallest building) */}
            <group position={[80, 0, -80]}>
                {/* Main tower base */}
                <mesh position={[0, 25, 0]} castShadow>
                    <boxGeometry args={[50, 50, 50]} />
                    <meshStandardMaterial color="#556688" metalness={0.7} roughness={0.2} />
                </mesh>
                {/* Middle section - tapered */}
                <mesh position={[0, 100, 0]} castShadow>
                    <boxGeometry args={[40, 100, 40]} />
                    <meshStandardMaterial color="#4a5a7a" metalness={0.7} roughness={0.2} />
                </mesh>
                {/* Upper section */}
                <mesh position={[0, 200, 0]} castShadow>
                    <boxGeometry args={[30, 100, 30]} />
                    <meshStandardMaterial color="#3a4a6a" metalness={0.8} roughness={0.15} />
                </mesh>
                {/* Spire */}
                <mesh position={[0, 280, 0]} castShadow>
                    <cylinderGeometry args={[2, 8, 60, 8]} />
                    <meshStandardMaterial color="#aabbcc" metalness={0.9} />
                </mesh>
                {/* Crown */}
                <mesh position={[0, 250, 0]} castShadow>
                    <boxGeometry args={[35, 10, 35]} />
                    <meshStandardMaterial color="#99aacc" metalness={0.8} />
                </mesh>
                {/* Observation deck */}
                <mesh position={[0, 245, 0]}>
                    <ringGeometry args={[14, 18, 12]} />
                    <meshStandardMaterial color="#445566" />
                </mesh>
                {/* Blinking aviation light */}
                <mesh position={[0, 310, 0]}>
                    <sphereGeometry args={[1.5, 8, 8]} />
                    <meshStandardMaterial
                        color="#ff0000"
                        emissive="#ff0000"
                        emissiveIntensity={1}
                    />
                </mesh>
            </group>

            {/* Park benches around plaza */}
            {[
                { x: 40, z: 25, rotation: 0.5 },
                { x: -40, z: 25, rotation: -0.5 },
                { x: 40, z: -25, rotation: 2.5 },
                { x: -40, z: -25, rotation: -2.5 },
            ].map((bench, i) => (
                <group key={`bench-${i}`} position={[bench.x, 0, bench.z]} rotation={[0, bench.rotation, 0]}>
                    {/* Seat */}
                    <mesh position={[0, 0.5, 0]} castShadow>
                        <boxGeometry args={[3, 0.2, 1]} />
                        <meshStandardMaterial color="#8b5a2b" />
                    </mesh>
                    {/* Back */}
                    <mesh position={[0, 1, -0.4]} rotation={[-0.2, 0, 0]} castShadow>
                        <boxGeometry args={[3, 0.8, 0.15]} />
                        <meshStandardMaterial color="#8b5a2b" />
                    </mesh>
                    {/* Legs */}
                    <mesh position={[-1.2, 0.25, 0]}>
                        <boxGeometry args={[0.15, 0.5, 0.8]} />
                        <meshStandardMaterial color="#333333" />
                    </mesh>
                    <mesh position={[1.2, 0.25, 0]}>
                        <boxGeometry args={[0.15, 0.5, 0.8]} />
                        <meshStandardMaterial color="#333333" />
                    </mesh>
                </group>
            ))}

            {/* Parked cars on streets */}
            {[
                { x: 185, z: -50, color: '#cc4444', rotation: 0 },
                { x: 185, z: 30, color: '#4444cc', rotation: 0 },
                { x: 185, z: 80, color: '#44cc44', rotation: 0 },
                { x: -185, z: -80, color: '#cccc44', rotation: Math.PI },
                { x: -185, z: 0, color: '#888888', rotation: Math.PI },
                { x: -185, z: 100, color: '#44cccc', rotation: Math.PI },
            ].map((car, i) => (
                <group key={`car-${i}`} position={[car.x, 0, car.z]} rotation={[0, car.rotation, 0]}>
                    {/* Body */}
                    <mesh position={[0, 0.6, 0]} castShadow>
                        <boxGeometry args={[4, 1, 2]} />
                        <meshStandardMaterial color={car.color} metalness={0.5} roughness={0.4} />
                    </mesh>
                    {/* Cabin */}
                    <mesh position={[0.3, 1.2, 0]} castShadow>
                        <boxGeometry args={[2, 0.8, 1.8]} />
                        <meshStandardMaterial color="#222222" />
                    </mesh>
                    {/* Windows */}
                    <mesh position={[0.3, 1.2, 0.91]}>
                        <planeGeometry args={[1.8, 0.6]} />
                        <meshStandardMaterial color="#88aacc" metalness={0.9} roughness={0.1} />
                    </mesh>
                    {/* Wheels */}
                    {[[-1.2, -0.8], [-1.2, 0.8], [1.2, -0.8], [1.2, 0.8]].map(([x, z], j) => (
                        <mesh key={j} position={[x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
                            <meshStandardMaterial color="#111111" />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* Crosswalks at intersections */}
            {[
                { x: 0, z: 70 },
                { x: 0, z: -70 },
                { x: 70, z: 0 },
                { x: -70, z: 0 },
            ].map((crosswalk, i) => (
                <group key={`crosswalk-${i}`} position={[crosswalk.x, 0.07, crosswalk.z]}>
                    {[-4, -2, 0, 2, 4].map((offset, j) => (
                        <mesh key={j} rotation={[-Math.PI / 2, 0, i < 2 ? 0 : Math.PI / 2]} position={[i < 2 ? offset : 0, 0, i < 2 ? 0 : offset]}>
                            <planeGeometry args={[1.5, 8]} />
                            <meshStandardMaterial color="#ffffff" />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    )
}
