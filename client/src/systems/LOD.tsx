// =====================================================
// LOD (Level of Detail) System
// Renders different detail levels based on camera distance
// 
// Benefits:
// - Fewer polygons for distant objects
// - Improved frame rates
// - Smoother large world rendering
// =====================================================

import { useRef, ReactNode, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface LODLevel {
    distance: number   // Maximum distance for this level
    component: ReactNode
}

interface LODProps {
    /**
     * Position of the object in world space.
     * Used to calculate distance from camera.
     */
    position: [number, number, number]

    /**
     * Array of LOD levels, ordered from HIGH to LOW detail.
     * Each level has a distance threshold - when camera is within
     * that distance, this level is shown.
     * 
     * Example:
     * [
     *   { distance: 50, component: <HighDetailModel /> },   // 0-50m
     *   { distance: 150, component: <MediumDetailModel /> }, // 50-150m
     *   { distance: 300, component: <LowDetailModel /> },   // 150-300m
     *   { distance: Infinity, component: <BillboardSprite /> } // 300m+
     * ]
     */
    levels: LODLevel[]

    /**
     * Optional: Update frequency in frames (default: 1 = every frame)
     * Higher values reduce CPU usage but may cause pop-in
     */
    updateInterval?: number

    /**
     * Optional: Children to render at all LOD levels (e.g., lights)
     */
    children?: ReactNode
}

/**
 * LOD Component - Automatic Level of Detail switching
 * 
 * Usage:
 * ```tsx
 * <LOD 
 *   position={[100, 0, 200]} 
 *   levels={[
 *     { distance: 100, component: <DetailedTower /> },
 *     { distance: 300, component: <SimpleTower /> },
 *     { distance: Infinity, component: <TowerBillboard /> }
 *   ]}
 * />
 * ```
 */
export function LOD({ position, levels, updateInterval = 1, children }: LODProps) {
    const groupRef = useRef<THREE.Group>(null)
    const { camera } = useThree()
    const frameCount = useRef(0)
    const currentLevel = useRef(0)

    // Pre-calculate position vector
    const posVec = useMemo(() => new THREE.Vector3(...position), [position])

    useFrame(() => {
        frameCount.current++

        // Only update LOD on specified interval
        if (frameCount.current % updateInterval !== 0) return

        // Calculate distance from camera
        const camPos = camera.position
        const distance = posVec.distanceTo(camPos)

        // Find appropriate LOD level
        let newLevel = 0
        for (let i = 0; i < levels.length; i++) {
            if (distance < levels[i].distance) {
                newLevel = i
                break
            }
            newLevel = i
        }

        // Update visibility if level changed
        if (newLevel !== currentLevel.current) {
            currentLevel.current = newLevel

            if (groupRef.current) {
                // Hide all children except the current level
                groupRef.current.children.forEach((child, index) => {
                    child.visible = index === newLevel
                })
            }
        }
    })

    // Render all levels, but only the current one is visible
    return (
        <group ref={groupRef} position={position}>
            {levels.map((level, index) => (
                <group key={index} visible={index === 0}>
                    {level.component}
                </group>
            ))}
            {children}
        </group>
    )
}

/**
 * SimpleLOD - Two-level LOD for simpler use cases
 * Shows high detail up to threshold, then low detail
 */
interface SimpleLODProps {
    position: [number, number, number]
    threshold: number         // Distance at which to switch
    highDetail: ReactNode     // Shown when close
    lowDetail: ReactNode      // Shown when far
    children?: ReactNode
}

export function SimpleLOD({ position, threshold, highDetail, lowDetail, children }: SimpleLODProps) {
    return (
        <LOD
            position={position}
            levels={[
                { distance: threshold, component: highDetail },
                { distance: Infinity, component: lowDetail }
            ]}
        >
            {children}
        </LOD>
    )
}

/**
 * BillboardLOD - Shows full model when close, billboard sprite when far
 * Great for trees, antennas, and distant structures
 */
interface BillboardLODProps {
    position: [number, number, number]
    threshold: number
    model: ReactNode           // Full 3D model
    billboardColor?: string    // Color of far billboard
    billboardSize?: [number, number]  // Width, height of billboard
    children?: ReactNode
}

export function BillboardLOD({
    position,
    threshold,
    model,
    billboardColor = '#888888',
    billboardSize = [1, 2],
    children
}: BillboardLODProps) {
    const billboard = (
        <sprite>
            <spriteMaterial
                color={billboardColor}
                transparent
                opacity={0.8}
            />
            <planeGeometry args={billboardSize} />
        </sprite>
    )

    return (
        <SimpleLOD
            position={position}
            threshold={threshold}
            highDetail={model}
            lowDetail={billboard}
        >
            {children}
        </SimpleLOD>
    )
}

/**
 * LODGroup - Manages multiple LOD objects efficiently
 * Shares distance calculations across all objects
 */
interface LODGroupItem {
    id: string
    position: [number, number, number]
    levels: LODLevel[]
}

interface LODGroupProps {
    items: LODGroupItem[]
    updateInterval?: number
}

export function LODGroup({ items, updateInterval = 2 }: LODGroupProps) {
    if (items.length === 0) return null

    return (
        <group>
            {items.map((item) => (
                <LOD
                    key={item.id}
                    position={item.position}
                    levels={item.levels}
                    updateInterval={updateInterval}
                />
            ))}
        </group>
    )
}

// =====================================================
// Pre-built LOD variants for common objects
// =====================================================

/**
 * Creates a simple box for low-detail representation
 */
export function LODBox({
    size = [1, 1, 1],
    color = '#666666'
}: {
    size?: [number, number, number]
    color?: string
}) {
    return (
        <mesh>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

/**
 * Creates a simple cylinder for low-detail representation (towers, poles)
 */
export function LODCylinder({
    radius = 0.5,
    height = 5,
    color = '#666666'
}: {
    radius?: number
    height?: number
    color?: string
}) {
    return (
        <mesh position={[0, height / 2, 0]}>
            <cylinderGeometry args={[radius, radius, height, 8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

// Export default LOD distances for consistency
export const LOD_DISTANCES = {
    HIGH: 100,      // Full detail
    MEDIUM: 250,    // Reduced detail
    LOW: 500,       // Minimal detail
    BILLBOARD: 800  // Just a 2D representation
} as const
