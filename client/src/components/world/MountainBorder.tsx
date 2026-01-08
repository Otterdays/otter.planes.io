import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

// =====================================================
// MOUNTAIN BORDER - Dense ring of mountains around world edge
// Now using GPU instancing for massive performance gains!
// 200+ mountains × 5 meshes = 1000+ draw calls → 5 draw calls
// =====================================================

const MAP_RADIUS = 10000 // Distance from center to mountain border
const MOUNTAINS_PER_ROW = [48, 56, 64] // More mountains in outer rows

// Temp object for matrix calculations
const tempObject = new THREE.Object3D()

interface MountainData {
    position: [number, number, number]
    rotation: number
    height: number
    baseRadius: number
    hasSnow: boolean
    variant: number
}

export default function MountainBorder() {
    // Pre-calculate all mountain data
    const mountainData = useMemo(() => {
        const result: MountainData[] = []

        // Create multiple rows of mountains for depth
        MOUNTAINS_PER_ROW.forEach((count, rowIndex) => {
            const rowRadius = MAP_RADIUS + rowIndex * 1500 // Each row 1500 units further out

            for (let i = 0; i < count; i++) {
                const baseAngle = (i / count) * Math.PI * 2
                // Offset alternate rows for better coverage
                const angleOffset = rowIndex % 2 === 1 ? (Math.PI / count) : 0
                const angle = baseAngle + angleOffset

                // Add position variance
                const radiusVariance = (Math.random() - 0.5) * 800
                const angleVariance = (Math.random() - 0.5) * 0.05
                const finalAngle = angle + angleVariance
                const finalRadius = rowRadius + radiusVariance

                const x = Math.cos(finalAngle) * finalRadius
                const z = Math.sin(finalAngle) * finalRadius

                // Larger mountains in outer rows
                const height = 500 + rowIndex * 150 + Math.random() * 300
                const scale = 1.5 + rowIndex * 0.3 + Math.random() * 0.8
                const baseRadius = height * 0.7 * scale

                result.push({
                    position: [x, 0, z],
                    rotation: Math.random() * Math.PI * 2,
                    height,
                    baseRadius,
                    hasSnow: height > 550 || Math.random() > 0.4,
                    variant: Math.floor(Math.random() * 3),
                })
            }
        })

        // Add some gap-filler mountains between the rows
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = MAP_RADIUS + 500 + Math.random() * 2500
            const height = 300 + Math.random() * 250
            const scale = 0.8 + Math.random() * 0.6
            const baseRadius = height * 0.7 * scale

            result.push({
                position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
                rotation: Math.random() * Math.PI * 2,
                height,
                baseRadius,
                hasSnow: Math.random() > 0.5,
                variant: Math.floor(Math.random() * 3),
            })
        }

        return result
    }, [])

    // Separate mountains by type for instancing
    const withSnow = useMemo(() => {
        const result: MountainData[] = []

        mountainData.forEach(m => {
            if (m.hasSnow) {
                result.push(m)
            }
        })

        return result
    }, [mountainData])

    // Refs for instanced meshes
    const mainPeakRef = useRef<THREE.InstancedMesh>(null)
    const secondaryPeakRef = useRef<THREE.InstancedMesh>(null)
    const foothill1Ref = useRef<THREE.InstancedMesh>(null)
    const foothill2Ref = useRef<THREE.InstancedMesh>(null)
    const foothill3Ref = useRef<THREE.InstancedMesh>(null)
    const snowCapRef = useRef<THREE.InstancedMesh>(null)
    const snowCap2Ref = useRef<THREE.InstancedMesh>(null)

    // Create shared geometries
    const geometries = useMemo(() => ({
        mainPeak: new THREE.ConeGeometry(1, 1, 7),
        secondaryPeak: new THREE.ConeGeometry(1, 1, 6),
        foothill: new THREE.ConeGeometry(1, 1, 5),
        snowCap: new THREE.ConeGeometry(1, 1, 7),
    }), [])

    // Create shared materials with better textures
    const materials = useMemo(() => ({
        // Main rock - warmer gray with slight brown tint
        rock: new THREE.MeshStandardMaterial({
            color: '#5a5550',
            roughness: 0.92,
            flatShading: true,
        }),
        // Secondary rock - cooler darker gray
        rockDark: new THREE.MeshStandardMaterial({
            color: '#45433f',
            roughness: 0.95,
            flatShading: true,
        }),
        // Foothills - greenish gray for lower elevations
        foothill: new THREE.MeshStandardMaterial({
            color: '#556655',
            roughness: 0.9,
            flatShading: true,
        }),
        // Snow - bright white with slight blue tint
        snow: new THREE.MeshStandardMaterial({
            color: '#f8fcff',
            roughness: 0.4,
            metalness: 0.1,
        }),
        // Secondary snow - slightly off-white
        snowLight: new THREE.MeshStandardMaterial({
            color: '#e8f0f8',
            roughness: 0.35,
            metalness: 0.05,
        }),
    }), [])

    // Set up instance matrices
    useEffect(() => {
        if (!mainPeakRef.current) return

        // Main peaks (all mountains)
        mountainData.forEach((m, i) => {
            tempObject.position.set(m.position[0], m.height / 2, m.position[2])
            tempObject.rotation.set(0, m.rotation, 0)
            tempObject.scale.set(m.baseRadius, m.height, m.baseRadius)
            tempObject.updateMatrix()
            mainPeakRef.current!.setMatrixAt(i, tempObject.matrix)
        })
        mainPeakRef.current.instanceMatrix.needsUpdate = true

        // Secondary peaks
        if (secondaryPeakRef.current) {
            mountainData.forEach((m, i) => {
                const cos = Math.cos(m.rotation)
                const sin = Math.sin(m.rotation)
                const offsetX = m.baseRadius * 0.25
                const offsetZ = m.baseRadius * 0.15

                tempObject.position.set(
                    m.position[0] + offsetX * cos - offsetZ * sin,
                    m.height * 0.35,
                    m.position[2] + offsetX * sin + offsetZ * cos
                )
                tempObject.rotation.set(0.05, m.rotation + 0.4, 0.02)
                tempObject.scale.set(m.baseRadius * 0.65, m.height * 0.75, m.baseRadius * 0.65)
                tempObject.updateMatrix()
                secondaryPeakRef.current!.setMatrixAt(i, tempObject.matrix)
            })
            secondaryPeakRef.current.instanceMatrix.needsUpdate = true
        }

        // Foothills 1
        if (foothill1Ref.current) {
            mountainData.forEach((m, i) => {
                const cos = Math.cos(m.rotation)
                const sin = Math.sin(m.rotation)
                const offsetX = m.baseRadius * 0.6

                tempObject.position.set(
                    m.position[0] + offsetX * cos,
                    m.height * 0.06,
                    m.position[2] + offsetX * sin
                )
                tempObject.rotation.set(0, m.rotation, 0)
                tempObject.scale.set(m.baseRadius * 0.25, m.height * 0.15, m.baseRadius * 0.25)
                tempObject.updateMatrix()
                foothill1Ref.current!.setMatrixAt(i, tempObject.matrix)
            })
            foothill1Ref.current.instanceMatrix.needsUpdate = true
        }

        // Foothills 2
        if (foothill2Ref.current) {
            mountainData.forEach((m, i) => {
                const cos = Math.cos(m.rotation)
                const sin = Math.sin(m.rotation)
                const offsetX = -m.baseRadius * 0.5
                const offsetZ = m.baseRadius * 0.4

                tempObject.position.set(
                    m.position[0] + offsetX * cos - offsetZ * sin,
                    m.height * 0.05,
                    m.position[2] + offsetX * sin + offsetZ * cos
                )
                tempObject.rotation.set(0, m.rotation, 0)
                tempObject.scale.set(m.baseRadius * 0.2, m.height * 0.12, m.baseRadius * 0.2)
                tempObject.updateMatrix()
                foothill2Ref.current!.setMatrixAt(i, tempObject.matrix)
            })
            foothill2Ref.current.instanceMatrix.needsUpdate = true
        }

        // Foothills 3
        if (foothill3Ref.current) {
            mountainData.forEach((m, i) => {
                const cos = Math.cos(m.rotation)
                const sin = Math.sin(m.rotation)
                const offsetZ = -m.baseRadius * 0.55

                tempObject.position.set(
                    m.position[0] - offsetZ * sin,
                    m.height * 0.04,
                    m.position[2] + offsetZ * cos
                )
                tempObject.rotation.set(0, m.rotation, 0)
                tempObject.scale.set(m.baseRadius * 0.22, m.height * 0.1, m.baseRadius * 0.22)
                tempObject.updateMatrix()
                foothill3Ref.current!.setMatrixAt(i, tempObject.matrix)
            })
            foothill3Ref.current.instanceMatrix.needsUpdate = true
        }

        // Snow caps (only for mountains with snow)
        if (snowCapRef.current && withSnow.length > 0) {
            withSnow.forEach((m, i) => {
                tempObject.position.set(m.position[0], m.height * 0.88, m.position[2])
                tempObject.rotation.set(0, m.rotation, 0)
                tempObject.scale.set(m.baseRadius * 0.28, m.height * 0.22, m.baseRadius * 0.28)
                tempObject.updateMatrix()
                snowCapRef.current!.setMatrixAt(i, tempObject.matrix)
            })
            snowCapRef.current.instanceMatrix.needsUpdate = true
        }

        // Secondary snow caps
        if (snowCap2Ref.current && withSnow.length > 0) {
            withSnow.forEach((m, i) => {
                const cos = Math.cos(m.rotation)
                const sin = Math.sin(m.rotation)
                const offsetX = m.baseRadius * 0.08
                const offsetZ = m.baseRadius * 0.05

                tempObject.position.set(
                    m.position[0] + offsetX * cos - offsetZ * sin,
                    m.height * 0.78,
                    m.position[2] + offsetX * sin + offsetZ * cos
                )
                tempObject.rotation.set(0.08, m.rotation + 0.2, 0)
                tempObject.scale.set(m.baseRadius * 0.22, m.height * 0.18, m.baseRadius * 0.22)
                tempObject.updateMatrix()
                snowCap2Ref.current!.setMatrixAt(i, tempObject.matrix)
            })
            snowCap2Ref.current.instanceMatrix.needsUpdate = true
        }
    }, [mountainData, withSnow])

    const count = mountainData.length
    const snowCount = withSnow.length

    return (
        <group>
            {/* Main peaks - all mountains */}
            <instancedMesh
                ref={mainPeakRef}
                args={[geometries.mainPeak, materials.rock, count]}
                castShadow
                receiveShadow
                frustumCulled={false}
            />

            {/* Secondary peaks */}
            <instancedMesh
                ref={secondaryPeakRef}
                args={[geometries.secondaryPeak, materials.rockDark, count]}
                castShadow
                frustumCulled={false}
            />

            {/* Foothills */}
            <instancedMesh
                ref={foothill1Ref}
                args={[geometries.foothill, materials.foothill, count]}
                castShadow
                frustumCulled={false}
            />
            <instancedMesh
                ref={foothill2Ref}
                args={[geometries.foothill, materials.foothill, count]}
                castShadow
                frustumCulled={false}
            />
            <instancedMesh
                ref={foothill3Ref}
                args={[geometries.foothill, materials.foothill, count]}
                castShadow
                frustumCulled={false}
            />

            {/* Snow caps - only for snowy mountains */}
            {snowCount > 0 && (
                <>
                    <instancedMesh
                        ref={snowCapRef}
                        args={[geometries.snowCap, materials.snow, snowCount]}
                        frustumCulled={false}
                    />
                    <instancedMesh
                        ref={snowCap2Ref}
                        args={[geometries.snowCap, materials.snowLight, snowCount]}
                        frustumCulled={false}
                    />
                </>
            )}
        </group>
    )
}
