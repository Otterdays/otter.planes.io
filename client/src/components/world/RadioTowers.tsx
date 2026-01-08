import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// =====================================================
// RADIO TOWERS - Communication tower array with instancing
// =====================================================

const tempObject = new THREE.Object3D()

export default function RadioTowers() {
    return (
        <group position={[-800, 0, -600]}>
            {/* Main tower (tallest) */}
            <LatticeTower position={[0, 0, 0]} height={100} />

            {/* Secondary towers */}
            <LatticeTower position={[-60, 0, 40]} height={70} />
            <LatticeTower position={[50, 0, 30]} height={80} />

            {/* Equipment shack */}
            <mesh position={[0, 2, 40]} castShadow receiveShadow>
                <boxGeometry args={[8, 4, 6]} />
                <meshStandardMaterial color="#667788" roughness={0.7} />
            </mesh>
            <mesh position={[0, 4.3, 40]} castShadow>
                <boxGeometry args={[9, 0.6, 7]} />
                <meshStandardMaterial color="#555566" roughness={0.6} />
            </mesh>
            {/* AC unit */}
            <mesh position={[3, 1.5, 43.5]} castShadow>
                <boxGeometry args={[2, 1.5, 1]} />
                <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
            </mesh>

            {/* Instanced fence */}
            <InstancedFence />

            {/* Ground pad */}
            <mesh position={[0, 0.02, 20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[60, 60]} />
                <meshStandardMaterial color="#555555" roughness={0.95} />
            </mesh>
        </group>
    )
}

function LatticeTower({ position, height }: { position: [number, number, number], height: number }) {
    const lightRef = useRef<THREE.Mesh>(null)
    const blinkPhase = position[0] * 0.1 // Offset blink timing

    useFrame(() => {
        if (lightRef.current) {
            const intensity = Math.sin(Date.now() * 0.005 + blinkPhase) > 0.5 ? 1.5 : 0.2
            const material = lightRef.current.material as THREE.MeshStandardMaterial
            material.emissiveIntensity = intensity
        }
    })

    const baseWidth = height * 0.12
    const topWidth = height * 0.03
    const braceCount = Math.floor(height / 10)

    // Instanced horizontal braces
    const braceRef = useRef<THREE.InstancedMesh>(null)
    const braceRef2 = useRef<THREE.InstancedMesh>(null)

    const braceGeometry = useMemo(() => new THREE.BoxGeometry(1, 0.3, 0.3), [])
    const braceMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#885555' }), [])

    useEffect(() => {
        if (!braceRef.current || !braceRef2.current) return

        for (let i = 0; i < braceCount; i++) {
            const y = i * 10 + 5
            const width = baseWidth - i * (baseWidth - topWidth) / braceCount * 2

            // Horizontal brace 1
            tempObject.position.set(0, y, 0)
            tempObject.rotation.set(0, 0, 0)
            tempObject.scale.set(width, 1, 1)
            tempObject.updateMatrix()
            braceRef.current.setMatrixAt(i, tempObject.matrix)

            // Horizontal brace 2 (perpendicular)
            tempObject.rotation.set(0, Math.PI / 2, 0)
            tempObject.updateMatrix()
            braceRef2.current.setMatrixAt(i, tempObject.matrix)
        }

        braceRef.current.instanceMatrix.needsUpdate = true
        braceRef2.current.instanceMatrix.needsUpdate = true
    }, [braceCount, baseWidth, topWidth])

    return (
        <group position={position}>
            {/* Main structural legs (4 corners) - simplified to single tapered cylinder */}
            <mesh position={[0, height / 2, 0]} castShadow>
                <cylinderGeometry args={[topWidth, baseWidth, height, 8]} />
                <meshStandardMaterial color="#884444" roughness={0.7} />
            </mesh>

            {/* Instanced horizontal braces */}
            <instancedMesh ref={braceRef} args={[braceGeometry, braceMaterial, braceCount]} />
            <instancedMesh ref={braceRef2} args={[braceGeometry, braceMaterial, braceCount]} />

            {/* Antenna at top */}
            <mesh position={[0, height + 3, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 6, 6]} />
                <meshStandardMaterial color="#aaaaaa" metalness={0.7} />
            </mesh>

            {/* Dish antennas */}
            <mesh position={[2, height * 0.7, 0]} rotation={[0, 0, -0.3]} castShadow>
                <cylinderGeometry args={[1.5, 1.5, 0.3, 12]} />
                <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-1.5, height * 0.5, 1]} rotation={[0.2, 0.5, 0]} castShadow>
                <cylinderGeometry args={[1, 1, 0.2, 12]} />
                <meshStandardMaterial color="#dddddd" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Warning light (blinking red) */}
            <mesh ref={lightRef} position={[0, height + 6.5, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={1}
                />
            </mesh>

            {/* Mid-tower warning light */}
            <mesh position={[0, height * 0.5, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Base plate */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[baseWidth * 1.2, 8]} />
                <meshStandardMaterial color="#666666" roughness={0.9} />
            </mesh>
        </group>
    )
}

// Instanced fence component
function InstancedFence() {
    const postRef = useRef<THREE.InstancedMesh>(null)

    const fencePositions = useMemo(() => [
        // North side
        ...Array.from({ length: 8 }, (_, i) => [-28 + i * 8, 0, -10] as [number, number, number]),
        // South side
        ...Array.from({ length: 8 }, (_, i) => [-28 + i * 8, 0, 50] as [number, number, number]),
        // East side
        ...Array.from({ length: 8 }, (_, i) => [28, 0, -10 + i * 8] as [number, number, number]),
        // West side (partial, for gate)
        ...Array.from({ length: 5 }, (_, i) => [-28, 0, -10 + i * 8] as [number, number, number]),
    ], [])

    const postGeometry = useMemo(() => new THREE.BoxGeometry(0.1, 2.4, 0.1), [])
    const postMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#555555' }), [])

    useEffect(() => {
        if (!postRef.current) return

        fencePositions.forEach((pos, i) => {
            tempObject.position.set(pos[0], 1.2, pos[2])
            tempObject.rotation.set(0, 0, 0)
            tempObject.scale.set(1, 1, 1)
            tempObject.updateMatrix()
            postRef.current!.setMatrixAt(i, tempObject.matrix)
        })

        postRef.current.instanceMatrix.needsUpdate = true
    }, [fencePositions])

    return (
        <group>
            {/* Instanced fence posts */}
            <instancedMesh
                ref={postRef}
                args={[postGeometry, postMaterial, fencePositions.length]}
                castShadow
            />

            {/* Horizontal fence rails (kept as regular meshes - only 2) */}
            <mesh position={[0, 1, -10]} castShadow>
                <boxGeometry args={[56, 0.1, 0.1]} />
                <meshStandardMaterial color="#555555" />
            </mesh>
            <mesh position={[0, 2, -10]} castShadow>
                <boxGeometry args={[56, 0.1, 0.1]} />
                <meshStandardMaterial color="#555555" />
            </mesh>
        </group>
    )
}
