// =====================================================
// STRUCTURE INSTANCING SYSTEM
// GPU-accelerated rendering for repeated world objects
// 
// Instead of 200 draw calls for 200 mountains,
// we use 1 draw call per geometry type using InstancedMesh
// =====================================================

import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

// =====================================================
// TYPES
// =====================================================

export interface InstanceData {
    position: [number, number, number]
    rotation?: [number, number, number]  // Euler angles
    scale?: [number, number, number] | number
}

export interface InstancedMeshConfig {
    geometry: THREE.BufferGeometry
    material: THREE.Material
    instances: InstanceData[]
    castShadow?: boolean
    receiveShadow?: boolean
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const tempObject = new THREE.Object3D()

/**
 * Sets up an InstancedMesh with the given instance data
 */
export function setupInstancedMesh(
    mesh: THREE.InstancedMesh,
    instances: InstanceData[]
): void {
    instances.forEach((data, index) => {
        tempObject.position.set(...data.position)

        if (data.rotation) {
            tempObject.rotation.set(...data.rotation)
        } else {
            tempObject.rotation.set(0, 0, 0)
        }

        if (data.scale !== undefined) {
            if (typeof data.scale === 'number') {
                tempObject.scale.setScalar(data.scale)
            } else {
                tempObject.scale.set(...data.scale)
            }
        } else {
            tempObject.scale.set(1, 1, 1)
        }

        tempObject.updateMatrix()
        mesh.setMatrixAt(index, tempObject.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
}

// =====================================================
// INSTANCED MESH WRAPPER COMPONENT
// =====================================================

interface InstancedGroupProps {
    instances: InstanceData[]
    geometry: THREE.BufferGeometry
    material: THREE.Material | THREE.Material[]
    castShadow?: boolean
    receiveShadow?: boolean
    frustumCulled?: boolean
}

/**
 * A wrapper component for InstancedMesh that handles setup automatically
 */
export function InstancedGroup({
    instances,
    geometry,
    material,
    castShadow = false,
    receiveShadow = false,
    frustumCulled = true
}: InstancedGroupProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    useEffect(() => {
        if (meshRef.current) {
            setupInstancedMesh(meshRef.current, instances)
        }
    }, [instances])

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, Array.isArray(material) ? material[0] : material, instances.length]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            frustumCulled={frustumCulled}
        />
    )
}

// =====================================================
// MULTI-GEOMETRY INSTANCED RENDERER
// For objects with multiple parts (e.g., mountains with peaks and snow)
// =====================================================

interface MultiInstanceConfig {
    key: string
    geometry: THREE.BufferGeometry
    material: THREE.Material
    getTransform: (data: InstanceData, index: number) => InstanceData
}

interface MultiInstancedGroupProps {
    instances: InstanceData[]
    configs: MultiInstanceConfig[]
    castShadow?: boolean
    receiveShadow?: boolean
}

export function MultiInstancedGroup({
    instances,
    configs,
    castShadow = false,
    receiveShadow = false
}: MultiInstancedGroupProps) {
    const refs = useRef<Map<string, THREE.InstancedMesh>>(new Map())

    useEffect(() => {
        configs.forEach(config => {
            const mesh = refs.current.get(config.key)
            if (!mesh) return

            const transformedInstances = instances.map((data, i) => config.getTransform(data, i))
            setupInstancedMesh(mesh, transformedInstances)
        })
    }, [instances, configs])

    return (
        <group>
            {configs.map(config => (
                <instancedMesh
                    key={config.key}
                    ref={(mesh) => {
                        if (mesh) refs.current.set(config.key, mesh)
                    }}
                    args={[config.geometry, config.material, instances.length]}
                    castShadow={castShadow}
                    receiveShadow={receiveShadow}
                />
            ))}
        </group>
    )
}

// =====================================================
// PRE-BUILT INSTANCED COMPONENTS
// =====================================================

/**
 * Instanced Cones (great for trees, mountains, etc.)
 */
interface InstancedConesProps {
    instances: InstanceData[]
    radius?: number
    height?: number
    segments?: number
    color?: string
    castShadow?: boolean
    receiveShadow?: boolean
    flatShading?: boolean
}

export function InstancedCones({
    instances,
    radius = 1,
    height = 2,
    segments = 8,
    color = '#666666',
    castShadow = false,
    receiveShadow = false,
    flatShading = false
}: InstancedConesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    const geometry = useMemo(() => new THREE.ConeGeometry(radius, height, segments), [radius, height, segments])
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color,
        flatShading,
        roughness: 0.9
    }), [color, flatShading])

    useEffect(() => {
        if (meshRef.current) {
            setupInstancedMesh(meshRef.current, instances)
        }
    }, [instances])

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, instances.length]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        />
    )
}

/**
 * Instanced Boxes (great for buildings, crates, etc.)
 */
interface InstancedBoxesProps {
    instances: InstanceData[]
    size?: [number, number, number]
    color?: string
    castShadow?: boolean
    receiveShadow?: boolean
}

export function InstancedBoxes({
    instances,
    size = [1, 1, 1],
    color = '#666666',
    castShadow = false,
    receiveShadow = false
}: InstancedBoxesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    const geometry = useMemo(() => new THREE.BoxGeometry(...size), [size])
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.8 }), [color])

    useEffect(() => {
        if (meshRef.current) {
            setupInstancedMesh(meshRef.current, instances)
        }
    }, [instances])

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, instances.length]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        />
    )
}

/**
 * Instanced Cylinders (great for poles, towers, etc.)
 */
interface InstancedCylindersProps {
    instances: InstanceData[]
    radiusTop?: number
    radiusBottom?: number
    height?: number
    segments?: number
    color?: string
    castShadow?: boolean
    receiveShadow?: boolean
}

export function InstancedCylinders({
    instances,
    radiusTop = 0.5,
    radiusBottom = 0.5,
    height = 2,
    segments = 8,
    color = '#666666',
    castShadow = false,
    receiveShadow = false
}: InstancedCylindersProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    const geometry = useMemo(
        () => new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
        [radiusTop, radiusBottom, height, segments]
    )
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.7 }), [color])

    useEffect(() => {
        if (meshRef.current) {
            setupInstancedMesh(meshRef.current, instances)
        }
    }, [instances])

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, instances.length]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        />
    )
}

// =====================================================
// COMPOSABLE INSTANCED STRUCTURE
// For complex objects with multiple instanced parts
// =====================================================

export interface StructurePart {
    type: 'cone' | 'box' | 'cylinder' | 'sphere'
    offset: [number, number, number]  // Offset from base position
    rotation?: [number, number, number]
    scale?: [number, number, number] | number
    color: string
    // Geometry-specific props
    geometryArgs?: number[]
    flatShading?: boolean
}

export interface InstancedStructureProps {
    positions: [number, number, number][]
    rotations?: number[]  // Y rotation for each instance
    scales?: number[]     // Uniform scale for each instance
    parts: StructurePart[]
    castShadow?: boolean
    receiveShadow?: boolean
}

/**
 * Renders a complex structure at multiple positions using instancing
 * Each "part" is rendered as a separate instanced mesh
 */
export function InstancedStructure({
    positions,
    rotations,
    scales,
    parts,
    castShadow = false,
    receiveShadow = false
}: InstancedStructureProps) {
    const partRefs = useRef<THREE.InstancedMesh[]>([])

    // Create geometries and materials for each part
    const partsData = useMemo(() => {
        return parts.map(part => {
            let geometry: THREE.BufferGeometry

            switch (part.type) {
                case 'cone':
                    geometry = new THREE.ConeGeometry(...(part.geometryArgs || [1, 2, 8]) as [number, number, number])
                    break
                case 'box':
                    geometry = new THREE.BoxGeometry(...(part.geometryArgs || [1, 1, 1]) as [number, number, number])
                    break
                case 'cylinder':
                    geometry = new THREE.CylinderGeometry(...(part.geometryArgs || [0.5, 0.5, 1, 8]) as [number, number, number, number])
                    break
                case 'sphere':
                    geometry = new THREE.SphereGeometry(...(part.geometryArgs || [1, 16, 12]) as [number, number, number])
                    break
            }

            const material = new THREE.MeshStandardMaterial({
                color: part.color,
                flatShading: part.flatShading,
                roughness: 0.85
            })

            return { geometry, material, part }
        })
    }, [parts])

    // Set up instance matrices for each part
    useEffect(() => {
        partsData.forEach((data, partIndex) => {
            const mesh = partRefs.current[partIndex]
            if (!mesh) return

            positions.forEach((pos, instanceIndex) => {
                const instanceRotation = rotations?.[instanceIndex] ?? 0
                const instanceScale = scales?.[instanceIndex] ?? 1
                const { part } = data

                // Calculate world position with offset
                const cos = Math.cos(instanceRotation)
                const sin = Math.sin(instanceRotation)
                const offsetX = part.offset[0] * cos - part.offset[2] * sin
                const offsetZ = part.offset[0] * sin + part.offset[2] * cos

                tempObject.position.set(
                    pos[0] + offsetX * instanceScale,
                    pos[1] + part.offset[1] * instanceScale,
                    pos[2] + offsetZ * instanceScale
                )

                // Apply rotations
                tempObject.rotation.set(
                    part.rotation?.[0] ?? 0,
                    instanceRotation + (part.rotation?.[1] ?? 0),
                    part.rotation?.[2] ?? 0
                )

                // Apply scales
                if (part.scale !== undefined) {
                    if (typeof part.scale === 'number') {
                        tempObject.scale.setScalar(part.scale * instanceScale)
                    } else {
                        tempObject.scale.set(
                            part.scale[0] * instanceScale,
                            part.scale[1] * instanceScale,
                            part.scale[2] * instanceScale
                        )
                    }
                } else {
                    tempObject.scale.setScalar(instanceScale)
                }

                tempObject.updateMatrix()
                mesh.setMatrixAt(instanceIndex, tempObject.matrix)
            })

            mesh.instanceMatrix.needsUpdate = true
        })
    }, [positions, rotations, scales, partsData])

    return (
        <group>
            {partsData.map((data, index) => (
                <instancedMesh
                    key={index}
                    ref={(mesh) => {
                        if (mesh) partRefs.current[index] = mesh
                    }}
                    args={[data.geometry, data.material, positions.length]}
                    castShadow={castShadow}
                    receiveShadow={receiveShadow}
                />
            ))}
        </group>
    )
}

// =====================================================
// HELPER FUNCTIONS FOR GENERATING INSTANCE DATA
// =====================================================

/**
 * Generate grid positions
 */
export function generateGridPositions(
    countX: number,
    countZ: number,
    spacingX: number,
    spacingZ: number,
    centerX: number = 0,
    centerZ: number = 0,
    jitter: number = 0
): InstanceData[] {
    const instances: InstanceData[] = []
    const startX = centerX - (countX - 1) * spacingX / 2
    const startZ = centerZ - (countZ - 1) * spacingZ / 2

    for (let x = 0; x < countX; x++) {
        for (let z = 0; z < countZ; z++) {
            instances.push({
                position: [
                    startX + x * spacingX + (Math.random() - 0.5) * jitter,
                    0,
                    startZ + z * spacingZ + (Math.random() - 0.5) * jitter
                ],
                rotation: [0, Math.random() * Math.PI * 2, 0],
                scale: 0.8 + Math.random() * 0.4
            })
        }
    }

    return instances
}

/**
 * Generate circular/ring positions
 */
export function generateRingPositions(
    count: number,
    radius: number,
    centerX: number = 0,
    centerZ: number = 0,
    radiusJitter: number = 0,
    angleJitter: number = 0
): InstanceData[] {
    const instances: InstanceData[] = []

    for (let i = 0; i < count; i++) {
        const baseAngle = (i / count) * Math.PI * 2
        const angle = baseAngle + (Math.random() - 0.5) * angleJitter
        const r = radius + (Math.random() - 0.5) * radiusJitter

        instances.push({
            position: [
                centerX + Math.cos(angle) * r,
                0,
                centerZ + Math.sin(angle) * r
            ],
            rotation: [0, angle + Math.PI / 2, 0],  // Face outward
            scale: 0.8 + Math.random() * 0.4
        })
    }

    return instances
}

/**
 * Generate random scattered positions
 */
export function generateScatteredPositions(
    count: number,
    rangeX: number,
    rangeZ: number,
    centerX: number = 0,
    centerZ: number = 0,
    minDistance: number = 0
): InstanceData[] {
    const instances: InstanceData[] = []
    const attempts = count * 10  // Max attempts to find valid positions
    let placed = 0

    for (let attempt = 0; attempt < attempts && placed < count; attempt++) {
        const x = centerX + (Math.random() - 0.5) * rangeX
        const z = centerZ + (Math.random() - 0.5) * rangeZ

        // Check minimum distance
        let valid = true
        if (minDistance > 0) {
            for (const instance of instances) {
                const dx = x - instance.position[0]
                const dz = z - instance.position[2]
                if (Math.sqrt(dx * dx + dz * dz) < minDistance) {
                    valid = false
                    break
                }
            }
        }

        if (valid) {
            instances.push({
                position: [x, 0, z],
                rotation: [0, Math.random() * Math.PI * 2, 0],
                scale: 0.7 + Math.random() * 0.6
            })
            placed++
        }
    }

    return instances
}
